import { CircuitController } from "$lib/circuit_types/CircuitController"
import { And, Buf, Gate, GateType, Input, Not, Or, Output, all_gates, getGateType } from "$lib/circuit_types/Gate"
import { GateGraph } from "$lib/circuit_types/GateGraph"
import type { GateGrid } from "$lib/circuit_types/GateGrid"
import { Signal, SignalSet, oscillator, repeater } from "$lib/signal_types/Signal"
import type { OrganizedCircuitContents, SerializableGate } from "$lib/storage_types/CircuitStorage"
import { CompleteCondition, GameViewParameters } from "./GameViewParameters"

export let all_levels = new Map<String, Level>()

export class Level {
    private params:GameViewParameters

    readonly x:number
    readonly y:number

    readonly type:GateType

    constructor(
        params:GameViewParameters,
        x:number = 0,
        y:number = 0,
        type:GateType = LevelGateType,
        register:boolean = true
    ) {

        this.x = x
        this.y = y
        this.params = params

        this.type = type

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

export const LevelGateType = getGateType({name:"LevelGateType",gridSize:[2, 2],moveable:false})

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
    0,0
)

export const NotLevel = new Level (
    new GameViewParameters(
        "Not",
        `
        A Not gate "inverts" the input. On becomes Off, and vice-versa. Click and drag between the triangular connection points to draw a wire.
        `,
        {
            gateTypes:[Input(1, {outputLabels: ["Input"]}), Output(1, {inputLabels: ["Output"]})],
            gates:[
                {x:0, y:2, id:0, type:"Input1"} as SerializableGate,
                {x:8, y:2, id:1, type:"Output1"} as SerializableGate
            ],
            size:[10, 5]
        } as OrganizedCircuitContents,
        new SignalSet(
            [
                (new Signal<boolean>())
                    .push(oscillator(10, 2))
                    .push(oscillator(5, 3))
                    .push(oscillator(3, 3))
                    .push(oscillator(1, 6))
            ],
            101,
            false,
            Not
        ),
        [
            "Or"
        ]
    ),
    8, 1,
    Not
)

const In2Out1 = {
    gateTypes:[
        Input(2,
            {outputLabels:["Input 1","Input 2"], gridSize:[2,3]}
        ),
        Output(1,
            {inputLabels:["Output"]}
        )
    ],
    gates:[
        {x:0,y:1,type:"Input2",id:0} as SerializableGate,
        {x:8,y:2,type:"Output1",id:1} as SerializableGate
    ],
    size:[10,5]
} as OrganizedCircuitContents

export const AndLevel = new Level(
    new GameViewParameters(
        "And",
        "An And gate has two inputs, and only turns On when both are enabled.",
        In2Out1,
        new SignalSet(
            [
                oscillator(10, 5),
                new Signal([
                    {
                        frame:50,
                        value:true
                    }
                ])
            ],
            100,
            false,
            And
        ),
        [
            "Or"
        ]
    ),
    10,1,
    And
)

export const OrLevel = new Level (
    new GameViewParameters(
        "Or",
        "An Or gate is On when either of its inputs are On",
        In2Out1,
        new SignalSet(
            [   
                new Signal([
                    {
                        frame:0,
                        value:true
                    }
                ]).push(
                    repeater(
                        new Signal([
                            {
                                frame:3,
                                value:false,
                            },
                            {
                                frame:9,
                                value:true
                            }
                        ]),
                        3
                    )
                ).push(
                    new Signal([{
                        frame:3,
                        value:false,
                    }])
                ).push(
                    new Signal([
                        {frame:6,value:false}
                    ])
                ).push(
                    oscillator(3, 4)
                ),
                new Signal([
                    {
                        frame:6,
                        value:true
                    }
                ]).push(
                    repeater(
                        new Signal([
                            {
                                frame:3,
                                value:false,
                            },
                            {
                                frame:9,
                                value:true
                            }
                        ]),
                        3
                    )
                ).push(
                    new Signal([
                        {frame:3,value:false}
                    ])
                ).push(
                    oscillator(3, 4)
                ),
            ],
            70,
            false,
            Or
        ),
        [
            
        ]
    ),
    6, 3,
    Or
)