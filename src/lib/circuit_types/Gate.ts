
//every type of gate
export let all_gates:Map<String, GateType> = new Map()

export class GateType {
    name:string;

    sizeIn:number
    sizeOut:number
    //the positions of the inputs normalized about a grid cell
    inputOffsets:Array<[number, number]>
    outputOffsets:Array<[number, number]>

    constructor(
        name:string = "Buf",
        inputs:number | Array<[number, number]> = 1,
        outputs:number | Array<[number, number]> = 1,
    )
    {
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

    }   

    gridHeight:number = 2;
    gridWidth:number = 2;

    private spreadVerticalConnections(gridX:number, size:number) {
        const step = this.gridHeight / (size + 1)
        let result = new Array<[number, number]>(size)

        for (let i = 0; i < size; i++) {
            result[i] = [gridX, step * (i + 1)]
        }

        return result
    }
}
export class Gate {
    type:GateType

    constructor(type:GateType) {
        this.type = type
    }

    x?:number = undefined;
    y?:number = undefined;
    givePos(x:number, y:number) {

        this.x = x
        this.y = y
    }
    clearPos() {
        this.x = undefined
        this.y = undefined
    }
    id?:number = undefined
    giveId(id:number) {
        this.id = id
    }
    clearId() {
        this.id = undefined
    }

    
}


export const registerGateType = (gateType:GateType) => {
    if (!all_gates.has(gateType.name)) {
        all_gates.set(gateType.name, gateType)
    }
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