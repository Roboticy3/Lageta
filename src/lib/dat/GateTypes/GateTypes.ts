import { Flow, Gate, type GateState } from "$lib/circuit_types/Gate";
import { GateType, type GateTypeVariant, type ConnectionValue, GateTypeController } from "$lib/circuit_types/GateType";

export const Buf:GateTypeParameters = { 
    name: "Buf", inputs: 1, outputs: 1, 
    draw: (s) => {return `<path d="M 2 2 L 18 10 L 2 18 Z" style="pointer-events:none;" />\n`}
}

export const Not:GateTypeParameters = { 
    name: "Not", inputs: 1, outputs: 1, 
    f: (s:GateState) => { return {override:[!(s.override[0])]}; },
    draw: (s) => {return `<path d="M 1 3 L 15 10 L 1 17 Z" style="pointer-events:none;" /><circle cx="17" cy="10" r="2"  style="pointer-events:none;" />\n`}
};

export const And:GateTypeParameters = { 
    name: "And", inputs: 2, outputs: 1, 
    f: (s:GateState) => { return {override:[s.override[0] && s.override[1]]}; },
    draw: (s) => {return `<path d="M 2 2 L 10 2 C 20 2 20 18 10 18 L 2 18 Z" style="pointer-events:none;" />\n`}
};

export const Or:GateTypeParameters = { 
    name: "Or", inputs: 2, outputs: 1, 
    f: (s:GateState) => { return {override:[s.override[0] || s.override[1]]}; },
    draw: (s) => {return `<path d="M 2 2 C 22 4 22 16 2 18 C 5 18 5 2 2 2 Z" style="pointer-events:none;" />\n`}
};

export const Nand:GateTypeParameters = { 
    name: "Nand", inputs: 2, outputs: 1, 
    f: (s:GateState) => { return {override:[!(s.override[0] && s.override[1])]}; },
    draw: (s) => {return `<path d="M 2 2 L 10 2 C 20 2 20 18 10 18 L 2 18 Z" style="pointer-events:none;" />\n<circle cx=18 cy=10 r="2" style="pointer-events:none;" />\n`}
};

export const Nor:GateTypeParameters = {
    name: "Nor", inputs: 2, outputs: 1, 
    f: (s:GateState) => { return {override:[!(s.override[0] || s.override[1])]}; },
    draw: (s) => {return `<path d="M 10 2 C 20 2 20 18 10 18 L 2 18 C 5 18 5 2 2 2 Z" style="pointer-events:none;" />\n<circle cx=18 cy=10 r="2" style="pointer-events:none;" />\n`}
}

export const Xor:GateTypeParameters = { 
    name: "Xor", inputs: 2, outputs: 1, 
    f: (s:GateState) => { return {override:[(s.override[0] || false) !== (s.override[1] || false)]}; },
    draw: (s) => {return `<path d="M 4 2 C 22 4 22 16 4 18 C 7 18 7 2 4 2 Z" style="pointer-events:none;" />\n<path d="M 2 18 C 5 18 5 2 2 2" style="pointer-events:none;" />\n`}
}

export const Xand:GateTypeParameters = {
    name: "Xand", inputs: 2, outputs: 1,
    f: (s:GateState) => { return {override:[(s.override[0] || false) === (s.override[1] || false)]}},
    draw: (s) => {return `<path d="M 4 2 C 22 4 22 16 4 18 C 7 18 7 2 4 2 Z" style="pointer-events:none;" />\n<path d="M 2 18 C 5 18 5 2 2 2" style="pointer-events:none;" />\n<circle cx=18 cy=10 r="2" style="pointer-events:none;" />\n`}
}

export const RandomGate1:GateTypeParameters = {
    name: "Random Gate 1", inputs: 2, outputs: 2,
    f: (s:GateState) => {
        return {override:[
            !(s.override[1]),
            !(s.override[0] && s.override[1])
        ]}
    }
}

