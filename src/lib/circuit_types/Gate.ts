import { TruthTable } from "./TruthTable";

//every type of gate
export let all_gates:Map<String, GateType> = new Map()

/**
 * A set of data used both by Gates and view.
 * Every GateType created will be placed in all_gates with its name as the key, 
 * only one of each unique GateType should exist at any given time, the only reason the class is exported is so other scripts can typescheck for it
 */
export class GateType {
    name:string = "Buf"
    sizeIn:number = 1
    sizeOut:number = 1
    inputOffsets:Array<[number, number]> = [[0.25, 1]]
    outputOffsets:Array<[number, number]> = [[1.75, 1]]
    gridWidth:number = 2
    gridHeight:number = 2
    moveable:boolean = true
    private f:(x:boolean[]) => boolean[] = (x:boolean[])=>{return x}
    private register:boolean = true
    
    constructor(
        params:GateTypeParameters
    )
    {
        if (params.gridSize) {
            this.gridWidth = params.gridSize[0]
            this.gridHeight = params.gridSize[1]
        }

        if (params.name) {
            this.name = params.name
        }

        if (typeof params.inputs === "number") {
            this.sizeIn = params.inputs
            this.inputOffsets = this.spreadVerticalConnections(0.25, params.inputs)
        }
        else if (params.inputs instanceof Array) {
            this.sizeIn = params.inputs.length
            this.inputOffsets = params.inputs
        }

        if (typeof params.outputs === "number") {
            this.sizeOut = params.outputs
            this.outputOffsets = this.spreadVerticalConnections(this.gridWidth - 0.25, params.outputs)
        }
        else if (params.outputs instanceof Array) {
            this.sizeOut = params.outputs.length
            this.outputOffsets = params.outputs
        }

        if (params.register || true) {
            registerGateType(this)
        }

        this.moveable = params.moveable || true

        this.f = params.f || this.f

    }   

    private spreadVerticalConnections(gridX:number, size:number) {
        return spreadVerticalConnections(gridX, this.gridHeight, size)
    }

    execute(x:boolean[] | undefined) {
        if (x === undefined) {
            return new Array<boolean>(this.sizeOut)
        }
        if (x.length === this.sizeIn) {
            const y = this.f(x)
            if (y.length === this.sizeOut) {
                return y
            }
            return new Array<boolean>(this.sizeOut)
        }
        return new Array<boolean>(this.sizeOut)
    }
}

function spreadVerticalConnections(gridX:number, gridHeight:number, size:number) {
    const step = gridHeight / (size + 1)
    let result = new Array<[number, number]>(size)

    for (let i = 0; i < size; i++) {
        result[i] = [gridX, step * (i + 1)]
    }

    return result
}

function spreadHorizontalConnections(gridY:number, gridWidth:number, size:number) {
    const step = gridWidth / (size + 1)
    let result = new Array<[number, number]>(size)

    for (let i = 0; i < size; i++) {
        result[i] = [step * (i + 1), gridY]
    }

    return result
}

/**
 * Set of optional arguments for constructing a GateType
 */
type GateTypeParameters = {
    name?:string,
    inputs?:number | Array<[number, number]>,
    outputs?:number | Array<[number, number]>,
    gridSize?:[number, number],
    moveable?:boolean,
    f?:(x:boolean[]) => boolean[],
    register?:boolean
}

/**
 * Get an existing GateType from the given parameters, or create a new one if necessary
 * @param params 
 * @returns 
 */
function getGateType(params:GateTypeParameters) {
    if (params.name) {
        const result = all_gates.get(params.name)
        if (result) {
            return result
        }
    }
    return new GateType(params)
}

/**
 * The actual Gate object, takes a readonly reference to a GateType.
 * the coordinates and id used to be optional, so a Gate could exist outside of a GateGrid,
 * however, this is no longer the case, and the result is manny leftover ```gate.id || 0``` statements and similar
 */
export class Gate {
    readonly type:GateType
    //override the input array
    override:Array<boolean | undefined> = []

    constructor(type:GateType) {
        this.type = type
        this.reset()
    }

    x:number = 0;
    y:number = 0;
    givePos(x:number, y:number) {

        this.x = x
        this.y = y
    }
    id:number = 0
    giveId(id:number) {
        this.id = id
    }

    execute(x:boolean[] = []) {
        const result = this.type.execute(
            this.override.map(
                (v, i) => {
                    return v || x.at(i) || false
                }
            )
        )
        return result
    }
    
    //pass x as a function to avoid doing work if override is filled
    executeLazy(x:() => boolean[], set=false) {
        let xResult:Array<boolean> = []
        const result = this.type.execute(
            this.override.map(
                (v, i) => {
                    if (v === undefined && xResult.length === 0) {
                        xResult = x()
                    }
                    return v || xResult.at(i) || false
                }
            )
        )
        if (set) {
            this.override = result
        }
        return result
    }

    reset() {
        this.override = new Array<boolean | undefined>(
            this.type.sizeIn
        ).fill(undefined)
    }

    getInput(index:number) {
        if (this.override !== undefined) {
            return this.override[index] || false
        }
        return false
    }

    getOutput(index:number) {
        return this.execute(undefined)[index] || false
    }

    getInputs() {
        return this.override || new Array<boolean>(
            this.type.sizeIn
        ).fill(false)
    }

    getOutputs() {
        return this.execute(undefined)
    }
}


const registerGateType = (gateType:GateType) => {
    if (!all_gates.has(gateType.name)) {
        all_gates.set(gateType.name, gateType)
    }
    all_gates = all_gates
}

const registerGateTypeJson = (gateType:string) => {
    const gType = JSON.parse(gateType) as GateType
    registerGateType(gType)
}

export const Buf = getGateType (
    {name:"Buf", inputs:1, outputs:1}
)

export const Not = getGateType (
    {name:"Not", inputs:1, outputs:1, f:(x:boolean[]) => {return  x.map((v) => {return !v})}}
)

export const And = getGateType (
    {name:"And", inputs:2, outputs:1, f:(x:boolean[]) => {return [x[0] && x[1]]}}
)

export const Or = getGateType (
    {name:"Or", inputs:2, outputs:1, f:(x:boolean[]) => {return [x[0] || x[1]]}}
)

export function Mux(selectionSize:number) {
    const size = Math.pow(2, selectionSize)
    const inputOffsets = spreadVerticalConnections(0.25, size, size)
    inputOffsets.push(...spreadHorizontalConnections(size - 0.25, selectionSize, selectionSize))
    return getGateType (
        {
            name:"Mux" + String(size), 
            inputs:inputOffsets, outputs:1, 
            gridSize:[selectionSize, size], 
            f:(x:boolean[]) => {
                let sum = 0
                let pow = 0
                for (let i = inputOffsets.length - selectionSize; i < inputOffsets.length; i++) {
                    
                    if (x[i]) sum += Math.pow(2, pow)

                    pow++
                }

                return [x[sum]]
            }
        }
    )
}

export function Input(size:number) {
    return getGateType (
        {
            name:"Input" + String(size), 
            inputs:0, outputs:size, 
            gridSize:[2, size], 
            moveable:false,
            f:(x) => {return x}
        }
    )
}

export function Output(size:number) {
    return getGateType (
        {
            name:"Output" + String(size), 
            inputs:size, outputs:0, 
            gridSize:[2, size], 
            moveable:false}
    )
}