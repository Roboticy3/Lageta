import { Connection } from "$lib/circuit_types/GateGraph";
import { GateType, GateTypeController, type ConnectionValue } from "$lib/circuit_types/GateType";
import { Add2, Add4, AdderNoCarry1, And, And3, Buf, Decoder2t4, Encoder4t2, FullAdder, HalfAdder, Input, InputDecodePrebaked, InputLabelledPrebaked, InputVariable, NBitAdder, Nand, Nor, Not, Or, Or3, Output, OutputDecodePrebaked, OutputLabelledPrebaked, OutputVariable, RandomGate1, SevenSegmentOutput, Xand, Xor, combineGateTypeParameters, drawGateTypeDecode, exampleInputVariable, exampleOutputVariable, getGateType, type GateTypeParameters } from "$lib/dat/GateTypes/GateTypes";
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

export const FourBitAdder = {
    params:new GameViewParameters(
        "4-bit Adder",
        `
        <p>The last adder level unlocked a gate called "Full Adder."</p>
        <p>Full Adder represents the part of the <span style="color:var(--circuit-color);">circuit</span> you filled in to complete the 2-bit adder.</p>
        <p>In that level, the Full Adder considered "C in" from the 1's place and X1 and Y1 from the 2's place to complete the sum.</p>
        <p>Adding and carrying works out the same way no matter which digit you're starting from, as long as you consider the "carry in" from the last digit, if it's there.</p>
        <p>Thanks to this property, you can link multiple Full Adders together with no modification to make larger adder <span style="color:var(--circuit-color);">circuit</span>!</p>
        `,
        {
            gateTypes: [
                getGateType(InputVariable(4, "X")),
                getGateType(InputVariable(4, "Y")),
                getGateType(InputVariable(4, "S")),
                getGateType(exampleOutputVariable('Carry'))
            ],
            gates: [
                {x:0, y:1, type:"InputVariableX4", id:0} as SerializableGate,
                {x:0, y:6, type:"InputVariableY4", id:1} as SerializableGate,
                {x:20, y:2, type:"OutputVariableS4", id:2} as SerializableGate,
                {x:20, y:7, type:"OutputVariableCarry1", id:3} as SerializableGate,
            ],
            size:[22, 11]
        },
        countingSignal(getGateType(Add4), 3, 2),
        [

        ],
    ),
    x:22, y:2, desiredId:15,
    type:getGateType(Add4),
    playCondition:[false, false, false, false, true]
}

