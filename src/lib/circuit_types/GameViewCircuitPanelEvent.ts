import { CustomEventTarget, createCustomEvent, type CustomEventListener } from "$lib/misc_types/CustomEventSystem"
import { CircuitControllerQueryResult, type CircuitControllerQueryResultContentType } from "./CircuitControllerQueryResult"

/**
 * Event keys are split into 2 sectors,
 * Events that change the circuit in a way that should be autosaved,
 * then events that shouldn't result in an autosave after that
 */
export const GAMEVIEWCIRCUITPANELEVENTKEYS = [
    "dragstart", // 0
    "drag", // 1
    "drop", // 2
    "addwire", // 3
    "removewire", // 4
    "movegate", // 5
    "removegate", // 6 
    "addsticker", // 7
    "movesticker", // 8, unused
    "removesticker", // 9
    "addgate", // 10
    "setinput", // 11
] as const;

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

export class GameViewCircuitPanelEventTarget extends CustomEventTarget<GameViewCircuitPanelEvent, GameViewCircuitPanelEventKey> {
    /**
     * Listen for updates that are independent of the circuit's state. e.g. updates that the user would want to be autosaved.
     * As opposed to GateGraph's "update" event, which updates when the state of the circuit changes. e.g. updates that the user would not want to be autosaved
     * See GAMEVIEWCIRCUITPANELEVENTKEYS
     * @param listener 
     */
    addUpdateListener(listener:GameViewCircuitPanelEventListener) {
        for (let i = 3; i < 11; i++) {
            this.addEventListener(GAMEVIEWCIRCUITPANELEVENTKEYS[i], listener)
        }
    }
}