import { Connection } from "$lib/circuit_types/GateGraph";
import { GateType, GateTypeController, type ConnectionValue } from "$lib/circuit_types/GateType";
import { AdderNoCarry1, And, And3, Buf, Decoder2t4, Encoder4t2, FullAdder, HalfAdder, Input, InputDecodePrebaked, InputLabelledPrebaked, InputVariable, NBitAdder, Nand, Not, Or, Or3, Output, OutputDecodePrebaked, OutputLabelledPrebaked, OutputVariable, SevenSegmentOutput, Xor, combineGateTypeParameters, drawGateTypeDecode, exampleInputVariable, exampleOutputVariable, getGateType, type GateTypeParameters } from "$lib/dat/GateTypes/GateTypes";
import { ConnectionValueSignalSet, Signal, SignalSet, inverter, oscillator, repeater } from "$lib/signal_types/Signal";
import type { OrganizedCircuitContents, SerializableGate } from "$lib/storage_types/CircuitStorage";
import { ProgressStorage } from "$lib/storage_types/ProgressStore";
import { GameViewParameters } from "../../level_types/GameViewParameters";
import { Level } from "../../level_types/Level";

export type LevelParameters = {
    params?:GameViewParameters,
    x?:number,
    y?:number,
    desiredId?:number,
    type?:GateTypeParameters,
    playCondition?:boolean[],
    register?:boolean
}

const MinCircuit:OrganizedCircuitContents = {
    gateTypes: [getGateType(InputLabelledPrebaked[1]), getGateType(OutputLabelledPrebaked[1])],
    gates: [
        { x: 0, y: 3, id: 0, type: "Input1Labelled" } as SerializableGate,
        { x: 14, y: 3, id: 1, type: "Output1Labelled" } as SerializableGate
    ],
    size: [16, 8]
}

const In2Out1:OrganizedCircuitContents = {
    gateTypes: [
        getGateType(InputLabelledPrebaked[2]),
        getGateType(OutputLabelledPrebaked[1])
    ],
    gates: [
        { x: 0, y: 3, type: "Input2Labelled", id: 0 } as SerializableGate,
        { x: 14, y: 4, type: "Output1Labelled", id: 1 } as SerializableGate
    ],
    size: [16, 8]
};

const In3Out1:OrganizedCircuitContents = {
    gateTypes: [
        getGateType(InputLabelledPrebaked[3]),
        getGateType(OutputLabelledPrebaked[1])
    ],
    gates: [
        { x: 0, y: 3, type: "Input3Labelled", id: 0 } as SerializableGate,
        { x: 14, y: 4, type: "Output1Labelled", id: 1 } as SerializableGate
    ],
    size: [16, 9]
}

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

export const FullAdderLevel = {
    params:new GameViewParameters(
        "Full Adder",
        `
        <p>2 voltages together can represent any number from 0 to 3.</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr 1fr 1fr; width:50%; margin-left:25%; text-align:center;">
            <div style="grid-column: 1; grid-row: 1;">X0</div><div style="grid-column: 2; grid-row: 1;">X1</div><div style="grid-column: 3; grid-row: 1;">number</div>
            <div style="grid-column: 1; grid-row: 2; color:var(--connection-color-off);">0</div><div style="grid-column: 2; grid-row: 2; color:var(--connection-color-off);">0</div><div style="grid-column: 3; grid-row: 2;">0</div>
            <div style="grid-column: 1; grid-row: 3; color:var(--connection-color-on);">1</div><div style="grid-column: 2; grid-row: 3; color:var(--connection-color-off);">0</div><div style="grid-column: 3; grid-row: 3;">1</div>
            <div style="grid-column: 1; grid-row: 4; color:var(--connection-color-off);">0</div><div style="grid-column: 2; grid-row: 4; color:var(--connection-color-on);">1</div><div style="grid-column: 3; grid-row: 4;">2</div>
            <div style="grid-column: 1; grid-row: 5; color:var(--connection-color-on);">1</div><div style="grid-column: 2; grid-row: 5; color:var(--connection-color-on);">1</div><div style="grid-column: 3; grid-row: 5;">3</div>
        </div>
        <p>This <span style="color:var(--circuit-color);">circuit</span> has two pairs of input voltages: X0, X1, and Y0, Y1.</p>
        <p>The pairs have their matching numbers displayed next to them. Play the <span style="color:var(--circuit-color);">signal</span> to see the numbers change along with the voltages.</p>
        <p>If two voltages together can represent a single number, you can imagine "adding" two pairs. X0 and X1 plus Y0 and Y1, into S0 and S1 and Carry.</p>
        `,
        {
            gateTypes: [
                getGateType(InputVariable(2, "X")),
                getGateType(InputVariable(2, "Y")),
                getGateType(OutputVariable(2, "S")),
                getGateType(exampleOutputVariable('C Out')),
                getGateType(Xor),
                getGateType(combineGateTypeParameters(And, {name:"Carry And", outputLabels:["C in"]}))
            ],
            gates: [
                { x: 0, y: 1, type: "InputVariableX2", id: 0 } as SerializableGate,
                { x: 0, y: 5, type: "InputVariableY2", id: 1 } as SerializableGate,
                { x: 18, y: 2, type: "OutputVariableS2", id: 2 } as SerializableGate,
                { x: 18, y: 4, type: "OutputVariableC Out1", id: 3 } as SerializableGate,
                { x: 5, y: 0, type: "Xor", id: 4} as SerializableGate,
                { x: 5, y: 2, type: "Carry And", id: 5} as SerializableGate,
            ],
            connections: [
                new Connection(0, 0, 4, 0), new Connection(1, 0, 4, 1), new Connection(4, 0, 2, 0),
                new Connection(0, 0, 5, 0), new Connection(1, 0, 5, 1)
            ],
            size: [20, 9]
        },
        countingSignal(getGateType(NBitAdder(2)), 10, 2),
        [
            FullAdder.name
        ],
        false,
        {
            inputCheckboxes:false
        }
    ),
    x:18,y:6,desiredId:11,
    type:FullAdder,
    playCondition:[true, true]
}