export const RandomLevel1 = {
    params:new GameViewParameters(
        "Random 1",
        `
        <p>This level will introduce some formal logic that you can use to solve any level.</p>
        <p>Which is good, because the <span style="color:var(--circuit-color);">circuit</span> you need to win has been randomly generated!</p>
        <p>So, it may help to use <span style="font-style:italic;">Cases</span>:</p>
        <p>Cases are unique, possible situations.</p>
        <p>In school, cases can be the different schedules you may end up with next term.</p>
        <p>For <span style="color:var(--circuit-color);">circuits</span>, cases can be the different possible combinations of inputs.</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr 1fr 1fr; text-align:center; text-wrap:nowrap;">
            <div style="grid-column: 2; grid-row: 1;">Input 1</div><div style="grid-column: 3; grid-row: 1;">Input 2</div><div style="grid-column: 4; grid-row: 1;">Output 1</div><div style="grid-column: 5; grid-row: 1;">Output 2</div>
            <div style="grid-column: 1; grid-row: 2;">Case 1: </div><div style="grid-column: 2; grid-row: 2; color:var(--connection-color-off);">low</div><div style="grid-column: 3; grid-row: 2; color:var(--connection-color-off);">low</div><div style="grid-column: 4; grid-row: 2; color:var(--verification-color);">?</div><div style="grid-column: 5; grid-row: 2; color:var(--verification-color);">?</div>
            <div style="grid-column: 1; grid-row: 3;">Case 2: </div><div style="grid-column: 2; grid-row: 3; color:var(--connection-color-on);">high</div><div style="grid-column: 3; grid-row: 3; color:var(--connection-color-off);">low</div><div style="grid-column: 4; grid-row: 3; color:var(--verification-color);">?</div><div style="grid-column: 5; grid-row: 3; color:var(--verification-color);">?</div>
            <div style="grid-column: 1; grid-row: 4;">Case 3: </div><div style="grid-column: 2; grid-row: 4; color:var(--connection-color-off);">low</div><div style="grid-column: 3; grid-row: 4; color:var(--connection-color-on);">high</div><div style="grid-column: 4; grid-row: 4; color:var(--verification-color);">?</div><div style="grid-column: 5; grid-row: 4; color:var(--verification-color);">?</div>
            <div style="grid-column: 1; grid-row: 5;">Case 4: </div><div style="grid-column: 2; grid-row: 5; color:var(--connection-color-on);">high</div><div style="grid-column: 3; grid-row: 5; color:var(--connection-color-on);">high</div><div style="grid-column: 4; grid-row: 5; color:var(--verification-color);">?</div><div style="grid-column: 5; grid-row: 5; color:var(--verification-color);">?</div>
        </div>
        <p>The key to using cases is to deduce how a <span style="color:var(--circuit-color);">circuit</span> should behave under each case. 
        That means deducing the <span style="color:var(--verification-color);">desired</span> outputs.</p>
        <p>Then, you can build any <span style="color:var(--circuit-color);">circuit</span> by satisfying each case individually:</p>
        <p>Set the inputs to match Case 1, then edit the <span style="color:var(--circuit-color);">circuit</span> to match the <span style="color:var(--verification-color);">desired</span> outputs, then the same for Case 2, etc.</p>
        <p>When all the cases are covered, your <span style="color:var(--circuit-color);">circuit</span> will be <span style="color:var(--verification-color);">correct</span>.</p> 
        <p>It can also help to consider outputs individually from each other: solve all cases for one output and then the other. Really, the more you can break up a problem, the better.</p>
        `,
        {
            gateTypes: [
                getGateType(InputLabelledPrebaked[2]),
                getGateType(OutputLabelledPrebaked[2]),
            ],
            gates: [
                { x: 0, y: 3, type: "Input2Labelled", id: 0 } as SerializableGate,
                { x: 14, y: 3, type: "Output2Labelled", id: 1 } as SerializableGate,
            ],
            size: [16, 8]
        },
        countingSignal(getGateType(RandomGate1), 5, 3),
        []
    ),
    x:0,y:6,desiredId:14,
    type:RandomGate1,
    playCondition:[false, false]
}

