import { GateType } from "$lib/circuit_types/GateType";
import { And, Buf, Decoder2t4, Input, Nand, Not, Or, Output, Xor, getGateType } from "$lib/dat/GateTypes/GateTypes";
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
        <p>A regular level has inputs and outputs on a grid.</p>
        <p>Click and drag between the input and output on the grid to draw a wire, then press the play button below to send a signal through the input.</p>
        <p>The signal has input channels on top and output channels below.</p>
        <p>When you press play, the input channels will be sent to the input, and the outputs will be measured into the output channels.</p>
        <p>If the measured output matches the expected output, you win!</p>
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
            "Inverter",
            "Some Kind of Combo"
        ]
    ),
    x:4, y:1,
    type:Buf
}

export const NotLevel:LevelParameters = {
    params:new GameViewParameters(
        "Inverter",
        `
        <p>This level requires a "Not" Gate, also called an inverter, which takes one input and produces its opposite.</p>
        <p>The Not gate is represented by a triangle with a circle at the end.</p>
        <p>Click on the symbols on the top shelf to produce a gate, and drop it in the grid.</p>
        <p>A Gate takes inputs and transforms them into outputs.</p>
        <p>After placing the gate, connect a wire to the input, and connect the output to the level's output.</p>
        `,
        MinCircuit,
        new SignalSet(
            [
                new Signal([{frame:0,value:false}])
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
            "Join",
            "Or"
        ]
    ),
    x:6, y:1,
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
        "Some Kind of Combo",
        `
        <p>This level requires an "And" Gate, which takes two inputs and only outputs power when both inputs (Input 1 AND Input 2) are enabled.</p>
        <p>The And gate is represented by a shape that's flat on one side and rounded on the other.</p>
        <p>Click on the symbols on the top shelf to produce a gate, and drop it in the grid.</p>
        <p>A Gate takes inputs and transforms them into outputs.</p>
        <p>After placing the gate, connect a wire to one of its inputs, then connect its output to the output of the level.</p>
        `,
        In2Out1,
        new SignalSet(
            [
                new Signal([{frame:0,value:false}])
                    .push(oscillator(10, 5)),
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
            "Join",
            "Or"
        ]
    ),
    x:6, y:3,
    type:And
}

export const OrLevel:LevelParameters = {
    params:new GameViewParameters(
        "Join",
        `
        <p>An Or gate outputs power when recieving power from either of its inputs, 
        and is represented by a shape that's curved inward on one side and rounded on the other like an And gate</p>
        `,
        In2Out1,
        new SignalSet(
            [
                new Signal([{frame:0,value:true}]).push(
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
                ).push(new Signal([{frame:3,value:false},{frame:6,value:false}])).push(
                    oscillator(3, 4)
                ),
                new Signal([{frame:0,value:false},{frame:6,value:true}]).push(
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
                ).push(new Signal([{frame:3,value:false}])).push(
                    oscillator(3, 4)
                )
            ],
            70,
            false,
            Or
        ),
        [
            "Making a Gate 1"
        ]
    ),
    x:8, y:1,
    type:Or
}

export const NandLevel:LevelParameters ={
    params:new GameViewParameters(
        "Making a Gate 1",
        `
        <p>Most levels will have you making a gate. Connect multiple gates together to get more interesting effects!</p>
        <p>Try and make your circuit match the expected output. If you succeed, you'll unlock a gate with the same behavior as your circuit to use in later levels.</p>
        <p>The behavior here is called an "Nand" gate, or inverse And</p>
        `,
        In2Out1,
        new SignalSet(
            [
                new Signal([{frame:0,value:false}]).push(oscillator(10, 5)),
                new Signal([{frame:0,value:false},{frame: 50,value: true}])
            ],
            100,
            false,
            Nand
        ),
        [
            "Nand",
            "Making a Gate 2",
            "Counting"
        ]
    ),
    x:10,y:1,
    type:Nand
}

export const XorLevel = {
    params:new GameViewParameters(
        "Making a Gate 2",
        `
        <p>Most levels will have you making a gate. Connect multiple gates together to get more interesting effects!</p>
        <p>Try and make your circuit match the expected output. If you succeed, you'll unlock a gate with the same behavior as your circuit to use in later levels.</p>
        <p>The behavior here is called an "Xor" gate, or exclusive or</p>
        `,
        In2Out1,
        new SignalSet(
            [
                new Signal([{frame:0,value:false}]).push(oscillator(10, 10)),
                new Signal([{frame:5,value:false}]).push(oscillator(10, 9))
            ],
            200,
            false,
            Xor
        ),
        [
            "Xor"
        ]
    ),
    x:12,y:1,
    type:Xor
}

export const DecoderLevel = {
    params:new GameViewParameters(
        "Counting",
        `
        <p>How many possibilities are there for 2 independent inputs?</p>
        <p>Each output here maps to one of those possibilities from the inputs.</p>
        `,
        {
            gateTypes: [
                Input(2,
                    { outputLabels: ["Input 1", "Input 2"], gridSize: [2, 3] }
                ),
                Output(4,
                    { inputLabels: ["0", "1", "2", "3"], gridSize: [2, 7]}
                )
            ],
            gates: [
                { x: 0, y: 4, type: "Input2", id: 0 } as SerializableGate,
                { x: 18, y: 2, type: "Output4", id: 1 } as SerializableGate
            ],
            size: [20, 11]
        },
        new SignalSet(
            [
                new Signal([{frame:0,value:false}]).push(oscillator(5, 10)),
                new Signal([{frame:0,value:false}]).push(oscillator(10, 5))
            ],
            101,
            false,
            Decoder2t4
        ),
        [
            Decoder2t4.name
        ]
    ),
    x:10,y:3,
    type:Decoder2t4,
    playCondition:[false, false, true, false]
}

export const EncoderLevel = {

}

const all_params = new Map<string, LevelParameters>([
    ["Freeplay",Freeplay],
    ["A Simple Start",BufLevel],
    ["Inverter",NotLevel],
    ["Some Kind of Combo",AndLevel],
    ["Join",OrLevel],
    ["Making a Gate 1", NandLevel],
    ["Making a Gate 2", XorLevel],
    ["Counting", DecoderLevel]
])

export function getLevel(name:string) {
    const params = getLevelParams(name)
    if (params) return new Level(params)
}

export function getLevelParams(name:string) {
    return all_params.get(name)
}
