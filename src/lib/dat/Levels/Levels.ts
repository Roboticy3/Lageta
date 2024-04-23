import { Connection } from "$lib/circuit_types/GateGraph";
import { GateType, GateTypeController, type ConnectionValue } from "$lib/circuit_types/GateType";
import { Adder2c, And, Buf, Decoder2t4, Encoder4t2, Input, InputDecodePrebaked, InputLabelledPrebaked, Nand, Not, Or, Output, OutputDecodePrebaked, OutputLabelledPrebaked, Xor, drawGateTypeDecode, getGateType, type GateTypeParameters } from "$lib/dat/GateTypes/GateTypes";
import { ConnectionValueSignalSet, Signal, SignalSet, oscillator, repeater } from "$lib/signal_types/Signal";
import type { OrganizedCircuitContents, SerializableGate } from "$lib/storage_types/CircuitStorage";
import { ProgressStorage } from "$lib/storage_types/ProgressStore";
import { GameViewParameters } from "../../level_types/GameViewParameters";
import { Level } from "../../level_types/Level";

export type LevelParameters = {
    params?:GameViewParameters,
    x?:number,
    y?:number,
    type?:GateTypeParameters,
    playCondition?:boolean[],
    register?:boolean
}

const MinCircuit:OrganizedCircuitContents = {
    gateTypes: [getGateType(InputLabelledPrebaked[1]), getGateType(OutputLabelledPrebaked[1])],
    gates: [
        { x: 0, y: 2, id: 0, type: "Input1Labelled" } as SerializableGate,
        { x: 8, y: 2, id: 1, type: "Output1Labelled" } as SerializableGate
    ],
    size: [10, 5]
}

const In2Out1:OrganizedCircuitContents = {
    gateTypes: [
        getGateType(InputLabelledPrebaked[2]),
        getGateType(OutputLabelledPrebaked[2])
    ],
    gates: [
        { x: 0, y: 1, type: "Input2Labelled", id: 0 } as SerializableGate,
        { x: 8, y: 2, type: "Output1Labelled", id: 1 } as SerializableGate
    ],
    size: [10, 5]
};

const DecoderLevelSignal = new ConnectionValueSignalSet(
    [
        new Signal<ConnectionValue>([{frame:0,value:false}]).push(oscillator(5, 10)),
        new Signal<ConnectionValue>([{frame:0,value:false}]).push(oscillator(10, 5))
    ],
    101,
    getGateType(Decoder2t4)
)

/**
 * Generate a signal to test all of the inputs of a solver
 * @param solver the solver the inputs are generated for
 * @param step the number of frames each input lasts
 * @param repeat if given, the signal will be repeated this many times
 * @returns 
 */
function countingSignal(solver:GateTypeController, step:number, repeat?:number) {
    const bits = solver.model.sizeIn
    let block = new Array<Signal<ConnectionValue>>(bits)
    const permutations = Math.pow(2, bits)
    //construct the signal from layered oscillators
    //each permutation should occur exactly once, so the length of the signal is permutations * step
    const length = permutations * step * (repeat || 1)
    for (let i = 0; i < block.length; i++) {
        //the step length of the oscillator at each layer should be twice as wide as the last
        //meanwhile, each layer should repeat half as much as the last
        //since an oscillator of n repeats creates a signal of step * 2 frames, the repeats should start at length / 2 and halve on each iteration
        block[i] = new Signal<ConnectionValue>([{value:false,frame:0}]).push(oscillator(Math.pow(2, i) * step, Math.pow(2, bits - i - 1)))
    }

    if (repeat) {
        block.forEach((s, i) => {block[i] = repeater(s, repeat)})
    }

    return new ConnectionValueSignalSet(
        block, length, solver
    )
}

export const AdderLevel = {
    params:new GameViewParameters(
        "Simple Calculator",
        `
        <p>This is a calculator for adding two very small numbers, and even then the output doesn't have enough combinations to account for every possible sum!</p>
        <p>So, this *very* simple calculator has a "carry" bit, a signal that should fire when the output doesn't have enough bits to display the answer.</p>
        `,
        {
            gateTypes: [
                getGateType(InputDecodePrebaked[2]),
                getGateType(InputDecodePrebaked[2]),
                getGateType(OutputDecodePrebaked[2]),
                getGateType(Output(1, {name:"Carry",inputLabels:["Carry"]}))
            ],
            gates: [
                { x:0, y:3, type:"Input2Decode", id:0} as SerializableGate,
                { x:0, y:7, type:"Input2Decode", id:1} as SerializableGate,
                { x:18, y:3, type:"Output2Decode", id:2} as SerializableGate,
                { x:18, y:7, type:"Carry", id:3} as SerializableGate,
            ],
            size:[20,11]
        },
        countingSignal(getGateType(Adder2c), 5, 3),
        []
    ),
    x:16,y:2,
    type:Adder2c,
    playCondition:[false, false, true]
}