export const AdderNoCarry1:GateTypeParameters = {
    name: "AdderNoCarry1", inputs: 2, outputs:1,
    f: (s:GateState) => { return {override:[(s.override[0] || false) !== (s.override[1] || false)]}; },
}

export const HalfAdder:GateTypeParameters = {
    name: "HalfAdder", inputs: [[2, 5.5], [2, 14.5]], outputs:[[18, 10], [10, 18]], outputLabels:["S", "C"],
    f: (s:GateState) => { return {override:[(s.override[0] || false) !== (s.override[1] || false), s.override[0] && s.override[1]]}},
    draw: (s) => {return `<path d="M 10 16 L 10 18"/>\n<path d="M 2 2 L 16 6 L 16 14 L 2 18 L 2 11 L 8 10 L 2 9 Z"/>`}
}

export const FullAdder:GateTypeParameters ={
    name: "FullAdder", inputs: [[10, 2], [2, 5.5], [2, 14.5]], outputs:[[18, 10], [10, 18]], outputLabels:["S", "C out"], inputLabels:["C in", "", ""],
    f: (s:GateState) => { return {
        override:[((s.override[1] || false) !== (s.override[2] || false)) !== (s.override[0] || false), (s.override[1] && s.override[2]) || ((s.override[0] || false) && (s.override[1] || s.override[2]))]
    }},
    draw: (s) => {return `<path d="M 10 4 L 10 2"/>\n<path d="M 10 16 L 10 18"/>\n<path d="M 2 2 L 16 6 L 16 14 L 2 18 L 2 11 L 8 10 L 2 9 Z"/>`}
}

const LEDSegmentPath = `M 0.5 2.5 L 2.5 0.5 L 17.5 0.5 L 19.5 2.5 L 17.5 4.5 L 2.5 4.5 Z"`
const SevenSegmentTransforms = [
    `translate(10 7.5)`,
    `translate(32.5 10) rotate(90)`,
    `translate(32.5 30) rotate(90)`,
    `translate(10 47.5)`,
    `translate(12.5 30) rotate(90)`,
    `translate(12.5 10) rotate(90)`,
    `translate(10 27.5)`
]
const SevenSegmentNames = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g'
]
export const SevenSegmentOutput:GateTypeParameters = {
    name: "7-Segment Display", inputs:7, outputs:0, gridSize:[5, 6], 
    inputLabels: ['Segment A', 'Segment B', 'Segment C', 'Segment D', 'Segment E', 'Segment F', 'Segment G'],
    draw: (s) => {
        let result = ''
        for (let i = 0; i < 7; i++) {
            const value = s.override[i]
            const color = connectionValueToColor(value)
            const fill = value ? `fill="${color}" fill-opacity="0.8"` : ''
            const stroke = `stroke="${color}"`
            const transform = SevenSegmentTransforms[i]
            result += `
                <g transform="${transform}">
                    <path d="${LEDSegmentPath}" ${stroke} ${fill} />
                    <text fill="black" stroke="none" y="3.5" x="8.5" style="pointer-events:none; font-size:4px;" >${SevenSegmentNames[i]}</text>
                </g>\n`
        }
        return result
    }

}

export const SevenSegmentDecoder:GateTypeParameters = {
    name: "Binary Coded Decimal to 7-Segment Decoder", inputs:4, outputs:7, gridSize:[3, 6],
    inputLabels:['1', '2', '4', '8'], outputLabels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    f: (s) => {
        const v = decodeInternal(s, 4)
        switch (v) {
            case 0: return {override:[true, true, true, true, true, true, false]}
            case 1: return {override:[false, true, true, false, false, false, false]}
            case 2: return {override:[true, true, false, false, true, false, true]}
            case 3: return {override:[true, true, true, true, false, false, true]}
            case 4: return {override:[false, true, true, false, false, true, true]}
            case 5: return {override:[true, false, true, true, false, true, true]}
            case 6: return {override:[true, false, true, true, true, true, true]}
            case 7: return {override:[true, true, true, false, false, false, false]}
            case 8: return {override:[true, true, true, true, true, true, true]}
            case 9: return {override:[true, true, true, false, false, true, true]}
            default: return {override:new Array(7).fill(undefined)}
        }
    }
}

