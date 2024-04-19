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
    if (params.name) {
        const result = all_gates.get(params.name)
        if (result) {
            return result
        }
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
    name?:string,
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
    let result = Object.create(a)
    for (let e in Object.entries(b)) {
        result[e[0]] = e[1]
    }
    console.log(result)
    return result as GateTypeParameters
}

export function spreadVerticalConnections(gridX: number, gridHeight: number, size: number) {
    const step = 10 * gridHeight / (size + 1);
    let result = new Array<[number, number]>(size);

    for (let i = 0; i < size; i++) {
        result[i] = [gridX, step * (i + 1)];
    }

    return result;
}
export function spreadHorizontalConnections(gridY: number, gridWidth: number, size: number) {
    const step = gridWidth / (size + 1);
    let result = new Array<[number, number]>(size);

    for (let i = 0; i < size; i++) {
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

export function Input(size: number, otherParams: GateTypeParameters = {}) {
    let params: GateTypeParameters = {
        name: "Input" + String(size),
        inputs: 0, outputs: size,
        gridSize: [2, size],
        variant: "Flow",
        moveable: false,
        draw: (s) => {return drawGateTypeRect(2, size)}
    };
    if (otherParams) {
        params = combineGateTypeParameters(params, otherParams);
    }
    return params;
}

export function Output(size: number, otherParams: GateTypeParameters = {}) {
    let params: GateTypeParameters = {
        name: "Output" + String(size),
        inputs: size, outputs: 0,
        gridSize: [2, size],
        moveable: false,
        draw: (s) => {return drawGateTypeRect(2, size)}
    };
    if (otherParams) {
        params = combineGateTypeParameters(params, otherParams);
    }
    return params;
}

export function Decoder(bits:number, otherParams: GateTypeParameters = {}) {
    const outSize = Math.pow(2, bits)
    const gridWidth = 3
    const gridHeight = outSize
    let params: GateTypeParameters = {
        name: `${bits}-${outSize} Decoder`,
        inputs: bits, outputs: outSize,
        gridSize: [gridWidth, gridHeight],
        f: (s) => {
            let result = Array(outSize).fill(false)
            let idx = 0
            let pow = 1
            for (let i = 0; i < bits; i++) {
                if (s.override[i] === true) idx += pow
                pow *= 2
            }
            result[idx] = true
            return {override:result}
        },
        draw: (s) => {
            return drawGateTypeDecode(s, gridWidth, gridHeight)
        }
    }
    if (otherParams) {
        params = combineGateTypeParameters(params, otherParams);
    }
    return params;
}

export const Decoder2t4 = Decoder(2)

export function Encoder(bits:number, otherParams: GateTypeParameters = {}) {
    const inSize = Math.pow(2, bits)
    const gridWidth = 3
    const gridHeight = inSize
    let params: GateTypeParameters = {
        name: `${inSize}-${bits} Encoder`,
        inputs: inSize, outputs: bits,
        gridSize: [gridWidth, gridHeight],
        f: (s) => {
            let idx = s.override.lastIndexOf(true)
            let result = new Array(bits).fill(false)
            for (let i = 0; i < bits; i++) {
                const r = idx % 2
                result[i] = r === 1
                idx = Math.floor(idx / 2)
            }
            return {override:result}
        },
        draw: (s) => {
            return drawGateTypeEncode(s, gridWidth, gridHeight)
        }
    }
    if (otherParams) {
        params = combineGateTypeParameters(params, otherParams);
    }
    return params;
}

export const Encoder4t2 = Encoder(2)