export const EncoderLevel = {
    params:new GameViewParameters(
        "Counting Backwards",
        `
        <p>How many possibilities are there for 2 independent inputs?</p>
        <p>Each output here maps to one of those possibilities from the inputs.</p>
        `,
        {
            gateTypes: [
                getGateType(Input(4,
                    { name:"Input4Decoded", outputLabels: ["0", "1", "2", "3"], gridSize: [2, 7] }
                )),
                getGateType(OutputDecodePrebaked[2])
            ],
            gates: [
                { x: 0, y: 2, type: "Input4Decoded", id: 0 } as SerializableGate,
                { x: 18, y: 4, type: "Output2Decode", id: 1 } as SerializableGate
            ],
            size: [20, 11]
        },
        DecoderLevelSignal.inverted(),
        [
            getGateType(Encoder4t2).name,
            AdderLevel.params.name
        ]
    ),
    x:13,y:3,
    type:Encoder4t2,
    playCondition:[true, true]
}
console.log(EncoderLevel)

export const DecoderLevel = {
    params:new GameViewParameters(
        "Counting",
        `
        <p>How many possibilities are there for 2 independent inputs?</p>
        <p>Each output here maps to one of those possibilities from the inputs.</p>
        `,
        {
            gateTypes: [
                getGateType(InputDecodePrebaked[2]),
                getGateType(Output(4,
                    { name:"Output4Decoded", inputLabels: ["0", "1", "2", "3"], gridSize: [2, 7]}
                ))
            ],
            gates: [
                { x: 0, y: 4, type: "Input2Decode", id: 0 } as SerializableGate,
                { x: 18, y: 2, type: "Output4Decoded", id: 1 } as SerializableGate
            ],
            size: [20, 11]
        },
        DecoderLevelSignal,
        [
            getGateType(Decoder2t4).name,
            EncoderLevel.params.name
        ]
    ),
    x:10,y:3,
    type:Decoder2t4,
    playCondition:[false, false, true, false]
}

export const XorLevel = {
    params:new GameViewParameters(
        "Making a Gate 2",
        `
        <p>Here's an example of making a more advanced gate</p>
        <p>The behavior here is called an "Xor" gate, short for exclusive or. Like an Or gate but more... exclusive.</p>
        <p>There's already an Or gate in the circuit, try pressing play just to see how it's different from a Xor gate.</p>
        `,
        {
            gateTypes: [
                getGateType(InputLabelledPrebaked[2]),
                getGateType(OutputLabelledPrebaked[1]),
                getGateType(Or)
            ],
            gates: [
                { x: 0, y: 1, type: "Input2Labelled", id: 0 } as SerializableGate,
                { x: 8, y: 2, type: "Output1Labelled", id: 1 } as SerializableGate,
                { x: 4, y: 1, type: "Or", id: 2} as SerializableGate
            ],
            connections: [
                new Connection(0, 0, 2, 0),
                new Connection(0, 1, 2, 1),
                new Connection(2, 0, 1, 0)
            ],
            size: [10, 5]
        },
        new ConnectionValueSignalSet(
            [
                new Signal<ConnectionValue>([{frame:0,value:false}]).push(oscillator(10, 10)),
                new Signal<ConnectionValue>([{frame:5,value:false}]).push(oscillator(10, 9))
            ],
            200,
            getGateType(Xor)
        ),
        [
            getGateType(Xor).name,
            DecoderLevel.params.name
        ]
    ),
    x:12,y:1,
    type:Xor
}

export const NandLevel = {
    params:new GameViewParameters(
        "Making a Gate 1",
        `
        <p>Most levels will have you making a gate. Connect multiple gates together to get more interesting effects!</p>
        <p>Try and make your circuit match the expected output. If you succeed, you'll unlock a gate with the same behavior to use in later levels.</p>
        <p>The behavior here is called an "Nand" gate, the opposite of And.</p>
        `,
        {
            gateTypes: [
                getGateType(InputLabelledPrebaked[2]),
                getGateType(OutputLabelledPrebaked[1]),
                getGateType(And)
            ],
            gates: [
                { x: 0, y: 1, type: "Input2Labelled", id: 0 } as SerializableGate,
                { x: 8, y: 2, type: "Output1Labelled", id: 1 } as SerializableGate,
                { x: 4, y: 1, type: "And", id: 2} as SerializableGate
            ],
            connections: [
                new Connection(0, 0, 2, 0),
                new Connection(0, 1, 2, 1),
                new Connection(2, 0, 1, 0)
            ],
            size: [10, 5]
        },
        new ConnectionValueSignalSet(
            [
                new Signal<ConnectionValue>([{frame:0,value:false}]).push(oscillator(10, 5)),
                new Signal<ConnectionValue>([{frame:0,value:false},{frame:50,value:true}])
            ],
            100,
            getGateType(Nand)
        ),
        [
            getGateType(Nand).name,
            XorLevel.params.name,
            DecoderLevel.params.name
        ]
    ),
    x:10,y:1,
    type:Nand
}

