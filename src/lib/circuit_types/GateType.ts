import { registerGateType, type GateTypeParameters, spreadVerticalConnections } from "$lib/dat/GateTypes/GateTypes";

export type ConnectionValue = boolean | undefined;

export type GateTypeVariant = "Gate" | "Flow"

/**
 * A set of data used both by Gates and view.
 * Every GateType created will be placed in all_gates with its name as the key,
 * only one of each unique GateType should exist at any given time, the only reason the class is exported is so other scripts can typescheck for it
 */

export class GateType {
    name: string = "Buf";
    readonly sizeIn: number = 1;
    readonly sizeOut: number = 1;
    readonly inputOffsets: Array<[number, number]> = [[0.25, 1]];
    readonly outputOffsets: Array<[number, number]> = [[1.75, 1]];
    readonly inputLabels: string[] = [];
    readonly outputLabels: string[] = [];
    readonly gridWidth: number = 2;
    readonly gridHeight: number = 2;
    readonly moveable: boolean = true;
    readonly variant: GateTypeVariant = "Gate";
    private f: (x: (ConnectionValue)[]) => (ConnectionValue)[] = (x: (ConnectionValue)[]) => { return x; };

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
            this.inputOffsets = this.spreadVerticalConnections(0.25, params.inputs);
        }
        else if (params.inputs instanceof Array) {
            this.sizeIn = params.inputs.length;
            this.inputOffsets = params.inputs;
        }

        if (typeof params.outputs === "number") {
            this.sizeOut = params.outputs;
            this.outputOffsets = this.spreadVerticalConnections(this.gridWidth - 0.25, params.outputs);
        }
        else if (params.outputs instanceof Array) {
            this.sizeOut = params.outputs.length;
            this.outputOffsets = params.outputs;
        }

        this.inputLabels = params.inputLabels ||
            Array(this.sizeIn).fill("");
        this.outputLabels = params.outputLabels ||
            Array(this.sizeOut).fill("");

        if (params.register || true) {
            registerGateType(this);
        }

        if (params.variant) this.variant = params.variant;

        if (params.moveable) this.moveable = params.moveable;

        if (params.f) this.f = params.f;

    }

    private spreadVerticalConnections(gridX: number, size: number) {
        return spreadVerticalConnections(gridX, this.gridHeight, size);
    }

    execute(override: ConnectionValue[], x: ConnectionValue[]) {
        let newArray = new Array<ConnectionValue>(this.sizeIn);
        for (let i = 0; i < this.sizeIn; i++) {
            newArray[i] = override[i] || x[i];
        }
        console.log("executing ", this.name, " with input ", newArray);
        return this.f(newArray);
    }
}