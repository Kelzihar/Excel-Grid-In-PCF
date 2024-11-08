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

interface MyAgGridProps {
    inputData: string | null;
    enableRowGroupColumns: string | null;
    pivotColumns: string | null;
    aggFuncColumns: string | null;
    onDataChange: (data: any) => void;
}

const AgGrid: React.FC<MyAgGridProps> = React.memo(({ inputData, enableRowGroupColumns, pivotColumns, aggFuncColumns, onDataChange}) => {
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

                const enableRowGroup: string[] = enableRowGroupColumns?.split(";") || [];
                const enablePivot: string[] = pivotColumns?.split(";") || [];
                const aggFunc: string[] = aggFuncColumns?.split(";") || [];

                const dynamicColumnDefs: any = headers.map(header => ({
                    field: header,
                    enableRowGroup: enableRowGroup.includes(header),
                    enablePivot: enablePivot.includes(header),
                    aggFunc: aggFunc.includes(header) ? 'sum' : null,
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
        sideBar: true,
        columnDefs: columnDefs,
        suppressAggFuncInHeader: true,
        defaultColDef: {
            flex: 1,
            minWidth: 150,
            filter: true,
            floatingFilter: true,
            resizable: true,
            editable: true,
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

    return (
        <div className={divClass} style={{ width: '100%', height: '80vh' }}>
            <Theme options={option} onSelect={handleThemeChange} />
            <Button onClick={onSave} style={{ margin: '10px' }}>Save to dataverse</Button>
            < AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                autoGroupColumnDef={autoGroupColumnDef}
                gridOptions={gridOptions}
                rowGroupPanelShow='always'
                pagination={true}
                rowSelection={'multiple'}
                groupSelectsChildren={true}
                pivotPanelShow='always'
                tooltipShowDelay={500}
                ref={gridRef}
            />
        </div>
    );
});

export default AgGrid;