export const OrLevel = {
    params:new GameViewParameters(
        "Join",
        `
        <p>An Or gate outputs power when recieving power from either of its inputs, 
        and is represented by a shape that's curved inward on one side and rounded on the other like an And gate</p>
        `,
        In2Out1,
        new ConnectionValueSignalSet(
            [
                new Signal<ConnectionValue>([{frame:0,value:true}]).push(
                    repeater(
                        new Signal<ConnectionValue>([
                            {
                                frame: 3,
                                value: false
                            },
                            {
                                frame: 9,
                                value: true
                            }
                        ]),
                        3
                    )
                ).push(new Signal<ConnectionValue>([{frame:3,value:false},{frame:6,value:false}])).push(
                    oscillator(3, 4)
                ),
                new Signal<ConnectionValue>([{frame:0,value:false},{frame:6,value:true}]).push(
                    repeater(
                        new Signal<ConnectionValue>([
                            {
                                frame: 3,
                                value: false
                            },
                            {
                                frame: 9,
                                value: true
                            }
                        ]),
                        3
                    )
                ).push(new Signal<ConnectionValue>([{frame:3,value:false}])).push(
                    oscillator(3, 4)
                )
            ],
            70,
            getGateType(Or)
        ),
        [
            NandLevel.params.name
        ]
    ),
    x:8, y:1,
    type:Or
}

export const AndLevel = {
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
        new ConnectionValueSignalSet(
            [
                new Signal<ConnectionValue>([{frame:0,value:false}])
                    .push(oscillator(10, 5)),
                new Signal<ConnectionValue>([
                    {
                        frame: 50,
                        value: true
                    }
                ])
            ],
            100,
            getGateType(And)
        ),
        [
            OrLevel.params.name,
            getGateType(Or).name
        ]
    ),
    x:6, y:3,
    type:And
}

export const NotLevel = {
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
        new ConnectionValueSignalSet(
            [
                new Signal<ConnectionValue>([{frame:0,value:false}])
                    .push(oscillator(10, 2))
                    .push(oscillator(5, 3))
                    .push(oscillator(3, 3))
                    .push(oscillator(1, 6))
            ],
            101,
            getGateType(Not)
        ),
        [
            OrLevel.params.name,
            getGateType(Or).name
        ]
    ),
    x:6, y:1,
    type:Not
};

export const BufLevel = {
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
        new ConnectionValueSignalSet(
            [
                new Signal<ConnectionValue>([{frame:0,value:false}]).push(oscillator(20, 2))
            ],
            80,
            getGateType(Buf)
        ),
        [
            getGateType(Not).name,
            getGateType(And).name,
            getGateType(Buf).name,
            NotLevel.params.name,
            AndLevel.params.name
        ]
    ),
    x:4, y:1,
    type:Buf
}

export const Freeplay = {
    params:new GameViewParameters(
        "Freeplay",
        "Have Fun!",
        {
            gateTypes: [
                getGateType(Input(10)),
                getGateType(Output(10))
            ],
            gates: [
                { x: 0, y: 0, id: 0, type: "Input10" } as SerializableGate,
                { x: 13, y: 0, id: 1, type: "Output10" } as SerializableGate
            ],
            size: [15, 10]
        },
        undefined,
        [],
        {},
        true
    ),
    x:18, y:0
}

const all_params = new Map<string, LevelParameters>([
    [Freeplay.params.name,Freeplay],
    [BufLevel.params.name,BufLevel],
    [NotLevel.params.name,NotLevel],
    [AndLevel.params.name,AndLevel],
    [OrLevel.params.name,OrLevel],
    [NandLevel.params.name, NandLevel],
    [XorLevel.params.name, XorLevel],
    [DecoderLevel.params.name, DecoderLevel],
    [EncoderLevel.params.name, EncoderLevel],
    [AdderLevel.params.name, AdderLevel]
])

export function getLevel(name:string) {
    const params = getLevelParams(name)
    if (params) return new Level(params)
}

export function getLevelParams(name:string) {
    return all_params.get(name)
}
