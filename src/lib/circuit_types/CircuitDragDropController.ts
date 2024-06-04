
import { type CircuitController } from "./CircuitController";
import { CircuitControllerQueryResult } from "./CircuitControllerQueryResult";
import type { ConnectionType } from "./GateGraph";
import { GateType, GateTypeController } from "./GateType";

export class CircuitDragDropController {

    circuitController:CircuitController

    constructor(
        circuitController:CircuitController
    ) {
        this.circuitController = circuitController
    }

    sourceElement : HTMLElement | null = null

    private contents:CircuitControllerQueryResult = new CircuitControllerQueryResult()

    dragStartGateType(
        type:GateTypeController,
        e:MouseEvent,
        element: HTMLElement | null = null
    ) {
        this.contents = new CircuitControllerQueryResult(
            undefined,"Gate",undefined,type
        )
        this.sourceElement = element
    }

    dragStart(
        from:CircuitControllerQueryResult,
        element: HTMLElement | null = null
    ) {
        this.contents = from
        this.sourceElement = element
    }

    private canDrop = false
    private lastDragEvent:MouseEvent | null = null

    dragEnd(q:CircuitControllerQueryResult) {
        if (this.canDrop) {
            const result = this.contents

            this.contents = new CircuitControllerQueryResult()
            this.sourceElement = null

            this.lastDragEvent = null
            this.canDrop = false

            return result
        }
        

        return new CircuitControllerQueryResult()
    }

    private mouseEventDistance(a:CircuitControllerQueryResult, b:CircuitControllerQueryResult) {
        const pA = a.getPageOffset()
        const pB = b.getPageOffset()
        if (!pA || !pB) return Infinity
        return Math.pow(Math.pow(pA[0] - pB[0], 2) + Math.pow(pA[0] - pB[0], 2), 0.5)
    }

    dragCircuit(q:CircuitControllerQueryResult) {
        if (this.lastDragEvent === null || this.mouseEventDistance(this.contents, q) > 3) {
            this.canDrop = true
            this.lastDragEvent = null
        }
    }

    getGateType() {
        if (this.contents.type == "Gate") {
            return this.contents.gateTypeController
        }
        return undefined
    }

    hasGate() {
        return this.contents.gate !== undefined
    }

    hasContents() {
        return this.contents.type !== ""
    }

    getId() {
        return this.contents.getId()
    }

    getContentType() {
        return this.contents.type
    }

    getContents() {
        return this.contents
    }

}

export type CircuitDragDropItem = GateType | [number, number]