export const LevelGateType:GateTypeParameters = { name: "LevelGateType", gridSize: [2, 2], moveable: false };

export let all_gates: Map<string, GateTypeController> = new Map();

/**
 * Get an existing GateType from the given parameters, or create a new one if necessary
 * @param params 
 * @returns 
 */
export function getGateType(params:GateTypeParameters) {
    const result = all_gates.get(params.name)
    if (result) {
        return result
    }

    const c = new GateTypeController(params)
    registerGateType(c)

    console.log("registered ", JSON.stringify(params))
    console.log("registered type", c, " registered list:",Array.from(all_gates.keys()))

    return c
}

export function getGateTypeNoRegister(params:GateTypeParameters) {
    const result = all_gates.get(params.name)
    if (result) {
        return result
    }
}

export const registerGateType = (gateType: GateTypeController) => {
    console.log("registering ", gateType)
    all_gates.set(gateType.name, gateType);
};

/**
 * Set of optional arguments for constructing a GateType
 */
export type GateTypeParameters = {
    name:string, //name of the type
    gridSize?:[number, number], //the size of the gate in the grid
    inputs?:number | Array<[number, number]>, //the number of inputs, or a list of input offsets. a number of inputs will be automatically spaced out on the left depending on gridSize
    outputs?:number | Array<[number, number]>, //the number of outputs, or a list of output offsets. a number of outputs will be automatically spaced out like inputs but on the right
    buttonOffset?:[number, number], //if the gate has interactive elements, apply this offset to them in the view (such as InputCheckBox)
    inputLabels?:string[], //the labels of each input point
    outputLabels?:string[], //the labels of each output point
    moveable?:boolean, //whether the gate can be moved by the user or not, true if not given
    variant?:GateTypeVariant, //variants allow support for extending gates to other types, like designating inputs as "Flows" when they have 0 inputs and their state is used as their outputs rather than inputs
    f?:(s:GateState) => GateState, //the computation this gate performs on its inputs
    draw?:(s:GateState) => string, //the svg appearance of this gate in the grid
    register?:boolean, //whether this gate should be registered to all_gates on creation or not, true if not given
}

/**
 * Return a combination of two GateTypeParameters objects
 * @param a The first set of params
 * @param b The second set of params, overrides values of the first if there are overlaps
 * @returns 
 */
export function combineGateTypeParameters(a:GateTypeParameters, b:GateTypeParameters) {
    console.log("combining params: ", a, b)

    let result = {
        name:b.name,
        inputs:b.inputs || a.inputs,
        outputs:b.outputs || a.outputs,
        gridSize:b.gridSize || a.gridSize,
        inputLabels:b.inputLabels || a.inputLabels,
        outputLabels:b.outputLabels || a.outputLabels,
        buttonOffset:b.buttonOffset || a.buttonOffset,
        moveable:b.moveable !== undefined ? b.moveable : a.moveable,
        variant:b.variant || a.variant,
        f:b.f || a.f,
        draw:b.draw || a.draw,
        register:b.register !== undefined ? b.register : a.register,
    } as GateTypeParameters

    console.log("combined parameters:", result)
    return result
}

export function spreadVerticalConnections(gridX: number, gridHeight: number, numPoints: number) {
    const step = 10 * gridHeight / (numPoints + 1);
    let result = new Array<[number, number]>(numPoints);

    for (let i = 0; i < numPoints; i++) {
        result[i] = [gridX, step * (i + 1)];
    }

    console.log("spread points", result)

    return result;
}
export function spreadHorizontalConnections(gridY: number, gridWidth: number, numPoints: number) {
    const step = gridWidth / (numPoints + 1);
    let result = new Array<[number, number]>(numPoints);

    for (let i = 0; i < numPoints; i++) {
        result[i] = [step * (i + 1), gridY];
    }

    return result;
}


