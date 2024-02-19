
import { CircuitControllerQueryResult, type CircuitController } from "./CircuitController";
import { all_gates, Gate, type GateType } from "./Gate";
import type { ConnectionType } from "./GateGraph";

export class CircuitDragDropController {

    circuitController:CircuitController

    constructor(
        circuitController:CircuitController
    ) {
        this.circuitController = circuitController
    }

    sourceElement : HTMLElement | null = null

    private contents:CircuitControllerQueryResult = new CircuitControllerQueryResult()

    dragStartHandler=(e:MouseEvent) => {}
    dragEndHandler=(e:MouseEvent) => {}
    dragCircuitHandler=(e:MouseEvent) => {}

    private lastDragEvent:MouseEvent | null = null

    dragStartGateType(
        type:GateType,
        e:MouseEvent,
        element: HTMLElement | null = null
    ) {
        this.contents = new CircuitControllerQueryResult(
            undefined,"Gate",undefined,type
        )
        this.sourceElement = element

        this.lastDragEvent = e

        this.dragStartHandler(e)
    }

    dragStart(
        from:CircuitControllerQueryResult,
        e:MouseEvent,
        element: HTMLElement | null = null
    ) {
        this.contents = from
        this.sourceElement = element

        this.lastDragEvent = e

        this.dragStartHandler(e)
    }

    private mouseEventDistance(a:MouseEvent, b:MouseEvent) {
        return Math.pow(Math.pow(a.pageX - b.pageX, 2) + Math.pow(a.pageY - b.pageY, 2), 0.5)
    }

    dragEnd(e:MouseEvent) {
        
        let d = Infinity
        if (this.lastDragEvent !== null) {
            d = this.mouseEventDistance(this.lastDragEvent, e)
        }
        if (d > 3) {
            const result = this.contents

            this.contents = new CircuitControllerQueryResult()
            this.sourceElement = null

            this.lastDragEvent = null

            this.dragEndHandler(e)

            return result
        }
        
        return new CircuitControllerQueryResult()
    }

    dragCircuit(e:MouseEvent) {
        this.dragCircuitHandler(e)
    }

    getGateType() {
        if (this.contents.type == "Gate") {
            return this.contents.gateType
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
