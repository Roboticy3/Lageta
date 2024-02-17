
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

    dragStartGateType(
        type:GateType,
        e:MouseEvent,
        element: HTMLElement | null = null
    ) {
        this.contents = new CircuitControllerQueryResult(
            undefined,"Gate",undefined,type
        )
        this.sourceElement = element

        this.dragStartHandler(e)
    }

    dragStart(
        from:CircuitControllerQueryResult,
        e:MouseEvent,
        element: HTMLElement | null = null
    ) {
        this.contents = from
        this.sourceElement = element

        this.dragStartHandler(e)
    }

    dragEnd(e:MouseEvent) {
        
        const result = this.contents

        this.contents = new CircuitControllerQueryResult()
        this.sourceElement = null

        this.dragEndHandler(e)

        return result
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
