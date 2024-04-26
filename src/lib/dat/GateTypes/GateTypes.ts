import { Flow, Gate, type GateState } from "$lib/circuit_types/Gate";
import { GateType, type GateTypeVariant, type ConnectionValue, GateTypeController } from "$lib/circuit_types/GateType";

export let all_gates: Map<string, GateTypeController> = new Map();

export const Buf:GateTypeParameters = { 
    name: "Buf", inputs: 1, outputs: 1, 
    draw: (s) => {return `<path d="M 2 2 L 18 10 L 2 18 Z"/>\n`}
}

export const Not:GateTypeParameters = { 
    name: "Not", inputs: 1, outputs: 1, 
    f: (s:GateState) => { return {override:[!(s.override[0])]}; },
    draw: (s) => {return `<path d="M 1 3 L 15 10 L 1 17 Z"/><circle cx="17" cy="10" r="2" />\n`}
};

export const And:GateTypeParameters = { 
    name: "And", inputs: 2, outputs: 1, 
    f: (s:GateState) => { return {override:[s.override[0] && s.override[1]]}; },
    draw: (s) => {return `<path d="M 2 2 L 10 2 C 20 2 20 18 10 18 L 2 18 Z"/>\n`}
};

export const Or:GateTypeParameters = { 
    name: "Or", inputs: 2, outputs: 1, 
    f: (s:GateState) => { return {override:[s.override[0] || s.override[1]]}; },
    draw: (s) => {return `<path d="M 10 2 C 20 2 20 18 10 18 L 2 18 C 5 18 5 2 2 2 Z"/>\n`}
};

export const Nand:GateTypeParameters = { 
    name: "Nand", inputs: 2, outputs: 1, 
    f: (s:GateState) => { return {override:[!(s.override[0] && s.override[1])]}; },
    draw: (s) => {return `<path d="M 2 2 L 10 2 C 20 2 20 18 10 18 L 2 18 Z"/>\n<circle cx=18 cy=10 r="2"/>\n`}
};

export const Xor:GateTypeParameters = { 
    name: "Xor", inputs: 2, outputs: 1, 
    f: (s:GateState) => { return {override:[(s.override[0] || false) !== (s.override[1] || false)]}; },
    draw: (s) => {return `<path d="M 10 2 C 20 2 20 18 10 18 L 5 18 C 8 18 8 2 5 2 Z"/>\n<path d="M 2 18 C 5 18 5 2 2 2"/>\n`}
}

export const LevelGateType:GateTypeParameters = { name: "LevelGateType", gridSize: [2, 2], moveable: false };

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

export const registerGateType = (gateType: GateTypeController) => {
    console.log("registering ", gateType)
    all_gates.set(gateType.name, gateType);
};

/**
 * Set of optional arguments for constructing a GateType
 */
export type GateTypeParameters = {
    name:string,
    inputs?:number | Array<[number, number]>,
    outputs?:number | Array<[number, number]>,
    gridSize?:[number, number],
    inputLabels?:string[],
    outputLabels?:string[],
    moveable?:boolean,
    variant?:GateTypeVariant,
    f?:(s:GateState) => GateState,
    draw?:(s:GateState) => string
    register?:boolean
}

/**
 * Return a combination of two GateTypeParameters objects
 * @param a The first set of params
 * @param b The second set of params, overrides values of the first if there are overlaps
 * @returns 
 */
export function combineGateTypeParameters(a:GateTypeParameters, b:GateTypeParameters) {
    console.log("combining params: ", a, b)

    let result = a as Object
    type GateTypeParametersKeys = keyof typeof result
    const entries = Object.entries(b as Object)
    for (let i = 0; i < entries.length; i++) {
        const [k,v] = entries[i]
        const entry = k as GateTypeParametersKeys
        result[entry] = v
    }

    console.log("combined parameters:", result)
    return result as GateTypeParameters
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
    return `<ellipse rx="${w - 2}" ry="${h - 2}" cx="${w}" cy="${h}" />\n`;
}

export const drawGateTypeRect = (gridWidth:number, gridHeight:number) => {
    const w = 10 * (gridWidth)
    const h = 10 * (gridHeight)
    return `<rect width="${w - 4}" height="${h - 4}" x="${2}" y="${2}" />\n`;
}

export const drawGateTypeEncode = (s:GateState, gridWidth:number, gridHeight:number) => {
    const result = [drawGateTypeRect(gridWidth, gridHeight)]
    const v = s.override.indexOf(true)
    result.push(
`<text 
    x="${gridWidth * 10 / 2 - 5}" 
    y="${gridHeight * 10 / 2 + 5}" 
    fill="black" stroke="none"
    >
    ${v === -1 ? "":v}
</text>`
    )
    return result.join()
}

export const drawGateTypeDecode = (s:GateState, gridWidth:number, gridHeight:number) => {
    const result = [drawGateTypeRect(gridWidth, gridHeight)]
    let pow = 1
    let sum = 0
    for (let i = 0; i < s.override.length; i++) {
        if (s.override[i]) sum += pow
        pow *= 2
    }
    result.push(
`<text 
    x="${gridWidth * 10 / 2 - 5}" 
    y="${gridHeight * 10 / 2 + 5}" 
    fill="black" stroke="none"
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
    Output(4,{ name:"Output4Decode", inputLabels: ["Output 0", "Output 1", "Output 2", "Output 3"], gridSize: [2, 4], draw:(s) => drawGateTypeDecode(s, 2, 4)}),
]

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

export function Adder(bits:number, carry:boolean, otherParams?:GateTypeParameters) {
    const otherSize = otherParams?.gridSize || [undefined, undefined]
    const gridWidth = otherSize[0] || 4
    const gridHeight = otherSize[1] || (bits + 1)
    let params: GateTypeParameters = {
        name: `Adder${bits}${carry ? "c":"nc"}`,
        inputs: bits * 2, outputs: bits + (carry ? 1:0),
        gridSize: [gridWidth, gridHeight],
        f: carry ? (s) => {
            const v1 = decodeInternal(s, bits)
            const v2 = decodeInternal({override:s.override.slice(bits)},bits)
            const sum = v1 + v2
            const result = encodeInternal(sum, bits)
            result.override.push((sum) >= Math.pow(2, bits))
            console.log("added!", v1, v2, "=>", result)
            return result
        } : (s) => {
            const v1 = decodeInternal(s, bits)
            const v2 = decodeInternal({override:s.override.slice(bits)},bits)
            return encodeInternal(v1 + v2, bits)
        }
    }
    if (otherParams) params = combineGateTypeParameters(params, otherParams)
    return params;
}

export const Adder2c = Adder(2, true)