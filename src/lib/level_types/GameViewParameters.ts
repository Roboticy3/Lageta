import { CircuitController } from "$lib/circuit_types/CircuitController"
import type { GateGrid } from "$lib/circuit_types/GateGrid"
import { GateType, GateTypeController } from "$lib/circuit_types/GateType"
import { Buf, getGateType } from "$lib/dat/GateTypes/GateTypes"
import { SignalSet } from "$lib/signal_types/Signal"
import { OrganizedCircuit, type OrganizedCircuitContents } from "$lib/storage_types/CircuitStorage"

export class GameViewParameters {
    readonly name:string
    readonly directions:string
    readonly grid:GateGrid | undefined
    readonly completeCondition:CompleteConditionSource
    readonly completeRewards:string[]
    readonly rendererParams:RendererParameters
    readonly allUnlocks:boolean
    
    constructor(
        name:string = "",
        directions:string = "",
        grid:GridSource = undefined,
        completeCondition:CompleteConditionSource = undefined,
        completeRewards:string[] = [],
        rendererParams:RendererParameters = {},
        allUnlocks:boolean = false
    ) {
        this.name = name

        this.directions = directions
        if (grid === undefined || grid instanceof CircuitController) {
            this.grid = grid?.gateGrid
        }
        else {
            this.grid = new OrganizedCircuit(grid).unpack()
        }

        this.completeCondition = completeCondition
        this.completeRewards = completeRewards
        this.rendererParams = rendererParams
        this.allUnlocks = allUnlocks
    }

    initializeGrid() {
        return new CircuitController(this.grid)
    }
}

export class CompleteCondition {
    inputSize:number 
    outputSize:number

    constructor (
        from:CompleteConditionSource
    ) {
        if (from instanceof SignalSet) {
            this.inputSize = from.inputs
            this.outputSize = from.outputs
        }
        else {
            from = from || getGateType(Buf)
            this.inputSize = from.model.sizeIn
            this.outputSize = from.model.sizeOut
        }
    }
}

type GridSource = CircuitController | OrganizedCircuitContents | undefined
export type CompleteConditionSource = GateTypeController | SignalSet | undefined
export type RendererParameters = {
    showGates?:boolean, 
    showConnectionPoints?:boolean, 
    showWires?:boolean, 
    initialScale?:[number, number],
    initialTranslate?:[number, number]
}