
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

    dragStartHandler=(e:MouseEvent, q:CircuitControllerQueryResult) => {}
    dragEndHandler=(e:MouseEvent, q:CircuitControllerQueryResult) => {}
    dragCircuitHandler=(e:MouseEvent, q:CircuitControllerQueryResult) => {}

    dragStartGateType(
        type:GateTypeController,
        e:MouseEvent,
        element: HTMLElement | null = null
    ) {
        this.contents = new CircuitControllerQueryResult(
            undefined,"Gate",undefined,type
        )
        this.sourceElement = element

        this.lastDragEvent = e

        this.dragStartHandler(e, this.contents)
    }

    dragStart(
        from:CircuitControllerQueryResult,
        e:MouseEvent,
        element: HTMLElement | null = null
    ) {
        this.contents = from
        this.sourceElement = element

        this.lastDragEvent = e

        this.dragStartHandler(e, from)
    }

    private canDrop = false
    private lastDragEvent:MouseEvent | null = null

    dragEnd(e:MouseEvent, q:CircuitControllerQueryResult) {
        if (this.canDrop) {
            const result = this.contents

            this.contents = new CircuitControllerQueryResult()
            this.sourceElement = null

            this.lastDragEvent = null
            this.canDrop = false

            this.dragEndHandler(e, q)

            return result
        }
        

        return new CircuitControllerQueryResult()
    }

    private mouseEventDistance(a:MouseEvent, b:MouseEvent) {
        return Math.pow(Math.pow(a.pageX - b.pageX, 2) + Math.pow(a.pageY - b.pageY, 2), 0.5)
    }

    dragCircuit(e:MouseEvent, q:CircuitControllerQueryResult) {
        if (this.lastDragEvent === null || this.mouseEventDistance(this.lastDragEvent, e) > 3) {
            this.canDrop = true
            this.lastDragEvent = null
        }
        this.dragCircuitHandler(e, q)
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