export const drawGateTypeEllipse = (gridWidth:number, gridHeight:number) => {
    const w = 10 * (gridWidth / 2)
    const h = 10 * (gridHeight / 2)
    return `<ellipse rx="${w - 2}" ry="${h - 2}" cx="${w}" cy="${h}"  style="pointer-events:none;" />\n`;
}

export const drawGateTypeRect = (gridWidth:number, gridHeight:number) => {
    const w = 10 * (gridWidth)
    const h = 10 * (gridHeight)
    return `<rect width="${w - 4}" height="${h - 4}" x="${2}" y="${2}"  style="pointer-events:none;" />\n`;
}

export const drawGateTypeEncode = (s:GateState, gridWidth:number, gridHeight:number) => {
    const result = [drawGateTypeRect(gridWidth, gridHeight)]
    const v = s.override.indexOf(true)
    result.push(
`<text 
    x="${gridWidth * 10 / 2 - 5}" 
    y="${gridHeight * 10 / 2 + 5}" 
    fill="black" stroke="none"
    style="pointer-events:none;"
    >
    ${v === -1 ? "":v}
</text>`
    )
    return result.join()
}

export const drawGateTypeDecode = (s:GateState, gridWidth:number, gridHeight:number, 
    extraParams:string=`fill="black" stroke="none" style="pointer-events:none;" text-anchor="middle"`, 
    offset:[number, number] = [0, 5]
) => {
    const result = [drawGateTypeRect(gridWidth, gridHeight)]
    let pow = 1
    let sum = 0
    for (let i = 0; i < s.override.length; i++) {
        if (s.override[i]) sum += pow
        pow *= 2
    }
    result.push(
`<text 
    x="${gridWidth * 10 / 2 + offset[0]}" 
    y="${gridHeight * 10 / 2 + offset[1]}" 
    ${extraParams}
    >
    ${sum}
</text>`
    )
    return result.join()
}

export const wrapGateTypeViewInSvgHeader = (gridWidth:number, gridHeight:number, svg:string, extraParams?:string) => {
    return `
<svg 
    viewBox="0 0 ${10 * gridWidth} ${10 * gridHeight}" 
    stroke="var(--gate-color)" 
    stroke-width="0.5px"
    ${extraParams ? extraParams:""}
    fill="none">\n
    ${svg}
</svg>`
}

export function Input(size: number, otherParams?: GateTypeParameters ) {
    const otherSize = otherParams?.gridSize || [undefined, undefined]
    const gridWidth = otherSize[0] || 2
    const gridHeight = otherSize[1] || size
    let params: GateTypeParameters = {
        name: "Input" + String(size),
        inputs: 0, outputs: size,
        gridSize: [gridWidth, gridHeight],
        variant: "Flow",
        moveable: false,
        draw: (s) => {return drawGateTypeRect(gridWidth, gridHeight)}
    };
    if (otherParams) params = combineGateTypeParameters(params, otherParams)
    return params;
}

export function Output(size: number, otherParams?: GateTypeParameters) {
    const otherSize = otherParams?.gridSize || [undefined, undefined]
    const gridWidth = otherSize[0] || 2
    const gridHeight = otherSize[1] || size
    let params: GateTypeParameters = {
        name: "Output" + String(size),
        inputs: size, outputs: 0,
        gridSize: [gridWidth, gridHeight],
        moveable: false,
        draw: (s) => {return drawGateTypeRect(gridWidth, gridHeight)}
    };
    if (otherParams) params = combineGateTypeParameters(params, otherParams)
    return params;
}

export const InputLabelledPrebaked = [
    Buf,
    Input(1,{ name:"Input1Labelled", outputLabels: ["Input"], gridSize: [2, 1] }),
    Input(2,{ name:"Input2Labelled", outputLabels: ["Input 1", "Input 2"], gridSize: [2, 2] }),
    Input(3,{ name:"Input3Labelled", outputLabels: ["Input 1", "Input 2", "Input 3"], gridSize: [2, 3] }),
    Input(4,{ name:"Input4Labelled", outputLabels: ["Input 1", "Input 2", "Input 3", "Input 4"], gridSize: [2, 4] })
]

