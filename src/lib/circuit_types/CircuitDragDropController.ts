
import type { Gate, GateType } from "./Gate";
import type { ConnectionType } from "./GateGraph";

export class CircuitDragDropController {

    public sourceElement : HTMLElement | null = null
    private currentItem : CircuitDragDropItem | undefined = undefined

    public dragStart(newItem : CircuitDragDropItem, element: HTMLElement | null) {
        this.currentItem = newItem     
        this.sourceElement = element  
    }

    public dragEnd() {
        this.currentItem = undefined
        this.sourceElement = null
    }

    public getItem() {return this.currentItem}

}

export type CircuitDragDropItem = GateType | [number, number]
