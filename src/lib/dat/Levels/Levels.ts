import { GateType } from "$lib/circuit_types/GateType";
import { And, Buf, Input, Not, Or, Output, getGateType } from "$lib/dat/GateTypes/GateTypes";
import { Signal, SignalSet, oscillator, repeater } from "$lib/signal_types/Signal";
import type { OrganizedCircuitContents, SerializableGate } from "$lib/storage_types/CircuitStorage";
import { ProgressStorage } from "$lib/storage_types/ProgressStore";
import { GameViewParameters } from "../../level_types/GameViewParameters";
import { Level } from "../../level_types/Level";

export type LevelParameters = {
    params?:GameViewParameters,
    x?:number,
    y?:number,
    type?:GateType,
    playCondition?:boolean[],
    register?:boolean
}

export const Freeplay:LevelParameters = {
    params:new GameViewParameters(
        "Freeplay",
        "Have Fun!",
        {
            gateTypes: [
                Input(10),
                Output(10)
            ],
            gates: [
                { x: 0, y: 0, id: 0, type: "Input10" } as SerializableGate,
                { x: 13, y: 0, id: 1, type: "Output10" } as SerializableGate
            ],
            size: [15, 10]
        },
        undefined,
        [],
        true
    ),
    x:18, y:0
}

const MinCircuit:OrganizedCircuitContents = {
    gateTypes: [Input(1, { outputLabels: ["Input"] }), Output(1, { inputLabels: ["Output"] })],
    gates: [
        { x: 0, y: 2, id: 0, type: "Input1" } as SerializableGate,
        { x: 8, y: 2, id: 1, type: "Output1" } as SerializableGate
    ],
    size: [10, 5]
}

export const BufLevel:LevelParameters = {
    params:new GameViewParameters(
        "A Simple Start",
        `
        A regular level has inputs and outputs on a grid.
        Click and drag between the input and output on the grid to draw a wire, then press the play button below to send a signal through the input.
        The signal has input channels on top and output channels below. 
        When you press play, the input channels will be sent to the input, and the outputs will be measured into the output channels.
        If the measured output matches the expected output, you win!
        `,
        MinCircuit,
        new SignalSet(
            [
                oscillator(20, 2)
            ],
            80,
            false,
            Buf
        ),
        [
            "Not",
            "And",
            "Buf",
            "NotLevel",
            "AndLevel"
        ]
    ),
    x:8, y:1,
    type:Buf
}

export const NotLevel:LevelParameters = {
    params:new GameViewParameters(
        "Not",
        `
        A Not gate "inverts" the input. On becomes Off, and vice-versa. Click and drag between the triangular connection points to draw a wire.
        `,
        MinCircuit,
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
            "Not",
            "OrLevel"
        ]
    ),
    x:8, y:3,
    type:Not
};

const In2Out1:OrganizedCircuitContents = {
    gateTypes: [
        Input(2,
            { outputLabels: ["Input 1", "Input 2"], gridSize: [2, 3] }
        ),
        Output(1,
            { inputLabels: ["Output"] }
        )
    ],
    gates: [
        { x: 0, y: 1, type: "Input2", id: 0 } as SerializableGate,
        { x: 8, y: 2, type: "Output1", id: 1 } as SerializableGate
    ],
    size: [10, 5]
};

export const AndLevel:LevelParameters = {
    params:new GameViewParameters(
        "And",
        "An And gate has two inputs, and only turns On when both are enabled.",
        In2Out1,
        new SignalSet(
            [
                oscillator(10, 5),
                new Signal([
                    {
                        frame: 50,
                        value: true
                    }
                ])
            ],
            100,
            false,
            And
        ),
        [
            "OrLevel"
        ]
    ),
    x:10, y:1,
    type:And
}

export const OrLevel:LevelParameters = {
    params:new GameViewParameters(
        "Or",
        "An Or gate is On when either of its inputs are On",
        In2Out1,
        new SignalSet(
            [
                new Signal([
                    {
                        frame: 0,
                        value: true
                    }
                ]).push(
                    repeater(
                        new Signal([
                            {
                                frame: 3,
                                value: false,
                            },
                            {
                                frame: 9,
                                value: true
                            }
                        ]),
                        3
                    )
                ).push(
                    new Signal([{
                        frame: 3,
                        value: false,
                    }])
                ).push(
                    new Signal([
                        { frame: 6, value: false }
                    ])
                ).push(
                    oscillator(3, 4)
                ),
                new Signal([
                    {
                        frame: 6,
                        value: true
                    }
                ]).push(
                    repeater(
                        new Signal([
                            {
                                frame: 3,
                                value: false,
                            },
                            {
                                frame: 9,
                                value: true
                            }
                        ]),
                        3
                    )
                ).push(
                    new Signal([
                        { frame: 3, value: false }
                    ])
                ).push(
                    oscillator(3, 4)
                ),
            ],
            70,
            false,
            Or
        ),
        []
    ),
    x:6, y:3,
    type:Or
}

const all_params = new Map<string, LevelParameters>([
    ["Freeplay",Freeplay],
    ["A Simple Start",BufLevel],
    ["NotLevel",NotLevel],
    ["AndLevel",AndLevel],
    ["OrLevel",OrLevel]
])

export function getLevel(name:string) {
    const params = getLevelParams(name)
    return new Level(params)
}

export function getLevelParams(name:string) {
    return all_params.get(name) || Freeplay
}