export const InputDecodePrebaked = [
    Buf,
    Input(1,{ name:"Input1Decode", outputLabels: ["Input"], gridSize: [2, 2], draw:(s) => drawGateTypeDecode(s, 2, 1)}),
    Input(2,{ name:"Input2Decode", outputLabels: ["Input 0", "Input 1"], gridSize: [2, 2], draw:(s) => drawGateTypeDecode(s, 2, 2)}),
    Input(3,{ name:"Input3Decode", outputLabels: ["Input 0", "Input 1", "Input 2"], gridSize: [2, 3], draw:(s) => drawGateTypeDecode(s, 2, 3)}),
    Input(4,{ name:"Input4Decode", outputLabels: ["Input 0", "Input 1", "Input 2", "Input 3"], gridSize: [2, 4], draw:(s) => drawGateTypeDecode(s, 2, 4)}),
]

export const OutputLabelledPrebaked = [
    Buf,
    Output(1,{ name:"Output1Labelled", inputLabels: ["Output"], gridSize: [2, 1] }),
    Output(2,{ name:"Output2Labelled", inputLabels: ["Output 1", "Output 2"], gridSize: [2, 2] }),
    Output(3,{ name:"Output3Labelled", inputLabels: ["Output 1", "Output 2", "Output 3"], gridSize: [2, 3] }),
    Output(4,{ name:"Output4Labelled", inputLabels: ["Output 1", "Output 2", "Output 3", "Output 4"], gridSize: [2, 4] })
]

export const OutputDecodePrebaked = [
    Buf,
    Output(1,{ name:"Output1Decode", inputLabels: ["Output"], gridSize: [2, 2], draw:(s) => drawGateTypeDecode(s, 2, 1)}),
    Output(2,{ name:"Output2Decode", inputLabels: ["Output 0", "Output 1"], gridSize: [2, 2], draw:(s) => drawGateTypeDecode(s, 2, 2)}),
    Output(3,{ name:"Output3Decode", inputLabels: ["Output 0", "Output 1", "Output 2"], gridSize: [2, 3], draw:(s) => drawGateTypeDecode(s, 2, 3)}),
    Output(4,{ name:"Output4Decode", inputLabels: ["Output 0", "Output 1", "Output 2", "Output 3"], gridSize: [2, 4], draw:(s) => drawGateTypeDecode(s, 2, 4)}),
]

export function InputVariable(bits:number, variableName:string) {
    const gridSize:[number, number]= [Math.floor(Math.log2(bits)) + 1,bits]
    return Input(bits, 
        {
            name:`InputVariable${variableName}${bits}`, 
            outputLabels: (new Array(bits).fill("").map((_v, i) => `${variableName}${i}`)),
            gridSize:gridSize, 
            draw:(s) => drawGateTypeDecode(s, gridSize[0], gridSize[1])
        }
    )
}

export function OutputVariable(bits:number, variableName:string) {
    const gridSize:[number, number]= [Math.floor(Math.log2(bits)) + 1,bits]
    return Output(bits, 
        {
            name:`OutputVariable${variableName}${bits}`, 
            inputLabels: (new Array(bits).fill("").map((_v, i) => `${variableName}${i}`)),
            gridSize:gridSize, 
            draw:(s) => drawGateTypeDecode(s, gridSize[0], gridSize[1])
        }
    )
}

function connectionValueToColor(v:ConnectionValue) {
    switch (v) {
        case true: return `var(--connection-color-on)`
        case false: return `var(--connection-color-off)`
        default: return ``
    }
}

