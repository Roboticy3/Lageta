import { CircuitController } from "$lib/circuit_types/CircuitController"
import { Input, Output } from "$lib/circuit_types/Gate"
import { GateGraph } from "$lib/circuit_types/GateGraph"
import type { GateGrid } from "$lib/circuit_types/GateGrid"
import type { OrganizedCircuitContents } from "$lib/storage_types/CircuitStorage"
import { GameViewParameters } from "./GameViewParameters"

export let all_levels = new Map<String, Level>()
console.log(...all_levels.keys())

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
        register:boolean = true
    ) {
        this.x = x
        this.y = y
        this.name = name
        this.params = params

        if (register) {
            console.log(name, this)
            all_levels.set(name, this)
        }
    }

    unpack() {
        return this.params;
    }

    description() {
        return this.params.directions
    }
}

export const Freeplay = new Level (
    new GameViewParameters("Have Fun!", undefined, true),
    "Freeplay",
    1,1
)

export const W1S1 = new Level (
    new GameViewParameters(
        "Click and drag from the shelf at the top to the grid to place gates. Then click and drag between the tiangular connection points to connect them.",
        {
            gateTypes:[Input, Output],
            gates:[
                {x:0, y:2, id:0, type:"Input"},
                {x:9, y:2, id:1, type:"Output"}
            ],
            connections:[],
            size:[10, 5],
            offset:[0, 0]
        } as OrganizedCircuitContents
    ),
    "1",
    3, 1
)

export const W1S2 = new Level (
    new GameViewParameters(
        "The output of a gate is inverted whenever the output is covered with a small circle. Use the Not gate to invert the input."
    ),
    "2",
    4, 3
)