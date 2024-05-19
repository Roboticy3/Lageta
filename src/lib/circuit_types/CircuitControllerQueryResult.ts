import { Gate } from "./Gate";
import { GateTypeController } from "./GateType";

//
/**
 * return type of CircuitController.query()
 * @member gate readonly reference to a gate. This exposes the model class Gate to the view, but does not allow modification.
 * @member type result can refer to either a Gate, Connection (Input or Output), or nothing, if the query didn't hit anything on it's grid.
 * @member connectionIndex if type is Input or Output, connectionIndex will store a number telling where to find or put a connection later.
 */

export class CircuitControllerQueryResult {
    readonly gate: Gate | undefined;

    readonly gateTypeController: GateTypeController | undefined;

    readonly type: CircuitControllerQueryResultContentType;
    readonly connectionIndex: number | undefined;

    constructor(
        gate: Gate | undefined = undefined,
        type: CircuitControllerQueryResultContentType = "",
        connectionIndex: number | undefined = undefined,
        gateTypeController: GateTypeController | undefined = undefined
    ) {
        this.gate = gate;
        this.gateTypeController = gateTypeController;
        this.type = type;
        if ((type === "Input" || type === "Output") &&
            gate !== undefined && connectionIndex !== undefined) {
            this.connectionIndex = connectionIndex;
        }

    }

    getId() { return this.gate?.id; }

    getPos() { return this.gate ? [this.gate.x, this.gate.y] : undefined; }

    contentEquals(other:CircuitControllerQueryResult ) {
        return (
            other.type === this.type &&
            other.connectionIndex === this.connectionIndex &&
            other.gate === this.gate
        )
    }
}

export type CircuitControllerQueryResultContentType = "Gate" | "Input" | "Output" | ""
