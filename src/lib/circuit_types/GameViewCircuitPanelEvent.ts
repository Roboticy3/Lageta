import { CircuitControllerQueryResult, type CircuitControllerQueryResultContentType } from "./CircuitControllerQueryResult"

export interface GameViewCircuitPanelEventKeys {
    "dragstart": GameViewCircuitPanelEvent,
    "drag": GameViewCircuitPanelEvent,
    "drop": GameViewCircuitPanelEvent
}

export type GameViewCircuitPanelEventKey = keyof GameViewCircuitPanelEventKeys

export interface GameViewCircuitPanelEvent extends Event {
    from:CircuitControllerQueryResult
    to:CircuitControllerQueryResult
}

/**
 * My earnest attempt to extend the existing dom events system to fit the circuit editor
 * 
 * Does not provide behavior for the options parameter because fuck that noise. 
 * GameViewCircuitPanel will store one of these event targets and send it events as if it's circuitContainer is the target.
 * The timestamp and type fields will also be filled appropriately, everything else is either "unused" by NodeJS or just completely asenine.
 */
export class GameViewcircuitPanelEventTarget extends EventTarget {
    private eventMap:Map<string, Set<EventListener>> = new Map()

    addEventListener(
        type: GameViewCircuitPanelEventKey,
        listener: EventListener,
        options?: AddEventListenerOptions | boolean,
    ) {
        const set = this.eventMap.get(type)
        if (set) set.add(listener)
        else this.eventMap.set(type, new Set())
    }
    dispatchEvent(event: Event) {
        const set = this.eventMap.get(event.type)
        if (!set) return false
        for (let ev of set) {
            ev(event)
        }
        return true
    }
    removeEventListener(
        type: GameViewCircuitPanelEventKey,
        listener: EventListener,
        options?: EventListenerOptions | boolean,
    ) {
        const set = this.eventMap.get(type)
        if (set) set.add(listener)
        else this.eventMap.set(type, new Set())
    }
}

//pain
export function createGameViewCircuitPanelEvent(
    type:GameViewCircuitPanelEventKey, 
    from:CircuitControllerQueryResult, 
    to:CircuitControllerQueryResult, 
    circuitContainer:HTMLElement) 
{
    return {
        from:from,
        to:to,
        type:type,
        timeStamp:Date.now(),
        target:circuitContainer as EventTarget
    } as GameViewCircuitPanelEvent
}