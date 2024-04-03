import type { Connection } from "./GateGraph";
import { GateType, type ConnectionValue, GateTypeController } from "./GateType";

/**
 * The actual Gate object, takes a readonly reference to a GateType.
 * the coordinates and id used to be optional, so a Gate could exist outside of a GateGrid,
 * however, this is no longer the case, and the result is manny leftover ```gate.id || 0``` statements and similar
 */
export class Gate {
    readonly type:GateType
    state:GateState = {override:[]}

    constructor(type:GateType) {
        this.type = type
        this.state = {override:new Array<ConnectionValue>(type.sizeIn).fill(undefined)}
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

    execute(s?:GateState) {
        if (s) this.state = s
        const result = this.type.f(this.state)
        return result
    }

    reset() {
        this.state.override = new Array<ConnectionValue>(
            this.type.sizeIn
        ).fill(undefined)
    }

    getInput(index:number) {
        if (this.state.override !== undefined) {
            return this.state.override[index] || false
        }
        return false
    }

    getOutput(index:number) {
        return this.execute(undefined).override[index] || false
    }

    getInputs() {
        return this.state.override || new Array<boolean>(
            this.type.sizeIn
        ).fill(false)
    }

    getOutputs() {
        return this.execute(undefined).override
    }
}

export type GateState = {
    override:Array<ConnectionValue>;
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

    override execute(_s:GateState) {
        return this.state
    }

    override reset() {
        this.state.override = new Array<ConnectionValue>(
            this.type.sizeOut
        ).fill(false)
    }
}

export function createGate(cType: GateTypeController) {
    const gType = cType.model
    let g;
    switch (gType.variant) {
        case "Flow":
            g = new Flow(gType);
            break;
        default:
            g = new Gate(gType);
            break;
    }

    g.reset();
    return g;
}