export const CarryLevel = {
    params:new GameViewParameters(
        "Half Adder",
        `
        <p>The single output "S" can only be <span style="color:var(--connection-color-off);">0</span> or <span style="color:var(--connection-color-on);">1</span>.
        To represent larger numbers, we'll need more outputs.</p>
        <p>In this <span style="color:var(--circuit-color);">circuit</span>, there's an extra output called "Carry"</p>
        <p>This level is mostly the same as the last, except if the inputs add to 2, the "Carry" should be <span style="color:var(--connection-color-on);">1</span>.</p>
        <p>Carry is named after the technique of "carrying the 1" when adding two numbers on paper.</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr 1fr 1fr; width:25%; margin-left:25%;">
            <div style="grid-column: 3; grid-row: 1;">1</div>
            <div style="grid-column: 3; grid-row: 2;">1</div><div style="grid-column: 4; grid-row: 2;">9</div>
            <div style="grid-column: 1; grid-row: 3;">+</div><div style="grid-column: 3; grid-row: 3;">2</div><div style="grid-column: 4; grid-row: 3;">1</div>
            <div style="grid-column: 3; grid-row: 4;">4</div><div style="grid-column: 4; grid-row: 4;">0</div>
            <div style="grid-column: 1 / 5; grid-row: 4; width:100%; height:100%; border-top: 2px solid black;" ></div>
        </div>
        `,
        {
            gateTypes: [
                getGateType(exampleInputVariable('X')),
                getGateType(exampleInputVariable('Y')),
                getGateType(exampleOutputVariable('S')),
                getGateType(exampleOutputVariable('Carry'))
            ],
            gates: [
                { x: 0, y: 2, type: "InputVariableX1", id: 0 } as SerializableGate,
                { x: 0, y: 4, type: "InputVariableY1", id: 1 } as SerializableGate,
                { x: 14, y: 2, type: "OutputVariableS1", id: 2 } as SerializableGate,
                { x: 14, y: 4, type: "OutputVariableCarry1", id: 3 } as SerializableGate,
            ],
            size: [16, 7]
        },
        countingSignal(getGateType(HalfAdder), 5, 3),
        [
            HalfAdder.name,
            FullAdderLevel.params.name
        ]
    ),
    x:16,y:4,desiredId:10,
    type:HalfAdder,
    playCondition:[false, true]
}

