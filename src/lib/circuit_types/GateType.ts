import { registerGateType, type GateTypeParameters, spreadVerticalConnections, drawGateTypeEllipse } from "$lib/dat/GateTypes/GateTypes";
import type { GateState } from "./Gate";
import type { ConnectionType } from "./GateGraph";

export type ConnectionValue = boolean | undefined;

export type GateTypeVariant = "Gate" | "Flow"

/**
 * A set of data used both by Gates and view.
 * Every GateType created will be placed in all_gates with its name as the key,
 * only one of each unique GateType should exist at any given time, the only reason the class is exported is so other scripts can typescheck for it
 */

export class GateType {
    readonly name: string = "Buf";
    readonly sizeIn: number = 1;
    readonly sizeOut: number = 1;
    readonly gridWidth: number = 2;
    readonly gridHeight: number = 2;
    readonly variant: GateTypeVariant = "Gate";
    readonly f: (s:GateState) => GateState = (s:GateState) => { return s; };

    constructor(
        params: GateTypeParameters
    ) {
        if (params.gridSize) {
            this.gridWidth = params.gridSize[0];
            this.gridHeight = params.gridSize[1];
        }

        if (params.name) {
            this.name = params.name;
        }

        if (typeof params.inputs === "number") {
            this.sizeIn = params.inputs;
        }
        else if (params.inputs instanceof Array) {
            this.sizeIn = params.inputs.length;
        }

        if (typeof params.outputs === "number") {
            this.sizeOut = params.outputs;
        }
        else if (params.outputs instanceof Array) {
            this.sizeOut = params.outputs.length;
        }

        if (params.variant) this.variant = params.variant;

        if (params.f) this.f = params.f;

        console.log(this)

    }
}

export class GateTypeView {
    readonly name: string = "Buf";
    readonly sizeIn: number = 1;
    readonly sizeOut: number = 1;
    readonly inputOffsets: Array<[number, number]> = [[0.25, 1]];
    readonly outputOffsets: Array<[number, number]> = [[1.75, 1]];
    readonly inputLabels: string[] = [];
    readonly outputLabels: string[] = [];
    readonly gridWidth: number = 2;
    readonly gridHeight: number = 2;
    readonly moveable: boolean = true;
    private readonly drawInternal: (s:GateState) => string;

    constructor(
        params:GateTypeParameters
    ) {
        if (params.gridSize) {
            this.gridWidth = params.gridSize[0];
            this.gridHeight = params.gridSize[1];
        }

        if (params.name) this.name = params.name

        if (typeof params.inputs === "number") {
            this.sizeIn = params.inputs;
            this.inputOffsets = this.spreadVerticalConnections(0.25, params.inputs);
        }
        else if (params.inputs instanceof Array) {
            this.sizeIn = params.inputs.length;
            this.inputOffsets = params.inputs;
        }

        if (typeof params.outputs === "number") {
            this.sizeOut = params.outputs;
            this.outputOffsets = this.spreadVerticalConnections(10 * this.gridWidth - 2, params.outputs);
        }
        else if (params.outputs instanceof Array) {
            this.sizeOut = params.outputs.length;
            this.outputOffsets = params.outputs;
        }

        this.inputLabels = params.inputLabels ||
            Array(this.sizeIn).fill("");
        this.outputLabels = params.outputLabels ||
            Array(this.sizeOut).fill("");

        const d =  (s:GateState) => {return drawGateTypeEllipse(this.gridWidth, this.gridHeight)}
        this.drawInternal = params.draw || d
    }

    private spreadVerticalConnections(gridX: number, size: number) {
        return spreadVerticalConnections(gridX, this.gridHeight, size);
    }

    getConnectionPoint(type:ConnectionType, index:number) {
        switch (type) {
            case "Input":
                return this.inputOffsets[index]
            case "Output":
                return this.outputOffsets[index]
        }
    }

    draw(s:GateState | undefined = undefined) {
        if (s === undefined) s = {override:new Array<ConnectionValue>(this.sizeIn).fill(undefined)}
        return this.drawInternal(s)
    }
}

export class GateTypeController {
    readonly model:GateType
    readonly view:GateTypeView

    readonly name:string

    constructor(
        params:GateTypeParameters
    ) {
        this.model = new GateType(params);
        this.view = new GateTypeView(params);

        this.name = params.name || "Buf"

        registerGateType(this);
    }
}