export function exampleInputVariable(variableName:string) {
    return Input(1, 
        {
            name:`InputVariable${variableName}1`, 
            outputLabels: (new Array(1).fill("").map((_v, i) => `${variableName}`)),
            gridSize:[2,2], 
            buttonOffset:[-1.25,-0.75],
            draw:(s) => drawGateTypeDecode(s, 2, 2, 
                `stroke="none" 
                fill="${connectionValueToColor(s.override[0])}" 
                style="pointer-events:none; font-size:10px;"
                text-anchor="middle"
                `
            )
        }
    )
}

export function exampleOutputVariable(variableName:string) {
    return Output(1, 
        {
            name:`OutputVariable${variableName}1`, 
            inputLabels: (new Array(1).fill("").map((_v, i) => `${variableName}`)),
            gridSize:[2,2], 
            draw:(s) => s.override[0] === undefined ? drawGateTypeRect(2, 2):drawGateTypeDecode(s, 2, 2, 
                `stroke="none" 
                fill="${s.override[0] ? 'var(--connection-color-on)':'var(--connection-color-off)'}" 
                style="pointer-events:none;"
                text-anchor="middle"`
            )
        }
    )
}

function decodeInternal(s:GateState, bits:number) {
    let idx = 0
    let pow = 1
    for (let i = 0; i < bits; i++) {
        if (s.override[i] === true) idx += pow
        pow *= 2
    }
    return idx
}

export function Decoder(bits:number, otherParams?: GateTypeParameters) {
    const outSize = Math.pow(2, bits)
    const otherSize = otherParams?.gridSize || [undefined, undefined]
    const gridWidth = otherSize[0] || 3
    const gridHeight = otherSize[1] || outSize
    let params: GateTypeParameters = {
        name: `${bits}-${outSize} Decoder`,
        inputs: bits, outputs: outSize,
        outputLabels: (new Array(outSize)).fill(undefined).map((_v, i) => `${i}`),
        gridSize: [gridWidth, gridHeight],
        f: (s) => {
            const idx = decodeInternal(s, bits)
            let result = new Array(outSize).fill(false)
            result[idx] = true
            return {override:result}
        },
        draw: (s) => {
            return drawGateTypeDecode(s, gridWidth, gridHeight)
        }
    }
    if (otherParams) params = combineGateTypeParameters(params, otherParams)
    return params;
}

export const Decoder2t4 = Decoder(2)
export const BCDDecoder = Decoder(4, 
    {name:"BCD Decoder", 
        gridSize:[3, 8], 
        outputs: 10, 
        outputLabels:(new Array(10).fill('').map((_v, i) => `${i}`)),
        f: (s) => {
            const idx = decodeInternal(s, 4)
            if (idx > 9) return {override:new Array(10).fill(undefined)}
            let result = new Array(10).fill(false)
            result[idx] = true
            return {override:result}
        },
    }
)

function encodeInternal(v:number, bits:number) {
    let result = new Array(bits).fill(false)
    for (let i = 0; i < bits; i++) {
        const r = v % 2
        result[i] = r === 1
        v = Math.floor(v / 2)
    }
    return {override:result}
}

export function Encoder(bits:number, otherParams?: GateTypeParameters) {
    const inSize = Math.pow(2, bits)
    const otherSize = otherParams?.gridSize || [undefined, undefined]
    const gridWidth = otherSize[0] || 3
    const gridHeight = otherSize[1] || inSize
    let params: GateTypeParameters = {
        name: `${inSize}-${bits} Encoder`,
        inputs: inSize, outputs: bits,
        inputLabels: (new Array(inSize)).fill(undefined).map((_v, i) => `${i}`),
        gridSize: [gridWidth, gridHeight],
        f: (s) => {
            return encodeInternal(s.override.lastIndexOf(true), bits)
        },
        draw: (s) => {
            return drawGateTypeEncode(s, gridWidth, gridHeight)
        }
    }
    if (otherParams) params = combineGateTypeParameters(params, otherParams)
    return params;
}

export const Encoder4t2 = Encoder(2)