export const AdderLevel = {
    params:new GameViewParameters(
        "1 and 0",
        `
        <p>It's normal to think of <span style="color:var(--connection-color-on);">high</span> voltage as
        <span style="color:var(--connection-color-on);">"1"</span> and
        <span style="color:var(--connection-color-off);">low</span> voltage as 
        <span style="color:var(--connection-color-off);">"0"</span></p>
        <p>Treating the voltages this way, you can imagine "adding" two voltages together.</p>
        <p>Here, the output should be <span style="color:var(--connection-color-on);">high</span> (<span style="color:var(--connection-color-on);">1</span>) when the two voltages "add" to <span style="color:var(--connection-color-on);">1</span>,
        and <span style="color:var(--connection-color-off);">low</span> (<span style="color:var(--connection-color-off);">0</span>) otherwise.</p>
        <p>Note that this means if the two voltages add to 2, the output should still be <span style="color:var(--connection-color-off);">0</span>.</p>
        <p><span style="color:var(--connection-color-on);">1</span> + <span style="color:var(--connection-color-on);">1</span> =
        <span style="color:var(--connection-color-off);">0</span>,</p>
        <p><span style="color:var(--connection-color-on);">1</span> + <span style="color:var(--connection-color-off);">0</span> =
        <span style="color:var(--connection-color-on);">1</span>, and</p>
        <p><span style="color:var(--connection-color-off);">0</span> + <span style="color:var(--connection-color-off);">0</span> =
        <span style="color:var(--connection-color-off);">0</span></p>
        <p>The best part is that the gate you need to win is already unlocked! You just have to pick the right one.</p>
        `,
        {
            gateTypes: [
                getGateType(exampleInputVariable('X')),
                getGateType(exampleInputVariable('Y')),
                getGateType(exampleOutputVariable('S'))
            ],
            gates: [
                { x: 0, y: 2, type: "InputVariableX1", id: 0 } as SerializableGate,
                { x: 0, y: 4, type: "InputVariableY1", id: 1 } as SerializableGate,
                { x: 14, y: 2, type: "OutputVariableS1", id: 2 } as SerializableGate
            ],
            size: [16, 7]
        },
        countingSignal(getGateType(AdderNoCarry1), 5, 3),
        [
            CarryLevel.params.name
        ]
    ),
    x:14,y:5, desiredId:9,
    type:AdderNoCarry1,
}

export const EncoderLevel = {
    params:new GameViewParameters(
        "Counting Backwards",
        `
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
        DecoderLevelSignal.flipInputsOutputs(),
        [
            getGateType(Encoder4t2).name,
            
        ],
        false,
        {
            inputCheckboxes:false
        }
    ),
    x:18,y:0, desiredId:8,
    type:Encoder4t2,
    playCondition:[true, true]
}

export const DecoderLevel = {
    params:new GameViewParameters(
        "Counting",
        `
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
        ],
        false,
        {
            inputCheckboxes:false
        }
    ),
    x:14,y:0, desiredId:7,
    type:Decoder2t4,
    playCondition:[false, false, true, false]
}

export const XorLevel = {
    params:new GameViewParameters(
        "Exclusion",
        `
        <p>Here's an example of making a more advanced gate</p>
        <p>Beating this level requires a "Xor" gate, short for "Exclusive Or." Like an Or gate but more... exclusive.</p>
        <p>It's up to you to analyze the <span style="color:var(--circuit-color);">signal</span> and construct the correct <span style="color:var(--circuit-color);">signal</span>.</p>
        `,
        {
            gateTypes: [
                getGateType(InputLabelledPrebaked[2]),
                getGateType(OutputLabelledPrebaked[1]),
                getGateType(Or)
            ],
            gates: [
                { x: 0, y: 3, type: "Input2Labelled", id: 0 } as SerializableGate,
                { x: 14, y: 3, type: "Output1Labelled", id: 1 } as SerializableGate,
                { x: 6, y: 4, type: "Or", id: 2} as SerializableGate
            ],
            connections: [
                new Connection(0, 0, 2, 0),
                new Connection(0, 1, 2, 1),
                new Connection(2, 0, 1, 0)
            ],
            size: [16, 8]
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
            AdderLevel.params.name
        ]
    ),
    x:11,y:2,desiredId:6,
    type:Xor
}

export const NandLevel = {
    params:new GameViewParameters(
        "No Combo",
        `
        <p>This level requires making a "Nand" gate to win.</p>
        <p>Nand stands for "Not And" and will always output the opposite of an And gate with the same inputs.</p>
        `,
        {
            gateTypes: [
                getGateType(InputLabelledPrebaked[2]),
                getGateType(OutputLabelledPrebaked[1]),
                getGateType(And)
            ],
            gates: [
                { x: 0, y: 3, type: "Input2Labelled", id: 0 } as SerializableGate,
                { x: 14, y: 4, type: "Output1Labelled", id: 1 } as SerializableGate,
                { x: 6, y: 3, type: "And", id: 2} as SerializableGate
            ],
            connections: [
                new Connection(0, 0, 2, 0),
                new Connection(0, 1, 2, 1),
                new Connection(2, 0, 1, 0)
            ],
            size: [16, 8]
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
            XorLevel.params.name
        ]
    ),
    x:9,y:0,desiredId:5,
    type:Nand
}

