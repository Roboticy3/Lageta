import { CircuitController } from "$lib/circuit_types/CircuitController"
import { Buf, Input, Not, Output, all_gates } from "$lib/circuit_types/Gate"
import { GateGraph } from "$lib/circuit_types/GateGraph"
import type { GateGrid } from "$lib/circuit_types/GateGrid"
import type { OrganizedCircuitContents, SerializableGate } from "$lib/storage_types/CircuitStorage"
import { CompleteCondition, GameViewParameters } from "./GameViewParameters"

export let all_levels = new Map<String, Level>()

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
    new GameViewParameters("Have Fun!", undefined, undefined, true),
    "Freeplay",
    1,1
)

export const W1S1 = new Level (
    new GameViewParameters(
        `
        Click and drag between the triangular connection points to draw a wire.
        `,
        {
            gateTypes:[Input(1), Output(1)],
            gates:[
                {x:0, y:2, id:0, type:"Input1"} as SerializableGate,
                {x:8, y:2, id:1, type:"Output1"} as SerializableGate
            ],
            connections:[],
            size:[10, 5],
            offset:[0, 0]
        } as OrganizedCircuitContents,
        Not
    ),
    "1",
    3, 1
)