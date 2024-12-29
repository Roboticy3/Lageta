import { Connection } from "$lib/circuit_types/GateGraph";
import { GateType, GateTypeController, type ConnectionValue } from "$lib/circuit_types/GateType";
import { Add2, Add4, AdderNoCarry1, And, And3, And4, BCDDecoder, Buf, Decoder2t4, Encoder4t2, FullAdder, HalfAdder, Input, InputDecodePrebaked, InputLabelledPrebaked, InputVariable, NBitAdder, Nand, Nor, Not, Or, Or3, Or4, Output, OutputDecodePrebaked, OutputLabelledPrebaked, OutputVariable, RandomGate1, SevenSegmentDecoder, SevenSegmentOutput, Xand, Xor, combineGateTypeParameters, drawGateTypeDecode, exampleInputVariable, exampleOutputVariable, getGateType, type GateTypeParameters } from "$lib/dat/GateTypes/GateTypes";
import { ConnectionValueSignalSet, Signal, SignalSet, inverter, oscillator, repeater } from "$lib/signal_types/Signal";
import type { OrganizedCircuitContents, SerializableGate } from "$lib/storage_types/CircuitStorage";
import { ProgressStorage } from "$lib/storage_types/ProgressStore";
import type { GameViewParameters, GridSource } from "$lib/level_types/GameViewParameters";
import { Level } from "../../level_types/Level";
import { StickersTool, TruthTableTool } from "../Tools/Tools";
export type LevelParameters = {
  params?: GameViewParameters;
  x?: number;
  y?: number;
  desiredId?: number;
  type?: GateTypeParameters;
  playCondition?: boolean[];
  register?: boolean;
};
const MinCircuit: OrganizedCircuitContents = {
  gateTypes: [getGateType(InputLabelledPrebaked[1]), getGateType(OutputLabelledPrebaked[1])],
  gates: [{
    x: 0,
    y: 3,
    id: 0,
    type: "Input1Labelled"
  } as SerializableGate, {
    x: 14,
    y: 3,
    id: 1,
    type: "Output1Labelled"
  } as SerializableGate],
  size: [16, 8]
};
const In2Out1: OrganizedCircuitContents = {
  gateTypes: [getGateType(InputLabelledPrebaked[2]), getGateType(OutputLabelledPrebaked[1])],
  gates: [{
    x: 0,
    y: 3,
    type: "Input2Labelled",
    id: 0
  } as SerializableGate, {
    x: 14,
    y: 4,
    type: "Output1Labelled",
    id: 1
  } as SerializableGate],
  size: [16, 8]
};
const In3Out1: OrganizedCircuitContents = {
  gateTypes: [getGateType(InputLabelledPrebaked[3]), getGateType(OutputLabelledPrebaked[1])],
  gates: [{
    x: 0,
    y: 3,
    type: "Input3Labelled",
    id: 0
  } as SerializableGate, {
    x: 14,
    y: 4,
    type: "Output1Labelled",
    id: 1
  } as SerializableGate],
  size: [16, 9]
};
const DecoderLevelSignal = new ConnectionValueSignalSet([new Signal<ConnectionValue>([{
  frame: 0,
  value: false
}]).push(oscillator(5, 10)), new Signal<ConnectionValue>([{
  frame: 0,
  value: false
}]).push(oscillator(10, 5))], 101, getGateType(Decoder2t4));

/**
 * Generate a signal to test all of the inputs of a solver
 * @param solver the solver the inputs are generated for
 * @param step the number of frames each input lasts
 * @param repeat if given, the signal will be repeated this many times
 * @returns 
 */
function countingSignal(solver: GateTypeController, step: number, repeat?: number, maxCount?: number) {
  const bits = solver.model.sizeIn;
  let block = new Array<Signal<ConnectionValue>>(bits);
  //the permutations is usually 2^bits, but if a smaller cutoff is provided, that takes priority
  const permutations = maxCount ? Math.min(Math.pow(2, bits), maxCount) : Math.pow(2, bits);
  //construct the signal from layered oscillators
  //each permutation should occur exactly once, so the length of the signal is permutations * step
  const length = permutations * step * (repeat || 1);
  for (let i = 0; i < block.length; i++) {
    //the step length of the oscillator at each layer should be twice as wide as the last
    //meanwhile, each layer should repeat half as much as the last
    //since an oscillator of n repeats creates a signal of step * 2 frames, the repeats should start at length / 2 and halve on each iteration
    //if maxCount is provided, maxCount will be exceeded after counting up maxCount * 2 * step frames
    const repeat = Math.pow(2, bits - i - 1);
    block[i] = new Signal<ConnectionValue>([{
      value: false,
      frame: 0
    }]).push(oscillator(Math.pow(2, i) * step, maxCount ? Math.min(repeat, Math.floor(maxCount / 2)) : repeat));
  }
  if (repeat) {
    block.forEach((s, i) => {
      block[i] = repeater(s, repeat);
    });
  }
  const result = new ConnectionValueSignalSet(block, length, solver);
  console.log("created counting signal ", result);
  return result;
}