export const NorLevel = {
    params:new GameViewParameters(
        "No Join",
        `
        <p>This level requires making a "Nor" gate to win.</p>
        <p>Nor stands for "Not Or" and will always output the opposite of an Or gate with the same inputs.</p>
        `,
        {
            gateTypes: [
                getGateType(InputLabelledPrebaked[2]),
                getGateType(OutputLabelledPrebaked[1]),
                getGateType(Or)
            ],
            gates: [
                { x: 0, y: 3, type: "Input2Labelled", id: 0 } as SerializableGate,
                { x: 14, y: 4, type: "Output1Labelled", id: 1 } as SerializableGate,
                { x: 6, y: 3, type: "Or", id: 2} as SerializableGate
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
            getGateType(Nor)
        ),
        [
            getGateType(Nor).name,
        ]
    ),
    x:0,y:2,desiredId:13,
    type:Nor
}

export const XandLevel = {
    params:new GameViewParameters(
        "Exclusion 2",
        `
        <p>Beating this level requires constructing a "Xand" gate.</p>
        <p>It may be more useful to refer to this gate as an "Equals" gate. To emulate it, this circuit should output <span style="color:var(--connection-color-on);">high</span> only when either:
            <p>both of its inputs are <span style="color:var(--connection-color-on);">high</span></p>
            <p>or both of its inputs are <span style="color:var(--connection-color-off);">low</span></p>
        </p>
        `,
        {
            gateTypes: [
                getGateType(InputLabelledPrebaked[2]),
                getGateType(OutputLabelledPrebaked[1]),
                getGateType(And)
            ],
            gates: [
                { x: 0, y: 3, type: "Input2Labelled", id: 0 } as SerializableGate,
                { x: 14, y: 3, type: "Output1Labelled", id: 1 } as SerializableGate,
                { x: 6, y: 4, type: "And", id: 2} as SerializableGate
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
            getGateType(Xand)
        ),
        [
            getGateType(Xand).name,
            RandomLevel1.params.name
        ]
    ),
    x:0,y:4,desiredId:12,
    type:Xand
}

export const FullAdderLevel = {
    params:new GameViewParameters(
        "Full Adder",
        `
        <p>This level requires a <span style="color:var(--circuit-color);">circuit</span> that adds two 2-digit binary numbers.</p>
        <p>Adding binary numbers is enough like adding decimal numbers that it can be written on paper in the same way:</p>
        <div style="display:flex; justify-content:space-evenly;">
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr 1fr 1fr; width:25%; text-wrap:nowrap;">
                <div style="grid-column: 2; grid-row: 1;">1</div><div style="grid-column: 3; grid-row: 1;">1</div>
                <div style="grid-column: 3; grid-row: 2;">0</div><div style="grid-column: 4; grid-row: 2;">1</div>
                <div style="grid-column: 1; grid-row: 3;">+</div><div style="grid-column: 3; grid-row: 3;">1</div><div style="grid-column: 4; grid-row: 3;">1</div>
                <div style="grid-column: 2; grid-row: 4;">1</div><div style="grid-column: 3; grid-row: 4;">0</div><div style="grid-column: 4; grid-row: 4;">0</div>
                <div style="grid-column: 1 / 5; grid-row: 4; width:100%; height:100%; border-top: 2px solid black;" ></div>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr 1fr 1fr 1fr; width:12%; text-wrap:nowrap;">
                <div style="grid-column: 2; grid-row: 2;">1</div>
                <div style="grid-column: 1; grid-row: 3;">+</div><div style="grid-column: 2; grid-row: 3;">3</div>
                <div style="grid-column: 2; grid-row: 4;">4</div>
                <div style="grid-column: 1 / 5; grid-row: 4; width:100%; height:100%; border-top: 2px solid black;" ></div>
            </div>
        </div>
        <p>Adding the 1's places together is the same as the last adder level, and has been filled in for you.</p>
        <p>The point in the <span style="color:var(--circuit-color);">circuit</span> labelled "C In" represents the carry from the addition of the 1's places.</p>
        <p>"C out" is the carry from the addition of the 2's places.</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr; text-align:center; text-wrap:nowrap;">
            <div style="grid-column: 2; grid-row: 1;">"C Out"</div><div style="grid-column: 3; grid-row: 1;">"C In"</div>
            <div style="grid-column: 2; grid-row: 2;">1</div><div style="grid-column: 3; grid-row: 2;">1</div>
            <div style="grid-column: 3; grid-row: 3;">0</div><div style="grid-column: 4; grid-row: 3;">1</div>
            <div style="grid-column: 1; grid-row: 4;">+</div><div style="grid-column: 3; grid-row: 4;">1</div><div style="grid-column: 4; grid-row: 4;">1</div>
            <div style="grid-column: 2; grid-row: 5;">1</div><div style="grid-column: 3; grid-row: 5;">0</div><div style="grid-column: 4; grid-row: 5;">0</div>
            <div style="grid-column: 1 / 5; grid-row: 5; width:100%; height:100%; border-top: 2px solid black;" ></div>
        </div>
        <p>Note that to add together the 2's places, you have to consider the carry from the 1's places as well as X1 and Y1.</p>
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
        countingSignal(getGateType(Add2), 10, 2),
        [
            FullAdder.name,
            FourBitAdder.params.name
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
        <p>Here, the output should be <span style="color:var(--connection-color-on);">high</span> (<span style="color:var(--connection-color-on);">1</span>) when the two inputs X and Y "add" to <span style="color:var(--connection-color-on);">1</span>,
        and <span style="color:var(--connection-color-off);">low</span> (<span style="color:var(--connection-color-off);">0</span>) otherwise.</p>
        <p>Note that this means if X and Y add to 2, the output should still be <span style="color:var(--connection-color-off);">0</span>.</p>
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

export const DecoderLevel = {
    params:new GameViewParameters(
        "Counting",
        `
        <p>The number "19" has a "1" in the 10's place and a "9" in the 1's place.</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; align-self:center; text-align:center; text-wrap:nowrap;">
            <div style="grid-column: 1; grid-row: 1;">place</div><div style="grid-column: 2; grid-row: 1;">10's</div><div style="grid-column: 3; grid-row: 1;">1's</div>
            <div style="grid-column: 1 / 4; grid-row: 2; border-top: solid black 2px; width:100%"></div>
            <div style="grid-column: 1; grid-row: 2;">digit</div><div style="grid-column: 2; grid-row: 2;">1</div><div style="grid-column: 3; grid-row: 2;">9</div>
            <div style="grid-column: 1 / 4; grid-row: 3; border-top: solid black 2px; width:100%"></div>
            <div style="grid-column: 2; grid-row: 3;">10 * 1 + </div><div style="grid-column: 3; grid-row: 3;">9 = </div>
            <div style="grid-column: 4; grid-row: 3; border: dashed var(--verification-color) 4px; border-radius: 25%;">19</div>
        </div>
        <p>This level requires you to "decode" X0 and X1 into a decimal number.</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; align-self:center; text-align:center; text-wrap:nowrap;">
            <div style="grid-column: 1; grid-row: 1;">place</div><div style="grid-column: 2; grid-row: 1;">2's</div><div style="grid-column: 3; grid-row: 1;">1's</div>
            <div style="grid-column: 1 / 4; grid-row: 2; border-top: solid black 2px; width:100%"></div>
            <div style="grid-column: 1; grid-row: 2;">digit</div><div style="grid-column: 2; grid-row: 2;">X1</div><div style="grid-column: 3; grid-row: 2;">X0</div>
            <div style="grid-column: 1 / 4; grid-row: 3; border-top: solid black 2px; width:100%"></div>
            <div style="grid-column: 2; grid-row: 3;">2 * X1 + </div><div style="grid-column: 3; grid-row: 3;">X0 = </div>
            <div style="grid-column: 4; grid-row: 3; border: dashed var(--verification-color) 4px; border-radius: 25%; color: var(--verification-color);">?</div>
        </div>
        <p>It turns out that a decoder <span style="color:var(--circuit-color);">circuit</span> is significantly more complicated than the <span style="color:var(--circuit-color);">circuit</span> circuit.</p>
        `,
        {
            gateTypes: [
                getGateType(InputVariable(2, 'X')),
                getGateType(Output(4,
                    { name:"Output4Decoded", inputLabels: ["0", "1", "2", "3"], gridSize: [2, 7]}
                ))
            ],
            gates: [
                { x: 0, y: 4, type: "InputVariableX2", id: 0 } as SerializableGate,
                { x: 18, y: 2, type: "Output4Decoded", id: 1 } as SerializableGate
            ],
            size: [20, 11]
        },
        DecoderLevelSignal,
        [
            getGateType(Decoder2t4).name,
            FullAdderLevel.params.name,
        ],
        false,
        {
            inputCheckboxes:false
        }
    ),
    x:18,y:0, desiredId:7,
    type:Decoder2t4,
    playCondition:[false, false, true, false]
}

export const EncoderLevel = {
    params:new GameViewParameters(
        "Counting Backwards",
        `
        <p>2 voltages together can represent any number from 0 to 3.</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr 1fr 1fr; width:50%; margin-left:25%; text-align:center;">
            <div style="grid-column: 1; grid-row: 1;">X0</div><div style="grid-column: 2; grid-row: 1;">X1</div><div style="grid-column: 3; grid-row: 1;">number</div>
            <div style="grid-column: 1; grid-row: 2; color:var(--connection-color-off);">0</div><div style="grid-column: 2; grid-row: 2; color:var(--connection-color-off);">0</div><div style="grid-column: 3; grid-row: 2;">0</div>
            <div style="grid-column: 1; grid-row: 3; color:var(--connection-color-on);">1</div><div style="grid-column: 2; grid-row: 3; color:var(--connection-color-off);">0</div><div style="grid-column: 3; grid-row: 3;">1</div>
            <div style="grid-column: 1; grid-row: 4; color:var(--connection-color-off);">0</div><div style="grid-column: 2; grid-row: 4; color:var(--connection-color-on);">1</div><div style="grid-column: 3; grid-row: 4;">2</div>
            <div style="grid-column: 1; grid-row: 5; color:var(--connection-color-on);">1</div><div style="grid-column: 2; grid-row: 5; color:var(--connection-color-on);">1</div><div style="grid-column: 3; grid-row: 5;">3</div>
        </div>
        <p>This <span style="color:var(--circuit-color);">circuit</span> has a pair of outputs: X0 and X1.</p>
        <p>The pair has its matching number displayed next to it.</p>
        <p>Your goal here is to "encode" the input, which is either 0, 1, 2, or 3, to the correct pair of outputs, X0 and X1, according to the table above.</p>
        `,
        {
            gateTypes: [
                getGateType(Input(4,
                    { name:"Input4Decoded", outputLabels: ["0", "1", "2", "3"], gridSize: [2, 7] }
                )),
                getGateType(OutputVariable(2, 'X'))
            ],
            gates: [
                { x: 0, y: 2, type: "Input4Decoded", id: 0 } as SerializableGate,
                { x: 18, y: 4, type: "OutputVariableX2", id: 1 } as SerializableGate
            ],
            size: [20, 11]
        },
        DecoderLevelSignal.flipInputsOutputs() as ConnectionValueSignalSet,
        [
            getGateType(Encoder4t2).name,
            DecoderLevel.params.name
        ],
        false,
        {
            inputCheckboxes:false
        }
    ),
    x:14,y:0, desiredId:8,
    type:Encoder4t2,
    playCondition:[true, true]
}

export const XorLevel = {
    params:new GameViewParameters(
        "Exclusion",
        `
        <p>Beating this level requires constructing a "Xor" gate, which is like an Or gate but more... exclusive.</p>
        <p>The Xor gate should output <span style="color:var(--connection-color-on);">high</span> when only one of its inputs are <span style="color:var(--connection-color-on);">high</span>.</p>
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
            AdderLevel.params.name,
            EncoderLevel.params.name,
            XandLevel.params.name,
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
            Or3Level.params.name,
            NorLevel.params.name
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
    [NorLevel.params.name, NorLevel],
    [XorLevel.params.name, XorLevel],
    [XandLevel.params.name, XandLevel],
    [DecoderLevel.params.name, DecoderLevel],
    [EncoderLevel.params.name, EncoderLevel],
    [AdderLevel.params.name, AdderLevel],
    [CarryLevel.params.name, CarryLevel],
    [FullAdderLevel.params.name, FullAdderLevel],
    [RandomLevel1.params.name, RandomLevel1],
    [FourBitAdder.params.name, FourBitAdder]
])

export function getLevel(name:string) {
    const params = getLevelParams(name)
    if (params) return new Level(params)
}

export function getLevelParams(name:string) {
    return all_params.get(name)
}
