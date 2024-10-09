import { Sticker, StickerType } from "$lib/circuit_types/sticker/Sticker";
import type { ConnectionIndex } from "./CircuitController";
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

    readonly sticker: Sticker | undefined;

    readonly stickerType: StickerType | undefined;

    readonly type: CircuitControllerQueryResultContentType;
    readonly connectionIndex: number | undefined;

    readonly localOffset: [number, number] | undefined

    readonly pageOffset: [number, number] | undefined

    readonly timeStamp: number | undefined

    constructor(
        params:{
            gate?: Gate,
            type?: CircuitControllerQueryResultContentType,
            connectionIndex?: number,
            gateTypeController?: GateTypeController,
            sticker?: Sticker,
            stickerType?: StickerType,
            localOffset?: [number, number],
            pageOffset?: [number, number],
            timeStamp?: number
        } = {}
    ) {

        this.gate = params.gate;
        this.gateTypeController = params.gateTypeController;
        this.type = params.type === undefined ? "":params.type;
        if ((params.type === "Input" || params.type === "Output") &&
            params.gate !== undefined && params.connectionIndex !== undefined) {
            this.connectionIndex = params.connectionIndex;
        }

        this.sticker = params.sticker
        this.stickerType = params.stickerType

        this.localOffset = params.localOffset
        this.pageOffset = params.pageOffset

        this.timeStamp = params.timeStamp
    }

    getId() { return this.gate?.id; }

    getPos() { return this.gate ? [this.gate.x, this.gate.y] : undefined; }

    getGateType() { return this.gateTypeController }

    getLocalOffset() { return this.localOffset}

    getPageOffset() { return this.pageOffset }

    contentEquals(other:CircuitControllerQueryResult | ConnectionIndex, includeOffset?:boolean) {
        if (other instanceof CircuitControllerQueryResult)
            return (
                other.type === this.type &&
                other.connectionIndex === this.connectionIndex &&
                other.gate === this.gate &&
                other.sticker === this.sticker &&
                (includeOffset !== true || ( 
                    other.localOffset?.at(0) === this.localOffset?.at(0) &&
                    other.localOffset?.at(1) === this.localOffset?.at(1)
                ))
            )
        else
            return (
                other.type === this.type &&
                other.index === this.connectionIndex &&
                other.id === this.gate?.id
            )
    }
}

export type CircuitControllerQueryResultContentType = "Gate" | "Input" | "Output" | "Sticker" | ""
