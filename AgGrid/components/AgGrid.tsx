/*
 * MyAgGridComponent.tsx
 * Description: React component for displaying data using Ag Grid in TypeScript - Modified for OVV account reconciliation uses
 * Author: Dixit Joshi
 * Modified by: Gabe Williams
 * Version: 1.2.0.1
 * License: MIT
 */

import React, { useState, useEffect, useMemo, useRef} from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Theme CSS
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import 'ag-grid-enterprise';
import Theme from './Theme';
import {option} from './Theme';
import '../css/grid.css'
import { IInputs } from '../generated/ManifestTypes';
import styled from 'styled-components';
import { ExcelExportModule, LicenseManager } from 'ag-grid-enterprise';
import { GridApi, ValueFormatterParams } from 'ag-grid-community';

interface MyAgGridProps {
    inputData: string | null;
    enableRowGroupColumns: string | null;
    pivotColumns: string | null;
    aggFuncColumns: string | null;
    onDataChange: (data: any) => void;
    height: number;
    gridLock: string;
}

const Button = styled.button`
    background-color: #BD472A; /* OVV Rust */
    color: white;
    padding: 5px 15px;
    border-radius: 0px;
    outline: 0;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
    cusor: pointer;
    transition: ease background-color 250ms;
    &:hover {
        background-color: #6A2817; /* OVV Dark Rust */
    }
    `;

const AltButton = styled.button`
    background-color: #9E9E9E; 
    color: white;
    padding: 5px 15px;
    border-radius: 0px;
    outline: 0;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
    cusor: pointer;
    transition: ease background-color 250ms;
    &:hover {
        background-color: #616161;
    }
    `;

    function currencyFormatter(params: ValueFormatterParams) {
        const value = params.value;
        if (isNaN(value)) {
            return "";
        }
        if(value < 0) {
            return '(' + Math.abs(value).toString() + ')';
        } else {
            return value.toString();
        }
    }

    function amountComparator(value1: string, value2: string) {
        const value1Number = amountToComparableNumber(value1);
        const value2Number = amountToComparableNumber(value2);
        if (value1Number === null && value2Number === null) {
            return 0;
        }
        if (value1Number === null) {
            return -1;
        }
        if (value2Number === null) {
            return 1;
        }

        return value1Number - value2Number;
    }

    function amountToComparableNumber(amount: string) {
        if (amount === null || amount === undefined || amount === '') {
            return null;
        }
        if (amount.startsWith('(') && amount.endsWith(')')) {
            return -1 * Number(amount.substring(1, amount.length - 1));
        } else {
            return Number(amount);
        }
    }

    const AgGrid: React.FC<MyAgGridProps> = React.memo(({ inputData, enableRowGroupColumns, pivotColumns, aggFuncColumns, onDataChange, height, gridLock}) => {
    console.log('AG Grid')
    const [divClass, setDivClass] = useState('ag-theme-alpine');
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [rowData, setRowData] = useState<any[]>([]);
    const [autoDefName, setAutoDefName] = useState("athlete");
    const [columnDefs, setColumnDefs] = useState([]);
    const gridRef = useRef<AgGridReact>(null);
    useEffect(() => {
        const fetchData = async () => {
            let data: any = [];
            if (inputData) {
                try {
                    data = JSON.parse(inputData);
                }catch(error) {
                    console.error('Error parsing collection data:', error);
                }
            }
            // const response = await fetch('https://www.ag-grid.com/example-assets/olympic-winners.json');
            try {
                //const response = await fetch(`${apiUrl}`);
                setRowData(data);
            } catch (error) {
                setRowData([]);
                console.log('error')
            }

            if (data && data.length > 0) {
                const headers = Object.keys(data[0]);
                setAutoDefName(headers[0]);

                const aggFunc: string[] = aggFuncColumns?.split(";") || [];

                const columnTypes: any = {
                    currency: {
                        valueFormatter: currencyFormatter
                    }
                };
                
                const dynamicColumnDefs: any = headers.map(header => ({
                    field: header,
                    type: header === 'Amount'? 'currency' : null,
                    aggFunc: aggFunc.includes(header) ? 'sum' : null,
                    floatingFilter: true
                }));
                setColumnDefs(dynamicColumnDefs);
            }
        }
        fetchData();

    }, [inputData, enableRowGroupColumns, pivotColumns, aggFuncColumns])
    const autoGroupColumnDef = useMemo(() => {
        return {
            minWidth: 270,
            field: autoDefName,
            headerCheckboxSelection: true,
            cellRendererParams: {
                checkbox: true,
            },
        };
    }, [autoDefName]);

    const gridOptions = {
        sideBar: {
            toolPanels: [
                {
                    id: 'columns',
                    labelDefault: 'Columns',
                    labelKey: 'columns',
                    iconKey: 'columns',
                    toolPanel: 'agColumnsToolPanel',
                    toolPanelParams: {
                        suppressPivotMode: true, // Disable pivot mode toggle
                        suppresssRowGroups: true, // Disable row group toggle
                    },
                },
                {
                    id: 'filters',
                    labelDefault: 'Filters',
                    labelKey: 'filters',
                    iconKey: 'filter',
                    toolPanel: 'agFiltersToolPanel',
                },
            ],
        },
        columnDefs: columnDefs,
        suppressAggFuncInHeader: true,
        columnTypes: {
            currency: {
                flex: 1,
                minWidth: 150,
                filter: 'agNumberColumnFilter',
                floatingFilter: true,
                resizable: true,
                editable: gridLock === 'true',
                valueFormatter: currencyFormatter,
                comparator: amountComparator,
            }
        },
        defaultColDef: {
            flex: 1,
            minWidth: 150,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            resizable: true,
            editable: gridLock === 'true',
        },
        enableRangeSelection: true,
        statusBar: {
            statusPanels: [
                { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
                { statusPanel: 'agTotalRowCountComponent', align: 'center' },
                { statusPanel: 'agFilteredRowCountComponent' },
                { statusPanel: 'agSelectedRowCountComponent' },
                { statusPanel: 'agAggregationComponent' },
            ]
        },
        pivotMode: false,
    };
    const handleThemeChange = (selectedOption: string) => {
        setSelectedOption(selectedOption)
        setDivClass(selectedOption);
    };

    const onSave = () => {
        if (gridRef.current && gridRef.current.api) {
            const currentData: any[] = [];
            gridRef.current.api.forEachNode((node) => currentData.push(node.data));
            onDataChange(currentData);
        }
    };

    const onExcelExport = () => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.exportDataAsExcel();
        }
    };

    
    return (
        <div className={divClass} style={{ height: `${height}px` }}>
            <Theme options={option} onSelect={handleThemeChange} />
            {gridLock === 'true' && (<Button onClick={onSave} style={{ margin: '10px' }}>Save to dataverse</Button>)}
            <AltButton onClick={onExcelExport} style={{ margin: '10px' }}>Export to Excel</AltButton>
            < AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                autoGroupColumnDef={autoGroupColumnDef}
                gridOptions={gridOptions}
                rowGroupPanelShow='never'
                pagination={false}
                rowSelection={'multiple'}
                groupSelectsChildren={true}
                pivotPanelShow='never'
                tooltipShowDelay={500}
                ref={gridRef}
            />
        </div>
    );
});

export default AgGrid;