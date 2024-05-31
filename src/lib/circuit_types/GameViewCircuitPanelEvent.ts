import { CustomEventTarget, createCustomEvent, type CustomEventListener } from "$lib/misc_types/CustomEventSystem"
import { CircuitControllerQueryResult, type CircuitControllerQueryResultContentType } from "./CircuitControllerQueryResult"

export const GAMEVIEWCIRCUITPANELEVENTKEYS = ["dragstart", "drag", "drop", "setinput", "changed"] as const;
type GameViewCircuitPanelEventKeyTuple = typeof GAMEVIEWCIRCUITPANELEVENTKEYS;
export type GameViewCircuitPanelEventKey = GameViewCircuitPanelEventKeyTuple[number]

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