import { CircuitController } from "$lib/circuit_types/CircuitController"
import { createGate, type ConnectionValue, type GateType, Buf } from "$lib/circuit_types/Gate"
import type { GateGrid } from "$lib/circuit_types/GateGrid"
import { OrganizedCircuit, type OrganizedCircuitContents } from "$lib/storage_types/CircuitStorage"

export class GameViewParameters {
    directions:string
    grid:GateGrid | undefined
    completeCondition:CompleteConditionSource
    allUnlocks:boolean
    
    
    constructor(
        directions:string = "",
        source:CircuitController | OrganizedCircuitContents | undefined = undefined,
        completeCondition:CompleteConditionSource = undefined,
        allUnlocks:boolean = false
    ) {
        this.directions = directions
        if (source === undefined || source instanceof CircuitController) {
            this.grid = source?.gateGrid
        }
        else {
            this.grid = new OrganizedCircuit(source).unpack()
        }

        this.completeCondition = completeCondition
        this.allUnlocks = allUnlocks
        console.log(this.grid)
    }

    initializeGrid() {
        return new CircuitController(this.grid)
    }
}

export class CompleteCondition {
    inputSize:number 
    outputSize:number
    execute:(x:ConnectionValue[]) => ConnectionValue[]

    constructor (
        from:CompleteConditionSource
    ) {
        from = from || Buf
        this.inputSize = from.sizeIn
        this.outputSize = from.sizeOut
        this.execute = createGate(from).execute
    }
}

type CompleteConditionSource = GateType | undefined