export const SevenSegmentLevel:LevelParameters = {
  params: {
    name: "Seven Segment Display",
    directions: `
        <p>Each output corresponds to one of the lights in the seven-segment display.</p>
        <p>Given a number in binary, display the appropriate number in the seven segment display.</p>
        <p>Try to match the signal for each output one-by-one.</p>
        <p>Good luck!</p>
        `,
    grid: {
      gateTypes: [getGateType(InputVariable(4, 'X')), getGateType(SevenSegmentOutput)],
      gates: [{
        x: 0,
        y: 6,
        type: "InputVariableX4",
        id: 0
      } as SerializableGate, {
        x: 31,
        y: 5,
        type: "7-Segment Display",
        id: 1
      } as SerializableGate],
      size: [36, 16]
    } as GridSource,
    completeCondition: countingSignal(getGateType(SevenSegmentDecoder), 5, 1, 10),
    completeRewards: [SevenSegmentDecoder.name]
  },
  type: getGateType(SevenSegmentDecoder),
  x: 10,
  y: 4,
  desiredId: 17
};
export const FourBitDecoder:LevelParameters = {
  params: {
    name: "BCD",
    directions: `
        <p>With 4 bits, the input can represent any number from 0 through 15.</p>
        <p>However, this output only has pins for 0 through 9.</p>
        <p>That's because this particular input represents a "Binary Coded Decimal," or BCD.</p>
        <p>BCD's are the same as any other binary number, except any value above 9 is discarded.</p>
        <p>If the input has a value of 10 through 15, you must not setting any of the outputs to <span style="color:var(--connection-color-on);">high</span>.</p>
        <p>Lageta largely automates displaying numbers for your circuits. But in real life, displaying numbers from circuits takes a lot of work. Understanding BCD's is the first step to learning how to make your own displays.</p>
        `,
    grid: {
      gateTypes: [getGateType(InputVariable(4, "X")), getGateType(Output(10, {
        name: "Output10Decoded",
        inputLabels: new Array(10).fill('').map((_v, i) => `${i}`),
        gridSize: [2, 10]
      }))],
      gates: [{
        x: 0,
        y: 4,
        type: "InputVariableX4",
        id: 0
      } as SerializableGate, {
        x: 20,
        y: 1,
        type: "Output10Decoded",
        id: 1
      } as SerializableGate],
      size: [22, 12]
    } as GridSource,
    completeCondition: countingSignal(getGateType(BCDDecoder), 5, 1, 10),
    completeRewards: []
  },
  type: getGateType(OutputVariable(4, 'X')),
  x: 15,
  y: 7,
  desiredId: 16
};
export const FourBitAdder:LevelParameters = {
  params: {
    name: "4-bit Adder",
    directions: `
        <p>The last adder level unlocked a gate called "Full Adder."</p>
        <p>Full Adder represents the part of the <span style="color:var(--circuit-color);">circuit</span> you filled in to complete the 2-bit adder.</p>
        <p>In that level, the Full Adder considered "C in" from the 1's place and X1 and Y1 from the 2's place to complete the sum.</p>
        <p>Adding and carrying works out the same way no matter which digit you're starting from, as long as you consider the "carry in" from the last digit, if it's there.</p>
        <p>Thanks to this property, you can link multiple Full Adders together with no modification to make larger adder <span style="color:var(--circuit-color);">circuit</span>!</p>
        `,
    grid: {
      gateTypes: [getGateType(InputVariable(4, "X")), getGateType(InputVariable(4, "Y")), getGateType(OutputVariable(4, "S")), getGateType(exampleOutputVariable('Carry')), getGateType(FullAdder)],
      gates: [{
        x: 0,
        y: 1,
        type: "InputVariableX4",
        id: 0
      } as SerializableGate, {
        x: 0,
        y: 6,
        type: "InputVariableY4",
        id: 1
      } as SerializableGate, {
        x: 19,
        y: 2,
        type: "OutputVariableS4",
        id: 2
      } as SerializableGate, {
        x: 20,
        y: 7,
        type: "OutputVariableCarry1",
        id: 3
      } as SerializableGate, {
        x: 7,
        y: 1,
        type: "FullAdder",
        id: 4
      } as SerializableGate],
      connections: [new Connection(0, 0, 4, 1), new Connection(1, 0, 4, 2), new Connection(4, 0, 2, 0)],
      size: [22, 11]
    } as GridSource,
    completeCondition: countingSignal(getGateType(Add4), 2),
    completeRewards: [SevenSegmentLevel.params?.name || "?", SevenSegmentOutput.name]
  },
  x: 22,
  y: 2,
  desiredId: 15,
  type: getGateType(Add4),
  playCondition: [false, false, false, true, false]
};
export const RandomLevel1:LevelParameters = {
  params: {
    name: "Random 1",
    directions: `
        <p>The <span style="color:var(--circuit-color);">circuit</span> you need to win has been randomly generated!</p>
        `,
    grid: {
      gateTypes: [getGateType(InputLabelledPrebaked[2]), getGateType(OutputLabelledPrebaked[2])],
      gates: [{
        x: 0,
        y: 3,
        type: "Input2Labelled",
        id: 0
      } as SerializableGate, {
        x: 14,
        y: 3,
        type: "Output2Labelled",
        id: 1
      } as SerializableGate],
      size: [16, 8]
    } as GridSource,
    completeCondition: countingSignal(getGateType(RandomGate1), 5, 3),
    completeRewards: [TruthTableTool.name]
  },
  x: 0,
  y: 6,
  desiredId: 14,
  type: RandomGate1,
  playCondition: [false, false]
};
export const XandLevel:LevelParameters = {
  params: {
    name: "Exclusion 2",
    directions: `
        <p>Beating this level requires constructing a "Xand" gate.</p>
        <p>However, it may be more useful to refer to it as an "Equals" gate, since this circuit should only output <span style="color:var(--connection-color-on);">high</span> when:
            <p>both of its inputs are <span style="color:var(--connection-color-on);">high</span></p>
            <p>or</p>
            <p>both of its inputs are <span style="color:var(--connection-color-off);">low</span></p>
        </p>
        `,
    grid: {
      gateTypes: [getGateType(InputLabelledPrebaked[2]), getGateType(OutputLabelledPrebaked[1]), getGateType(And)],
      gates: [{
        x: 0,
        y: 3,
        type: "Input2Labelled",
        id: 0
      } as SerializableGate, {
        x: 14,
        y: 3,
        type: "Output1Labelled",
        id: 1
      } as SerializableGate, {
        x: 6,
        y: 4,
        type: "And",
        id: 2
      } as SerializableGate],
      connections: [new Connection(0, 0, 2, 0), new Connection(0, 1, 2, 1), new Connection(2, 0, 1, 0)],
      size: [16, 8]
    } as GridSource,
    completeCondition: new ConnectionValueSignalSet([new Signal<ConnectionValue>([{
      frame: 0,
      value: false
    }]).push(oscillator(10, 10)), new Signal<ConnectionValue>([{
      frame: 5,
      value: false
    }]).push(oscillator(10, 9))], 200, getGateType(Xand)),
    completeRewards: [getGateType(Xand).name, RandomLevel1.params?.name || "?"]
  },
  x: 0,
  y: 4,
  desiredId: 12,
  type: Xand
};
export const FullAdderLevel:LevelParameters = {
  params: {
    name: "Full Adder",
    directions: `
        <p>This level requires a <span style="color:var(--circuit-color);">circuit</span> that adds two 2-digit binary numbers.</p>
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
        <p>To complete the addition, you need to continue carrying numbers. This requires you to translate 3 inputs - the second binary digits of each number, and the carry from adding the first digits, to 2 outputs, the second binary digit of the sum and a final carry.</p>
        `,
    grid: {
      gateTypes: [getGateType(InputVariable(2, "X")), getGateType(InputVariable(2, "Y")), getGateType(OutputVariable(2, "S")), getGateType(exampleOutputVariable('C Out')), getGateType(HalfAdder)],
      gates: [{
        x: 0,
        y: 1,
        type: "InputVariableX2",
        id: 0
      } as SerializableGate, {
        x: 0,
        y: 5,
        type: "InputVariableY2",
        id: 1
      } as SerializableGate, {
        x: 18,
        y: 2,
        type: "OutputVariableS2",
        id: 2
      } as SerializableGate, {
        x: 18,
        y: 4,
        type: "OutputVariableC Out1",
        id: 3
      } as SerializableGate, {
        x: 5,
        y: 0,
        type: "HalfAdder",
        id: 4
      } as SerializableGate],
      connections: [new Connection(0, 0, 4, 0), new Connection(1, 0, 4, 1), new Connection(4, 0, 2, 0)],
      size: [20, 9]
    } as GridSource,
    completeCondition: countingSignal(getGateType(Add2), 10, 2),
    completeRewards: [FullAdder.name, FourBitAdder.params?.name || "?"]
  },
  x: 18,
  y: 6,
  desiredId: 10,
  type: FullAdder,
  playCondition: [true, true]
};
export const CarryLevel:LevelParameters = {
  params: {
    name: "Half Adder",
    directions: `
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
    grid: {
      gateTypes: [getGateType(exampleInputVariable('X')), getGateType(exampleInputVariable('Y')), getGateType(exampleOutputVariable('S')), getGateType(exampleOutputVariable('Carry'))],
      gates: [{
        x: 0,
        y: 2,
        type: "InputVariableX1",
        id: 0
      } as SerializableGate, {
        x: 0,
        y: 4,
        type: "InputVariableY1",
        id: 1
      } as SerializableGate, {
        x: 14,
        y: 2,
        type: "OutputVariableS1",
        id: 2
      } as SerializableGate, {
        x: 14,
        y: 4,
        type: "OutputVariableCarry1",
        id: 3
      } as SerializableGate],
      size: [16, 7]
    } as GridSource,
    completeCondition: countingSignal(getGateType(HalfAdder), 5, 3),
    completeRewards: [HalfAdder.name, FullAdderLevel.params?.name || "?"]
  },
  x: 16,
  y: 4,
  desiredId: 9,
  type: HalfAdder,
  playCondition: [true, false]
};
export const AdderLevel:LevelParameters = {
  params: {
    name: "1 and 0",
    directions: `
        <p>It's normal to think of <span style="color:var(--connection-color-on);">high</span> voltage as
        <span style="color:var(--connection-color-on);">"1"</span> and
        <span style="color:var(--connection-color-off);">low</span> voltage as 
        <span style="color:var(--connection-color-off);">"0"</span></p>
        <p>Treating the voltages this way, you can imagine "adding" two voltages together.</p>
        <p>Here, the output should be <span style="color:var(--connection-color-on);">high</span> (<span style="color:var(--connection-color-on);">1</span>) when the two inputs X and Y "add" to <span style="color:var(--connection-color-on);">1</span>,
        and <span style="color:var(--connection-color-off);">low</span> (<span style="color:var(--connection-color-off);">0</span>) otherwise.</p>
        <p>Note that if X and Y add to 2, the output should still be <span style="color:var(--connection-color-off);">0</span>.</p>
        <p><span style="color:var(--connection-color-on);">1</span> + <span style="color:var(--connection-color-on);">1</span> =
        <span style="color:var(--connection-color-off);">0</span>,</p>
        <p><span style="color:var(--connection-color-on);">1</span> + <span style="color:var(--connection-color-off);">0</span> =
        <span style="color:var(--connection-color-on);">1</span>, and</p>
        <p><span style="color:var(--connection-color-off);">0</span> + <span style="color:var(--connection-color-off);">0</span> =
        <span style="color:var(--connection-color-off);">0</span></p>
        <p>The best part is that the gate you need to win is already unlocked! You just have to pick the right one.</p>
        `,
    grid: {
      gateTypes: [getGateType(exampleInputVariable('X')), getGateType(exampleInputVariable('Y')), getGateType(exampleOutputVariable('S'))],
      gates: [{
        x: 0,
        y: 2,
        type: "InputVariableX1",
        id: 0
      } as SerializableGate, {
        x: 0,
        y: 4,
        type: "InputVariableY1",
        id: 1
      } as SerializableGate, {
        x: 14,
        y: 2,
        type: "OutputVariableS1",
        id: 2
      } as SerializableGate],
      size: [16, 7]
    } as GridSource,
    completeCondition: countingSignal(getGateType(AdderNoCarry1), 5, 3),
    completeRewards: [CarryLevel.params?.name || "?"]
  },
  x: 14,
  y: 5,
  desiredId: 8,
  type: AdderNoCarry1
};
export const DecoderLevel:LevelParameters = {
  params: {
    name: "Counting",
    directions: `
        <p>The number "19" has a "1" in the 10's place and a "9" in the 1's place.</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; align-self:center; text-align:center; text-wrap:nowrap;">
            <div style="grid-column: 1; grid-row: 1;">place</div><div style="grid-column: 2; grid-row: 1;">10's</div><div style="grid-column: 3; grid-row: 1;">1's</div>
            <div style="grid-column: 1 / 4; grid-row: 2; border-top: solid black 2px; width:100%"></div>
            <div style="grid-column: 1; grid-row: 2;">digit</div><div style="grid-column: 2; grid-row: 2;">1</div><div style="grid-column: 3; grid-row: 2;">9</div>
            <div style="grid-column: 1 / 4; grid-row: 3; border-top: solid black 2px; width:100%"></div>
            <div style="grid-column: 2; grid-row: 3;">10 * 1 + </div><div style="grid-column: 3; grid-row: 3;">9 = </div>
            <div style="grid-column: 4; grid-row: 3; border: dashed var(--verification-color) 4px; border-radius: 25%;">19</div>
        </div>
        <p>This is a "base 10" number. However, circuits represent numbers in "base 2."</p>
        <p>Instead of a 1's place, 10's place, 100's place and so on, base 2 numbers have a 1's place, 2's place, 4's place and so on.</p>
        <p>This level requires you to "decode" X0 and X1 from a base 2 representation, to one of the outputs labelled in base 10.</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr; align-self:center; text-align:center; text-wrap:nowrap;">
            <div style="grid-column: 1; grid-row: 1;">place</div><div style="grid-column: 2; grid-row: 1;">2's</div><div style="grid-column: 3; grid-row: 1;">1's</div>
            <div style="grid-column: 1 / 4; grid-row: 2; border-top: solid black 2px; width:100%"></div>
            <div style="grid-column: 1; grid-row: 2;">digit</div><div style="grid-column: 2; grid-row: 2;">X1</div><div style="grid-column: 3; grid-row: 2;">X0</div>
            <div style="grid-column: 1 / 4; grid-row: 3; border-top: solid black 2px; width:100%"></div>
            <div style="grid-column: 2; grid-row: 3;">2 * X1 + </div><div style="grid-column: 3; grid-row: 3;">X0 = </div>
            <div style="grid-column: 4; grid-row: 3; border: dashed var(--verification-color) 4px; border-radius: 25%; color: var(--verification-color);">?</div>
        </div>
        <p>This is the opposite of the "encoder" <span style="color:var(--circuit-color);">circuit</span> you made before, and it turns out to be significantly more complicated.</p>
        <p>Take your time, most levels are optional to beat the final level!</p>
        `,
    grid: {
      gateTypes: [getGateType(InputVariable(2, 'X')), getGateType(Output(4, {
        name: "Output4Decoded",
        inputLabels: ["0", "1", "2", "3"],
        gridSize: [2, 7]
      }))],
      gates: [{
        x: 0,
        y: 4,
        type: "InputVariableX2",
        id: 0
      } as SerializableGate, {
        x: 18,
        y: 2,
        type: "Output4Decoded",
        id: 1
      } as SerializableGate],
      size: [20, 11]
    } as GridSource,
    completeCondition: DecoderLevelSignal,
    completeRewards: [getGateType(Decoder2t4).name, FullAdderLevel.params?.name || "?", FourBitDecoder.params?.name || "?"]
  },
  x: 18,
  y: 0,
  desiredId: 7,
  type: Decoder2t4,
  playCondition: [false, false, true, false]
};
export const EncoderLevel:LevelParameters = {
  params: {
    name: "Counting Backwards",
    directions: `
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
    grid: {
      gateTypes: [getGateType(Input(4, {
        name: "Input4Decoded",
        outputLabels: ["0", "1", "2", "3"],
        gridSize: [2, 7]
      })), getGateType(OutputVariable(2, 'X'))],
      gates: [{
        x: 0,
        y: 2,
        type: "Input4Decoded",
        id: 0
      } as SerializableGate, {
        x: 18,
        y: 4,
        type: "OutputVariableX2",
        id: 1
      } as SerializableGate],
      size: [20, 11]
    } as GridSource,
    completeCondition: DecoderLevelSignal.flipInputsOutputs() as ConnectionValueSignalSet,
    completeRewards: [getGateType(Encoder4t2).name, DecoderLevel.params?.name || "?"]
  },
  x: 14,
  y: 0,
  desiredId: 1000,
  type: Encoder4t2,
  playCondition: [true, true]
};
const Or3LevelInputs = [new Signal<ConnectionValue>([{
  frame: 0,
  value: false
}, {
  frame: 3,
  value: true
}, {
  frame: 3,
  value: false
}, {
  frame: 15,
  value: true
}, {
  frame: 3,
  value: false
}, {
  frame: 9,
  value: true
}, {
  frame: 3,
  value: false
}]).push(oscillator(3, 3)), new Signal<ConnectionValue>([{
  frame: 0,
  value: false
}, {
  frame: 9,
  value: true
}, {
  frame: 3,
  value: false
}, {
  frame: 9,
  value: true
}, {
  frame: 3,
  value: false
}, {
  frame: 3,
  value: true
}, {
  frame: 3,
  value: false
}, {
  frame: 6,
  value: false
}]).push(oscillator(3, 3)), new Signal<ConnectionValue>([{
  frame: 0,
  value: false
}, {
  frame: 15,
  value: true
}, {
  frame: 3,
  value: false
}, {
  frame: 9,
  value: true
}, {
  frame: 3,
  value: false
}, {
  frame: 3,
  value: true
}, {
  frame: 3,
  value: false
}]).push(oscillator(3, 3))];
export const XorLevel:LevelParameters = {
  params: {
    name: "Exclusion",
    directions: `
        <p>Beating this level requires constructing a "Xor" gate, which is like an Or gate but more... exclusive.</p>
        <p>The Xor gate should output <span style="color:var(--connection-color-on);">high</span> when only one of its inputs are <span style="color:var(--connection-color-on);">high</span>.</p>
        `,
    grid: {
      gateTypes: [getGateType(InputLabelledPrebaked[2]), getGateType(OutputLabelledPrebaked[1]), getGateType(Or)],
      gates: [{
        x: 0,
        y: 3,
        type: "Input2Labelled",
        id: 0
      } as SerializableGate, {
        x: 14,
        y: 3,
        type: "Output1Labelled",
        id: 1
      } as SerializableGate, {
        x: 6,
        y: 4,
        type: "Or",
        id: 2
      } as SerializableGate],
      connections: [new Connection(0, 0, 2, 0), new Connection(0, 1, 2, 1), new Connection(2, 0, 1, 0)],
      size: [16, 8]
    } as GridSource,
    completeCondition: new ConnectionValueSignalSet([new Signal<ConnectionValue>([{
      frame: 0,
      value: false
    }]).push(oscillator(10, 10)), new Signal<ConnectionValue>([{
      frame: 5,
      value: false
    }]).push(oscillator(10, 9))], 200, getGateType(Xor)),
    completeRewards: [getGateType(Xor).name, AdderLevel.params?.name || "?"]
  },
  x: 11,
  y: 2,
  desiredId: 7,
  type: Xor
};
export const And3Level:LevelParameters = {
  params: {
    name: "Bigger Combo",
    directions: `
        <p>This level requires a 3-Input And gate, which outputs <span style="color:var(--connection-color-on);">high</span>
        only when all of its inputs are <span style="color:var(--connection-color-on);">high</span>.</p>
        <p>However, you might not have this exact gate already. If not, you'll have to connect multiple gates together to win.</p>
        `,
    grid: In3Out1,
    completeCondition: new ConnectionValueSignalSet(Or3LevelInputs.map(s => inverter(s)), 60, getGateType(And3)),
    completeRewards: [getGateType(And3).name, getGateType(And4).name, StickersTool.name]
  },
  x: 8,
  y: 2,
  desiredId: 5,
  type: And3
};
export const Or3Level:LevelParameters = {
  params: {
    name: "Joinyer",
    directions: `
        <p>This level requires a 3-Input Or gate, which outputs <span style="color:var(--connection-color-on);">high</span>
        only when any of its inputs are <span style="color:var(--connection-color-on);">high</span>.</p>
        <p>However, you might not have this exact gate already. If not, you'll have to connect multiple gates together to win.</p>
        `,
    grid: In3Out1,
    completeCondition: new ConnectionValueSignalSet(Or3LevelInputs, 60, getGateType(Or3)),
    completeRewards: [getGateType(Or3).name, getGateType(Or4).name, XorLevel.params?.name || "?"]
  },
  x: 4,
  y: 5,
  desiredId: 6,
  type: Or3
};
export const NorLevel:LevelParameters = {
  params: {
    name: "No Join",
    directions: `
        <p>This level requires making a "Nor" gate to win.</p>
        <p>Nor stands for "Not Or" and will always output the opposite of an Or gate with the same inputs.</p>
        `,
    grid: {
      gateTypes: [getGateType(InputLabelledPrebaked[2]), getGateType(OutputLabelledPrebaked[1]), getGateType(Or)],
      gates: [{
        x: 0,
        y: 3,
        type: "Input2Labelled",
        id: 0
      } as SerializableGate, {
        x: 14,
        y: 4,
        type: "Output1Labelled",
        id: 1
      } as SerializableGate, {
        x: 6,
        y: 3,
        type: "Or",
        id: 2
      } as SerializableGate],
      connections: [new Connection(0, 0, 2, 0), new Connection(0, 1, 2, 1), new Connection(2, 0, 1, 0)],
      size: [16, 8]
    } as GridSource,
    completeCondition: new ConnectionValueSignalSet([new Signal<ConnectionValue>([{
      frame: 0,
      value: false
    }]).push(oscillator(10, 5)), new Signal<ConnectionValue>([{
      frame: 0,
      value: false
    }, {
      frame: 50,
      value: true
    }])], 100, getGateType(Nor)),
    completeRewards: [getGateType(Nor).name, Or3Level.params?.name || "?"]
  },
  x: 0,
  y: 2,
  desiredId: 4,
  type: Nor,
  playCondition:[false]
};
export const NandLevel:LevelParameters = {
  params: {
    name: "No Combo",
    directions: `
        <p>This level requires making a "Nand" gate to win.</p>
        <p>Nand stands for "Not And" and will always output the opposite of an And gate with the same inputs.</p>
        `,
    grid: {
      gateTypes: [getGateType(InputLabelledPrebaked[2]), getGateType(OutputLabelledPrebaked[1]), getGateType(And)],
      gates: [{
        x: 0,
        y: 3,
        type: "Input2Labelled",
        id: 0
      } as SerializableGate, {
        x: 14,
        y: 4,
        type: "Output1Labelled",
        id: 1
      } as SerializableGate, {
        x: 6,
        y: 3,
        type: "And",
        id: 2
      } as SerializableGate],
      connections: [new Connection(0, 0, 2, 0), new Connection(0, 1, 2, 1), new Connection(2, 0, 1, 0)],
      size: [16, 8]
    } as GridSource,
    completeCondition: new ConnectionValueSignalSet([new Signal<ConnectionValue>([{
      frame: 0,
      value: false
    }]).push(oscillator(10, 5)), new Signal<ConnectionValue>([{
      frame: 0,
      value: false
    }, {
      frame: 50,
      value: true
    }])], 100, getGateType(Nand)),
    completeRewards: [getGateType(Nand).name, And3Level.params?.name || "?"]
  },
  x: 9,
  y: 0,
  desiredId: 3,
  type: Nand
};

