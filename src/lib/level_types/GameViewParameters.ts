import { CircuitController } from "$lib/circuit_types/CircuitController"
import type { GateGrid } from "$lib/circuit_types/GateGrid"
import { OrganizedCircuit, type OrganizedCircuitContents } from "$lib/storage_types/CircuitStorage"

export class GameViewParameters {
    directions:string
    grid:GateGrid | undefined
    allUnlocks:boolean
    
    constructor(
        directions:string = "",
        source:CircuitController | OrganizedCircuitContents | undefined = undefined,
        allUnlocks:boolean = false
    ) {
        this.directions = directions
        if (source === undefined || source instanceof CircuitController) {
            this.grid = source?.gateGrid
        }
        else {
            this.grid = new OrganizedCircuit(source).unpack()
        }
        this.allUnlocks = allUnlocks
        console.log(this.grid)
    }

    initializeGrid() {
        return new CircuitController(this.grid)
    }
}