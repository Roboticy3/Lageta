import { CustomEventTarget, createCustomEvent, type CustomEventListener } from "$lib/misc_types/CustomEventSystem"
import { CircuitControllerQueryResult, type CircuitControllerQueryResultContentType } from "./CircuitControllerQueryResult"

export type GameViewCircuitPanelEventKey = "dragstart" | "drag" | "drop"

export interface GameViewCircuitPanelEvent {
    from:CircuitControllerQueryResult
    to:CircuitControllerQueryResult
}

export type GameViewCircuitPanelEventListener = CustomEventListener<GameViewCircuitPanelEvent, GameViewCircuitPanelEventKey>

export function createGameViewCircuitPanelEvent( 
    type: GameViewCircuitPanelEventKey, 
    from: CircuitControllerQueryResult, 
    to: CircuitControllerQueryResult, 
    target: EventTarget
) {
    return createCustomEvent({from:from, to:to}, type, target)
}

export class GameViewCircuitPanelEventTarget extends CustomEventTarget<GameViewCircuitPanelEvent, GameViewCircuitPanelEventKey> {}