export function NInputAnd(bits:number, otherParams?:GateTypeParameters) {
    const [gridWidth, gridHeight] = otherParams?.gridSize || [2, Math.ceil(Math.log2(bits)) + 1]
    let params: GateTypeParameters = {
        name: `${bits}-Input And`,
        inputs: bits, outputs: 1,
        gridSize: [gridWidth, gridHeight],
        f: (s) => {
            const o = s.override
            let result:ConnectionValue = true
            //break on false, but continue on undefined to avoid "ordered" behavior where earlier undefined values with negate false values
            for (let i of o) {
                if (i === undefined)
                    result = undefined
                else if (i === false) {
                    result = false
                    break
                }
            }
            
            return {override:[result]}
        },
        draw: (s) => {
            return `<g transform="scale(1, ${gridHeight / 2})"><path d="M 2 2 L 10 2 C 20 2 20 18 10 18 L 2 18 Z" style="pointer-events:none;" /></g>`
        }
    }
    if (otherParams) params = combineGateTypeParameters(params, otherParams)
    return params;
}

export function NInputOr(bits:number, otherParams?:GateTypeParameters) {
    const [gridWidth, gridHeight] = otherParams?.gridSize || [2, Math.ceil(Math.log2(bits)) + 1]
    let params: GateTypeParameters = {
        name: `${bits}-Input Or`,
        inputs: bits, outputs: 1,
        gridSize: [gridWidth, gridHeight],
        f: (s) => {
            const o = s.override
            let result:ConnectionValue = undefined
            //reverse of NInputAnd's function
            for (let i of o) {
                if (i === false)
                    result = false
                else if (i === true) {
                    result = true
                    break
                }
            }
            
            return {override:[result]}
        },
        draw: (s) => {
            return `<g transform="scale(1, ${gridHeight / 2})"><path d="M 10 2 C 20 2 20 18 10 18 L 2 18 C 5 18 5 2 2 2 Z" style="pointer-events:none;" /></g>`
        }
    }
    if (otherParams) params = combineGateTypeParameters(params, otherParams)
    return params;
}

export const And3 = NInputAnd(3)
export const And4 = NInputAnd(4)
export const Or3 = NInputOr(3)
export const Or4 = NInputOr(4)

export function NBitAdder(bits:number, otherParams?:GateTypeParameters) {
    let params: GateTypeParameters = {
        name: `${bits}-Bit Adder`,
        inputs: 2 * bits, outputs: bits + 1,
        inputLabels:(
            new Array(bits)
                .fill("")
                .map((v, i) => `X${i}`)
                .concat(new Array(bits)
                    .fill("")
                    .map((v, i) => `Y${i}`)
                )
        ),
        outputLabels:(
            new Array(bits)
                .fill("")
                .map((v, i) => `S${i}`)
                .concat(["Carry"])
        ),
        gridSize: [2, 2 * bits],
        f: (s) => {
            const x = decodeInternal(s, bits)
            const s2 = {override:s.override.slice(bits)}
            const y = decodeInternal(s2, bits)
            const sum = x + y
            return encodeInternal(sum, bits + 1)
        }
    }
    if (otherParams) params = combineGateTypeParameters(params, otherParams)
    return params;
}

export const Add2 = NBitAdder(2)
export const Add4 = NBitAdder(4)

const all_params = new Map([
    [Buf.name, Buf],
    [Not.name, Not],
    [And.name, And],
    [Or.name, Or],
    [And3.name, And3],
    [Or3.name, Or3],
    [And4.name, And4],
    [Or4.name, Or4],
    [Nand.name, Nand],
    [Nor.name, Nor],
    [Xor.name, Xor],
    [Xand.name, Xand],
    [Decoder2t4.name, Decoder2t4],
    [BCDDecoder.name, BCDDecoder],
    [Encoder4t2.name, Encoder4t2],
    [HalfAdder.name, HalfAdder],
    [FullAdder.name, FullAdder],
    [SevenSegmentOutput.name, SevenSegmentOutput],
    [SevenSegmentDecoder.name, SevenSegmentDecoder]
])

export function getGateTypeParams(name:string) {
    return all_params.get(name)
}