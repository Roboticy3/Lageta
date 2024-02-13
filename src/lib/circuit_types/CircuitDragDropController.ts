
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

    public dragStart(from: number | string | GateType, element: HTMLElement | null, connectionType: ConnectionType = "", connectionIndex: number | undefined = undefined) {
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
            this.currentConnectionType = this.currentConnectionType
            this.currentConnectionIndex = connectionIndex
        }
        this.sourceElement = element  
    }

    public dragEnd() {
        this.currentType = undefined
        this.currentGate = undefined
        this.currentConnectionIndex = undefined
        this.currentConnectionType = ""
        this.sourceElement = null
    }

    public getGateType() {
        return this.currentType
    }

}

export type CircuitDragDropItem = GateType | [number, number]
