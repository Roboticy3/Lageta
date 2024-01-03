import { CircuitController } from "$lib/circuit_types/CircuitController"
import type { GateGrid } from "$lib/circuit_types/GateGrid"

export class GameViewParameters {
    directions:string
    grid:GateGrid | undefined
    allUnlocks:boolean
    
    constructor(
        directions:string = "",
        gridController:CircuitController | undefined = undefined,
        allUnlocks:boolean = false
    ) {
        this.directions = directions
        this.grid = gridController?.gateGrid
        this.allUnlocks = allUnlocks
    }

    initializeGrid() {
        return new CircuitController(this.grid)
    }
}