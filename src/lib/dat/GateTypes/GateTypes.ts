import { Flow, Gate } from "$lib/circuit_types/Gate";
import { GateType, type GateTypeVariant, type ConnectionValue } from "$lib/circuit_types/GateType";

export let all_gates: Map<String, GateType> = new Map();

export const registerGateType = (gateType: GateType) => {
    if (!all_gates.has(gateType.name)) {
        all_gates.set(gateType.name, gateType);
    }
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
    f?:(x:(ConnectionValue)[]) => (ConnectionValue)[],
    register?:boolean
}

/**
 * Return a combination of two GateTypeParameters objects
 * @param a The first set of params
 * @param b The second set of params, overrides values of the first if there are overlaps
 * @returns 
 */
export function combineGateTypeParameters(a:GateTypeParameters, b:GateTypeParameters) {
    const result = {...b, ...a} //blasphemy, sodomy, and possibly embezzlement were involved in the development of TypeScript
    return result as GateTypeParameters
}

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
    return new GateType(params)
}

export function spreadVerticalConnections(gridX: number, gridHeight: number, size: number) {
    const step = gridHeight / (size + 1);
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

export const Buf = getGateType(
    { name: "Buf", inputs: 1, outputs: 1 }
);

export const Not = getGateType(
    { name: "Not", inputs: 1, outputs: 1, f: (x) => { return [!(x[0])]; } }
);

export const And = getGateType(
    { name: "And", inputs: 2, outputs: 1, f: (x) => { return [x[0] && x[1]]; } }
);

export const Or = getGateType(
    { name: "Or", inputs: 2, outputs: 1, f: (x) => { return [x[0] || x[1]]; } }
);

export const Nand = getGateType(
    { name: "Nand", inputs: 2, outputs: 1, f: (x) => { return [!(x[0] && x[1])]; } }
);

export const Xor = getGateType(
    { name: "Xor", inputs: 2, outputs: 1, f: (x) => { return [x[0] !== x[1]]}}
)

export const LevelGateType = getGateType({ name: "LevelGateType", gridSize: [2, 2], moveable: false });

export function Input(size: number, otherParams: GateTypeParameters | undefined = undefined) {
    let params: GateTypeParameters = {
        name: "Input" + String(size),
        inputs: 0, outputs: size,
        gridSize: [2, size],
        variant: "Flow",
        moveable: false,
        f: (x) => { return x; }
    };
    if (otherParams) {
        console.log(params, otherParams);
        params = combineGateTypeParameters(otherParams, params);
    }
    return getGateType(params);
}

export function Output(size: number, otherParams: GateTypeParameters | undefined = undefined) {
    let params: GateTypeParameters = {
        name: "Output" + String(size),
        inputs: size, outputs: 0,
        gridSize: [2, size],
        moveable: false
    };
    if (otherParams) {
        params = combineGateTypeParameters(params, otherParams);
    }
    return getGateType(params);
}

export function Decoder(bits:number, otherParams: GateTypeParameters | undefined = undefined) {
    const outSize = Math.pow(2, bits)
    let params: GateTypeParameters = {
        name: `${bits}-${outSize} Decoder`,
        inputs: bits, outputs: outSize,
        gridSize: [3, outSize],
        f: (x) => {
            let result = Array(outSize).fill(false)
            let idx = 0
            let pow = 1
            for (let i = 0; i < bits; i++) {
                if (x[i] === true) idx += pow
                pow *= 2
            }
            result[idx] = true
            return result
        }
    }
    if (otherParams) {
        params = combineGateTypeParameters(params, otherParams);
    }
    return getGateType(params);
}

export const Decoder2t4 = Decoder(2)

export function Encoder(bits:number, otherParams: GateTypeParameters | undefined = undefined) {
    const inSize = Math.pow(2, bits)
    let params: GateTypeParameters = {
        name: `${inSize}-${bits} Encoder`,
        inputs: inSize, outputs: bits,
        gridSize: [3, inSize],
        f: (x) => {
            let idx = x.indexOf(true)
            let result = new Array(bits).fill(false)
            for (let i = 0; i < bits; i++) {
                const r = idx % 2
                result[i] = r === 1
                idx = Math.floor(idx / 2)
            }
            return result
        }
    }
    if (otherParams) {
        params = combineGateTypeParameters(params, otherParams);
    }
    return getGateType(params);
}

export const Encoder4t2 = Encoder(2)