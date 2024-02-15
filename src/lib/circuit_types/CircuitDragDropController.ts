
import type { CircuitController } from "./CircuitController";
import { all_gates, type Gate, type GateType } from "./Gate";
import type { ConnectionType } from "./GateGraph";

export class CircuitDragDropController {

    public circuitController:CircuitController

    constructor(
        circuitController:CircuitController
    ) {
        this.circuitController = circuitController
    }

    public sourceElement : HTMLElement | null = null
    private currentType : GateType | undefined = undefined
    private currentGate : Gate | undefined = undefined
    private currentConnectionType : ConnectionType = ""
    private currentConnectionIndex : number | undefined

    public dragStartHandler=(e:MouseEvent) => {}
    public dragEndHandler=(e:MouseEvent) => {}
    public dragCircuitHandler=(e:MouseEvent) => {}

    public dragStart(
        from: number | string | GateType, 
        element: HTMLElement | null, 
        e:MouseEvent, 
        connectionType: ConnectionType = "", 
        connectionIndex: number | undefined = undefined
    ) {
        switch (typeof from) {
            case "number":
                this.currentGate = this.circuitController.getGate(from)
                if (this.currentGate === undefined) break;
                this.currentType = this.currentGate.type
                break;
            case "string":
                this.currentType = all_gates.get(from)
                break;
            default:
                this.currentType = from
        }  

        if (this.currentGate !== undefined) {
            this.currentConnectionType = connectionType
            this.currentConnectionIndex = connectionIndex
        }
        this.sourceElement = element  

        this.dragCircuitHandler(e)
    }

    public dragEnd(e:MouseEvent) {
        this.currentType = undefined
        this.currentGate = undefined
        this.currentConnectionIndex = undefined
        this.currentConnectionType = ""
        this.sourceElement = null

        this.dragEndHandler(e)
    }

    public dragCircuit(e:MouseEvent) {
        this.dragCircuitHandler(e)
    }

    public getGateType() {
        return this.currentType
    }

}

export type CircuitDragDropItem = GateType | [number, number]
