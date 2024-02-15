
import { CircuitControllerQueryResult, type CircuitController } from "./CircuitController";
import { all_gates, Gate, type GateType } from "./Gate";
import type { ConnectionType } from "./GateGraph";

export class CircuitDragDropController {

    public circuitController:CircuitController

    constructor(
        circuitController:CircuitController
    ) {
        this.circuitController = circuitController
    }

    public sourceElement : HTMLElement | null = null

    private contents:CircuitControllerQueryResult = new CircuitControllerQueryResult()

    public dragStartHandler=(e:MouseEvent) => {}
    public dragEndHandler=(e:MouseEvent) => {}
    public dragCircuitHandler=(e:MouseEvent) => {}

    public dragStartGateType(
        type:GateType,
        e:MouseEvent,
        element: HTMLElement | null = null
    ) {
        this.contents = {
            type:"Gate",
            gate:new Gate(type),
            connectionIndex: undefined
        }
        this.sourceElement = element

        this.dragStartHandler(e)
    }

    public dragStart(
        from:CircuitControllerQueryResult,
        e:MouseEvent,
        element: HTMLElement | null = null
    ) {
        this.contents = from
        this.sourceElement = element

        this.dragStartHandler(e)
    }

    public dragEnd(e:MouseEvent) {
        
        const result = this.contents

        this.contents = new CircuitControllerQueryResult()
        this.sourceElement = null

        this.dragEndHandler(e)

        return result
    }

    public dragCircuit(e:MouseEvent) {
        this.dragCircuitHandler(e)
    }

    public getGateType() {
        if (this.contents.type == "Gate") {
            return this.contents.gate?.type
        }
        return undefined
    }

}

export type CircuitDragDropItem = GateType | [number, number]
