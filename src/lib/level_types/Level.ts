import { CircuitController } from "$lib/circuit_types/CircuitController"
import { Buf, Input, Not, Output, all_gates } from "$lib/circuit_types/Gate"
import { GateGraph } from "$lib/circuit_types/GateGraph"
import type { GateGrid } from "$lib/circuit_types/GateGrid"
import { SignalSet } from "$lib/signal_types/Signal"
import type { OrganizedCircuitContents, SerializableGate } from "$lib/storage_types/CircuitStorage"
import { CompleteCondition, GameViewParameters } from "./GameViewParameters"

export let all_levels = new Map<String, Level>()

export class Level {
    readonly x:number
    readonly y:number
    private params:GameViewParameters

    constructor(
        params:GameViewParameters,
        x:number = 0,
        y:number = 0,
        register:boolean = true
    ) {
        this.x = x
        this.y = y
        this.params = params

        if (register) {
            all_levels.set(params.name, this)
        }
    }

    unpack() {
        return this.params;
    }

    description() {
        return this.params.directions
    }

    name() {
        return this.params.name
    }
}

export const Freeplay = new Level (
    new GameViewParameters(
        "Freeplay",
        "Have Fun!",
        {
            gateTypes:[
                Input(10),
                Output(10)],
            gates:[
                {x:0,y:0,id:0,type:"Input10"} as SerializableGate,
                {x:13,y:0,id:1,type:"Output10"} as SerializableGate
            ],
            size:[15,10] 
        },
        undefined,
        [],
        true
        ),
    1,1,
)

export const W1S1 = new Level (
    new GameViewParameters(
        "Not",
        `
        Click and drag between the triangular connection points to draw a wire.
        `,
        {
            gateTypes:[Input(1), Output(1)],
            gates:[
                {x:0, y:2, id:0, type:"Input1"} as SerializableGate,
                {x:8, y:2, id:1, type:"Output1"} as SerializableGate
            ],
            size:[10, 5]
        } as OrganizedCircuitContents,
        new SignalSet(
            [
                [
                    {
                        frame:10,
                        value:true
                    },
                    {
                        frame:20,
                        value:false
                    },
                    {
                        frame:30,
                        value:true
                    },
                    {
                        frame:40,
                        value:false
                    },
                    {
                        frame:45,
                        value:true
                    },
                    {
                        frame:50,
                        value:false
                    },
                    {
                        frame:55,
                        value:true
                    },
                    {
                        frame:60,
                        value:false
                    },
                    {
                        frame:65,
                        value:true
                    },
                    {
                        frame:70,
                        value:false
                    },
                    {
                        frame:73,
                        value:true
                    },
                    {
                        frame:76,
                        value:false
                    },
                    {
                        frame:79,
                        value:true
                    },
                    {
                        frame:82,
                        value:false
                    },
                    {
                        frame:85,
                        value:true
                    },
                    {
                        frame:88,
                        value:false
                    },
                    {
                        frame:91,
                        value:true
                    },
                    {
                        frame:92,
                        value:false
                    },
                    {
                        frame:93,
                        value:true
                    },
                    {
                        frame:94,
                        value:false
                    },
                    {
                        frame:95,
                        value:true
                    },
                    {
                        frame:96,
                        value:false
                    },
                    {
                        frame:97,
                        value:true
                    },
                    {
                        frame:98,
                        value:false
                    },
                    {
                        frame:99,
                        value:true
                    },
                    {
                        frame:100,
                        value:false
                    }
                ]
            ],
            101,
            false,
            Not
        ),
        [
            "Or"
        ]
    ),
    3, 1
)