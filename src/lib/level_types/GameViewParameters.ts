import { CircuitController } from "$lib/circuit_types/CircuitController"
import { createGate, type ConnectionValue, type GateType, Buf } from "$lib/circuit_types/Gate"
import type { GateGrid } from "$lib/circuit_types/GateGrid"
import { SignalSet } from "$lib/signal_types/Signal"
import { OrganizedCircuit, type OrganizedCircuitContents } from "$lib/storage_types/CircuitStorage"

export class GameViewParameters {
    readonly name:string
    readonly directions:string
    readonly grid:GateGrid | undefined
    readonly completeCondition:CompleteConditionSource
    readonly completeRewards:string[]
    readonly allUnlocks:boolean
    
    constructor(
        name:string = "",
        directions:string = "",
        grid:GridSource = undefined,
        completeCondition:CompleteConditionSource = undefined,
        completeRewards:string[] = [],
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
            from = from || Buf
            this.inputSize = from.sizeIn
            this.outputSize = from.sizeOut
        }
    }
}

type GridSource = CircuitController | OrganizedCircuitContents | undefined
type CompleteConditionSource = GateType | SignalSet | undefined