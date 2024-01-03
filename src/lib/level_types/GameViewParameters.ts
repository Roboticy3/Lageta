import { CircuitController } from "$lib/circuit_types/CircuitController"
import type { GateType } from "$lib/circuit_types/Gate"
import type { GateGrid } from "$lib/circuit_types/GateGrid"
import { OrganizedCircuit, type OrganizedCircuitContents } from "$lib/storage_types/CircuitStorage"

export class GameViewParameters {
    directions:string
    grid:GateGrid | undefined
    completeCondition:GateType | undefined
    allUnlocks:boolean
    
    
    constructor(
        directions:string = "",
        source:CircuitController | OrganizedCircuitContents | undefined = undefined,
        completeCondition:GateType | undefined = undefined,
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
    execute:(x:boolean[]) => boolean[]

    constructor (
        from:GateType | {sizeIn:number, sizeOut:number, execute:(x:boolean[]) => boolean[]}
    ) {
        this.inputSize = from.sizeIn
        this.outputSize = from.sizeOut
        this.execute = from.execute
    }


}