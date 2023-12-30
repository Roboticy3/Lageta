import type { GateGrid } from "$lib/circuit_types/GateGrid"
import { GameViewParameters } from "./GameViewParameters"

export class Level {
    x:number = 1
    y:number = 1
    name:string = "Freeplay"
    private params:GameViewParameters

    constructor(
        params:GameViewParameters = new GameViewParameters("Have Fun!"),
        name:string = "Freeplay",
        x:number = 1,
        y:number = 1,
        grid:GateGrid | undefined = undefined
    ) {
        this.x = x
        this.y = y
        this.name = name

        params.grid = grid
        this.params = params
    }

    unpack() {
        return this.params;
    }
}

export const Freeplay = new Level (
    new GameViewParameters("Have Fun!"),
    "Freeplay",
    1,1
)

export const W1S1 = new Level (
    new GameViewParameters(
        "Click and drag from the shelf at the top to the grid to place gates. Then click and drag between the tiangular connection points to connect them."
    ),
    "Stage 1",
    3, 1
)

export const W1S2 = new Level (
    new GameViewParameters(
        "The output of a gate is inverted whenever the output is covered with a small circle. Use the Not gate to invert the input."
    ),
    "Stage 2",
    4, 3
)