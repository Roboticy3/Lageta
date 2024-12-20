import { CircuitController } from "$lib/circuit_types/CircuitController"
import type { GateGrid } from "$lib/circuit_types/GateGrid"
import { GateType, GateTypeController } from "$lib/circuit_types/GateType"
import { Buf, getGateType } from "$lib/dat/GateTypes/GateTypes"
import { ConnectionValueSignalSet, SignalSet } from "$lib/signal_types/Signal"
import { CircuitSignalSetView } from "$lib/signal_types/SignalSetView"
import { OrganizedCircuit, type OrganizedCircuitContents } from "$lib/storage_types/CircuitStorage"

export class GameViewParameters {
    readonly name:string
    readonly directions:string
    readonly grid:GateGrid | undefined
    readonly completeCondition:CompleteConditionSource
    readonly completeRewards:string[]
    
    readonly allUnlocks:boolean

    readonly editorParams:Object
    readonly rendererParams:Object

    readonly storageKey:string | undefined
    
    constructor(
        name:string = "",
        directions:string = "",
        grid:GridSource = undefined,
        completeCondition:CompleteConditionSource = undefined,
        completeRewards:string[] = [],
        allUnlocks:boolean = false,
        editorParams = {},
        rendererParams = {},
        storageKey?:string

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
        this.allUnlocks = allUnlocks
        this.editorParams = editorParams
        this.rendererParams = rendererParams

        this.storageKey = storageKey
    }

    initializeGrid() {
        return new CircuitController(this.grid)
    }
}

export class CompleteCondition {
    inputSize=1
    outputSize=1

    constructor (
        from:CompleteConditionSource
    ) {
        if (from instanceof SignalSet) {
            this.inputSize = from.inputs
            this.outputSize = from.outputs
        }


    }
}

type GridSource = CircuitController | OrganizedCircuitContents | undefined
export type CompleteConditionSource = ConnectionValueSignalSet | undefined