const Or3LevelInputs = [
    new Signal<ConnectionValue>([
        {frame:0,value:false},
        {frame:3,value:true},
        {frame:3,value:false},
        {frame:15,value:true},
        {frame:3,value:false},
        {frame:9,value:true},
        {frame:3,value:false},
    ]).push(
        oscillator(3, 3)
    ),
    new Signal<ConnectionValue>([
        {frame:0,value:false},
        {frame:9,value:true},
        {frame:3,value:false},
        {frame:9,value:true},
        {frame:3,value:false},
        {frame:3,value:true},
        {frame:3,value:false},
        {frame:6,value:false},
    ]).push(
        oscillator(3, 3)
    ),
    new Signal<ConnectionValue>([
        {frame:0,value:false},
        {frame:15,value:true},
        {frame:3,value:false},
        {frame:9,value:true},
        {frame:3,value:false},
        {frame:3,value:true},
        {frame:3,value:false},
    ]).push(
        oscillator(3, 3)
    ),
]

export const And3Level = {
    params:new GameViewParameters(
        "Bigger Combo",
        `
        <p>This level requires a 3-Input And gate, which outputs <span style="color:var(--connection-color-on);">high</span>
        only when all of its inputs are <span style="color:var(--connection-color-on);">high</span>.</p>
        <p>However, you might not have this exact gate already. If not, you'll have to connect multiple gates together to win.</p>
        `,
        In3Out1,
        new ConnectionValueSignalSet(
            Or3LevelInputs.map((s) => inverter(s)),
            60,
            getGateType(And3)
        ),
        [
            getGateType(And3).name
        ]
    ),
    x:8, y:2, desiredId:4,
    type:And3
}

export const Or3Level = {
    params:new GameViewParameters(
        "Joinyer",
        `
        <p>This level requires a 3-Input Or gate, which outputs <span style="color:var(--connection-color-on);">high</span>
        only when any of its inputs are <span style="color:var(--connection-color-on);">high</span>.</p>
        <p>However, you might not have this exact gate already. If not, you'll have to connect multiple gates together to win.</p>
        `,
        In3Out1,
        new ConnectionValueSignalSet(
            Or3LevelInputs,
            60,
            getGateType(Or3)
        ),
        [
            getGateType(Or3).name,
            XorLevel.params.name
        ]
    ),
    x:4, y:5, desiredId:3,
    type:Or3
}

export const OrLevel = {
    params:new GameViewParameters(
        "Join",
        `
        <p>This level requires an "Or" Gate.</p>
        <p>An Or Gate outputs <span style="color:var(--connection-color-on);">high</span> only
        when either of it's inputs are <span style="color:var(--connection-color-on);">high</span>.</p>
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
            Or3Level.params.name
        ]
    ),
    x:4, y:3, desiredId:2,
    type:Or
}

export const AndLevel = {
    params:new GameViewParameters(
        "Some Kind of Combo",
        `
        <p>This level requires an "And" Gate.</p>
        <p>An And Gate outputs <span style="color:var(--connection-color-on);">high</span> only
        when both of it's inputs are <span style="color:var(--connection-color-on);">high</span>.</p>
        `,
        In2Out1,
        new ConnectionValueSignalSet(
            [
                new Signal<ConnectionValue>([{frame:0,value:false}])
                    .push(oscillator(10, 5)),
                new Signal<ConnectionValue>([
                    {
                        frame: 0,
                        value: false
                    },
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
            And3Level.params.name,
            NandLevel.params.name
        ]
    ),
    x:6, y:1, desiredId:1,
    type:And
}

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
    ),
    x:18, y:0
}

export const Tutorial = {
    params:new GameViewParameters(
        "Tutorial",
        "",
        {
            gateTypes: [getGateType(InputLabelledPrebaked[1])],
            gates: [
                { x: 0, y: 3, id: 0, type: "Input1Labelled" } as SerializableGate
            ],
            size: [16, 8]
        },
        new ConnectionValueSignalSet(
            [
                new Signal<ConnectionValue>([{frame:0,value:false}])
                    .push(oscillator(10, 7))
            ],
            141,
            getGateType(Not)
        ),
        [
            getGateType(Or).name,
            getGateType(And).name,
            AndLevel.params.name,
            OrLevel.params.name,
        ]
    ),
    x:6, y:1,
    type:Not
}

const all_params = new Map<string, LevelParameters>([
    [Freeplay.params.name,Freeplay],
    [BufLevel.params.name,BufLevel],
    [AndLevel.params.name,AndLevel],
    [OrLevel.params.name,OrLevel],
    [Or3Level.params.name,Or3Level],
    [And3Level.params.name,And3Level],
    [NandLevel.params.name, NandLevel],
    [XorLevel.params.name, XorLevel],
    [DecoderLevel.params.name, DecoderLevel],
    [EncoderLevel.params.name, EncoderLevel],
    [AdderLevel.params.name, AdderLevel],
    [CarryLevel.params.name, CarryLevel],
    [FullAdderLevel.params.name, FullAdderLevel]
])

export function getLevel(name:string) {
    const params = getLevelParams(name)
    if (params) return new Level(params)
}

export function getLevelParams(name:string) {
    return all_params.get(name)
}
