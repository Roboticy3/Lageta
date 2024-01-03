
//every type of gate
export let all_gates:Map<String, GateType> = new Map()

export class GateType {
    name:string;

    sizeIn:number
    sizeOut:number
    //the positions of the inputs normalized about a grid cell
    inputOffsets:Array<[number, number]>
    outputOffsets:Array<[number, number]>

    gridHeight:number;
    gridWidth:number;

    moveable:boolean;

    private f:(x:boolean[]) => boolean[]

    constructor(
        name:string = "Buf",
        inputs:number | Array<[number, number]> = 1,
        outputs:number | Array<[number, number]> = 1,
        gridSize:[number, number] = [2, 2],
        moveable=true,
        f=(x:boolean[])=>{return x},
        register=true
    )
    {
        this.gridWidth = gridSize[0]
        this.gridHeight = gridSize[1]

        this.name = name
        if (typeof inputs === "number") {
            this.sizeIn = inputs
            this.inputOffsets = this.spreadVerticalConnections(0.25, inputs)
        }
        else {
            this.sizeIn = inputs.length
            this.inputOffsets = inputs
        }

        if (typeof outputs === "number") {
            this.sizeOut = outputs
            this.outputOffsets = this.spreadVerticalConnections(this.gridWidth - 0.25, outputs)
        }
        else {
            this.sizeOut = outputs.length
            this.outputOffsets = outputs
        }

        if (register) {
            registerGateType(this)
        }

        this.moveable = moveable

        this.f = f

    }   

    private spreadVerticalConnections(gridX:number, size:number) {
        const step = this.gridHeight / (size + 1)
        let result = new Array<[number, number]>(size)

        for (let i = 0; i < size; i++) {
            result[i] = [gridX, step * (i + 1)]
        }

        return result
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
export class Gate {
    type:GateType

    constructor(type:GateType) {
        this.type = type
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

    override:boolean[] | undefined

    execute(x:boolean[] | undefined) {
        return this.type.execute(this.override || x)
    } 

    reset() {
        this.override = undefined
    }

    set(x:boolean[]) {
        if (x.length === this.type.sizeIn) {
            console.log("cannot set ", x, "\nthe input size is ", this.type.sizeIn, " but the given length is ", x.length)
        }
        this.override = x
    }
}


export const registerGateType = (gateType:GateType) => {
    if (!all_gates.has(gateType.name)) {
        all_gates.set(gateType.name, gateType)
    }
    all_gates = all_gates
}

export const registerGateTypeJson = (gateType:string) => {
    const gType = JSON.parse(gateType) as GateType
    registerGateType(gType)
}

export const copyGate = (type:GateType) => {
    return new Gate(
        type
    )
}

export const Buf = new GateType (
    "Buf",
    1,
    1
)

export const Not = new GateType (
    "Not",
    1,
    1
)

export const And = new GateType (
    "And",
    2,
    1
)

export const Or = new GateType (
    "Or",
    2,
    1
)

export const Input = new GateType (
    "Input",
    0,
    1,
    [1,1],
    false
)

export const Output = new GateType (
    "Output",
    1,
    0,
    [1,1],
    false
)