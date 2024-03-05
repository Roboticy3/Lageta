import type { Connection } from "./GateGraph";
import { GateType, type ConnectionValue } from "./GateType";

/**
 * The actual Gate object, takes a readonly reference to a GateType.
 * the coordinates and id used to be optional, so a Gate could exist outside of a GateGrid,
 * however, this is no longer the case, and the result is manny leftover ```gate.id || 0``` statements and similar
 */
export class Gate {
    readonly type:GateType
    //override the input array
    override:Array<ConnectionValue> = []

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

    execute(x:(ConnectionValue)[] = []) {
        const result = this.type.execute(this.override, x)
        return result
    }

    reset() {
        this.override = new Array<ConnectionValue>(
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

/**
 * A special type of Gate with zero inputs, that treats it's override as it's output values
 */
export class Flow extends Gate {
    constructor(type:GateType) {
        super(type)
        if (type.sizeIn !== 0) {
            throw RangeError("Flow must have zero inputs!")
        }
    }

    override execute(_x:ConnectionValue[] = []) {
        return this.override
    }

    override reset() {
        this.override = new Array<ConnectionValue>(
            this.type.sizeOut
        ).fill(false)
    }
}

export function createGate(type: GateType) {
    let g;
    switch (type.variant) {
        case "Flow":
            g = new Flow(type);
            break;
        default:
            g = new Gate(type);
            break;
    }

    g.reset();
    return g;
}
