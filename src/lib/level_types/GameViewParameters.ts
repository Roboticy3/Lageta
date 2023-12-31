import { CircuitController } from "$lib/circuit_types/CircuitController"
import type { GateGrid } from "$lib/circuit_types/GateGrid"

export class GameViewParameters {
    directions:string
    grid:GateGrid | undefined
    
    constructor(
        directions:string = "",
        gridController:CircuitController | undefined = undefined
    ) {
        this.directions = directions
        this.grid = gridController?.gateGrid
    }

    initializeGrid() {
        return new CircuitController(this.grid)
    }
}