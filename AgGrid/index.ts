import { IInputs, IOutputs } from "./generated/ManifestTypes";
import MyAgGrid from './components/AgGrid'
import React, { useMemo } from "react";
import createRoot from "react-dom";
import { LicenseManager } from 'ag-grid-enterprise';

export class AgGrid implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    public width: number;
    public height: number;
    private con: HTMLDivElement;
    private inputData: string | null;
    private enableRowGroupColumns: string | null;
    private pivotColumns: string | null;
    private aggFuncColumns: string | null;
    private notifyOutputChanged: () => void;
    private jsonData: any[] = [];
    private key: string;
    private gridHeight: number;
    private gridLock: string;
    /**
     * Empty constructor.
     */
    constructor() {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        // Add control initialization code
        // Add control initialization code
        
        this.con = container;

        const height = context.mode.allocatedHeight;
        const width = context.mode.allocatedWidth;

        this.gridLock = context.parameters.gridLock.raw ?? 'true';
        this.gridHeight = context.parameters.gridHeight.raw ?? 500;
        this.inputData = context.parameters.inputData.raw;
        this.enableRowGroupColumns = context.parameters.enableRowGroupColumns.raw;
        this.aggFuncColumns = context.parameters.aggFuncColumns.raw;
        this.notifyOutputChanged = notifyOutputChanged;
        this.key = context.parameters.key.raw ?? 'defaultKey';
        LicenseManager.setLicenseKey(this.key);
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.gridLock = context.parameters.gridLock.raw ?? 'true';
        this.inputData = context.parameters.inputData.raw;
        this.enableRowGroupColumns = context.parameters.enableRowGroupColumns.raw;
        this.aggFuncColumns = context.parameters.aggFuncColumns.raw;
        this.key = context.parameters.key.raw ?? 'defaultKey';
        LicenseManager.setLicenseKey(this.key);
        this.gridHeight = context.parameters.gridHeight.raw ?? 500;
        // idea: add a new field to on data change to differentiate between dataverse save and a line break from user
        const onDataChange = (data: any) => {
            this.jsonData = data;
            this.notifyOutputChanged();
        }

        createRoot.render(
            React.createElement(MyAgGrid, {inputData : this.inputData,
                enableRowGroupColumns : this.enableRowGroupColumns,
                pivotColumns : this.pivotColumns,
                aggFuncColumns : this.aggFuncColumns,
                onDataChange: onDataChange,
                height: this.gridHeight,
                gridLock: this.gridLock
            }),
            // React.createElement(MyAgGrid, {apiUrl : this.apiUrl}),
            this.con
        );
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        return {jsonData: JSON.stringify(this.jsonData)};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
        createRoot.unmountComponentAtNode(this.con);
    }
}