export const OrLevel:LevelParameters = {
  params: {
    name: "Join",
    directions: `
        <p>This level requires an "Or" Gate.</p>
        <p>An Or Gate outputs <span style="color:var(--connection-color-on);">high</span> only
        when either of it's inputs are <span style="color:var(--connection-color-on);">high</span>.</p>
        `,
    grid: In2Out1,
    completeCondition: new ConnectionValueSignalSet([new Signal<ConnectionValue>([{
      frame: 0,
      value: true
    }]).push(repeater(new Signal<ConnectionValue>([{
      frame: 3,
      value: false
    }, {
      frame: 9,
      value: true
    }]), 3)).push(new Signal<ConnectionValue>([{
      frame: 3,
      value: false
    }, {
      frame: 6,
      value: false
    }])).push(oscillator(3, 4)), new Signal<ConnectionValue>([{
      frame: 0,
      value: false
    }, {
      frame: 6,
      value: true
    }]).push(repeater(new Signal<ConnectionValue>([{
      frame: 3,
      value: false
    }, {
      frame: 9,
      value: true
    }]), 3)).push(new Signal<ConnectionValue>([{
      frame: 3,
      value: false
    }])).push(oscillator(3, 4))], 70, getGateType(Or)),
    completeRewards: [NorLevel.params?.name || "?"]
  },
  x: 4,
  y: 3,
  desiredId: 2,
  type: Or
};
export const AndLevel:LevelParameters = {
  params: {
    name: "Some Kind of Combo",
    directions: `
        <p>This level requires an "And" Gate.</p>
        <p>An And Gate outputs <span style="color:var(--connection-color-on);">high</span> only
        when both of it's inputs are <span style="color:var(--connection-color-on);">high</span>.</p>
        `,
    grid: In2Out1,
    completeCondition: new ConnectionValueSignalSet([new Signal<ConnectionValue>([{
      frame: 0,
      value: false
    }]).push(oscillator(10, 5)), new Signal<ConnectionValue>([{
      frame: 0,
      value: false
    }, {
      frame: 50,
      value: true
    }])], 100, getGateType(And)),
    completeRewards: [NandLevel.params?.name || "?"]
  },
  x: 6,
  y: 1,
  desiredId: 1,
  type: And
};
export const BufLevel:LevelParameters = {
  params: {
    name: "A Simple Start",
    directions: `
        <p>A regular level has inputs and outputs on a grid.</p>
        <p>Click and drag between the input and output on the grid to draw a wire, then press the play button below to send a signal through the input.</p>
        <p>The signal has input channels on top and output channels below.</p>
        <p>When you press play, the input channels will be sent to the input, and the outputs will be measured into the output channels.</p>
        <p>If the measured output matches the expected output, you win!</p>
        `,
    grid: MinCircuit,
    completeCondition: new ConnectionValueSignalSet([new Signal<ConnectionValue>([{
      frame: 0,
      value: false
    }]).push(oscillator(20, 2))], 80, getGateType(Buf)),
    completeRewards: []
  },
  x: 4,
  y: 1,
  type: Buf
};
export const Freeplay:LevelParameters = {
  params: {
    name: "Freeplay",
    directions: "Have Fun!",
    grid: {
      gateTypes: [getGateType(Input(10)), getGateType(Output(10))],
      gates: [{
        x: 0,
        y: 0,
        id: 0,
        type: "Input10"
      } as SerializableGate, {
        x: 13,
        y: 0,
        id: 1,
        type: "Output10"
      } as SerializableGate],
      size: [15, 10]
    } as GridSource,
    completeCondition: undefined,
    completeRewards: []
  },
  x: 18,
  y: 0
};
export const Tutorial:LevelParameters= {
  params: {
    name: "Tutorial",
    directions: "",
    grid: {
      gateTypes: [getGateType(InputLabelledPrebaked[1])],
      gates: [{
        x: 0,
        y: 3,
        id: 0,
        type: "Input1Labelled"
      } as SerializableGate],
      size: [16, 8]
    } as GridSource,
    completeCondition: new ConnectionValueSignalSet([new Signal<ConnectionValue>([{
      frame: 0,
      value: false
    }]).push(oscillator(10, 7))], 141, getGateType(Not)),
    completeRewards: [getGateType(Not).name, getGateType(Or).name, getGateType(And).name, getGateType(Buf).name, AndLevel.params?.name || "?", OrLevel.params?.name || "?"]
  },
  x: 6,
  y: 1,
  type: Not
};
const all_params = new Map<string, LevelParameters>([
  [Freeplay.params?.name || "?", Freeplay],
  [BufLevel.params?.name || "?", BufLevel],
  [AndLevel.params?.name || "?", AndLevel],
  [OrLevel.params?.name || "?", OrLevel],
  [Or3Level.params?.name || "?", Or3Level],
  [And3Level.params?.name || "?", And3Level],
  [NandLevel.params?.name || "?", NandLevel],
  [NorLevel.params?.name || "?", NorLevel],
  [XorLevel.params?.name || "?", XorLevel],
  [XandLevel.params?.name || "?", XandLevel],
  [DecoderLevel.params?.name || "?", DecoderLevel],
  [EncoderLevel.params?.name || "?", EncoderLevel],
  [AdderLevel.params?.name || "?", AdderLevel],
  [CarryLevel.params?.name || "?", CarryLevel],
  [FullAdderLevel.params?.name || "?", FullAdderLevel],
  [RandomLevel1.params?.name || "?", RandomLevel1],
  [FourBitAdder.params?.name || "?", FourBitAdder],
  [FourBitDecoder.params?.name || "?", FourBitDecoder],
  [SevenSegmentLevel.params?.name || "?", SevenSegmentLevel]]);

export function getLevel(name: string) {
  const params = getLevelParams(name);
  if (params) return new Level(params);
}
export function getLevelParams(name:string) {
  return all_params.get(name);
}
