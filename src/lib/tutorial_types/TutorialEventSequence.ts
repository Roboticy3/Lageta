import { SvelteComponent } from "svelte";
import { TUTORIALEVENTKEYS, TutorialEventTarget, type TutorialEventKey, type TutorialEventListener } from "./TutorialEvent";
import { GAMEVIEWCIRCUITPANELEVENTKEYS, GameViewCircuitPanelEventTarget, type GameViewCircuitPanelEvent, type GameViewCircuitPanelEventKey, type GameViewCircuitPanelEventListener } from "$lib/circuit_types/GameViewCircuitPanelEvent";
import { CustomEventTarget, type CustomEventListener, type CustomEvent, createCustomEvent } from "$lib/misc_types/CustomEventSystem";
import { CircuitSignalSetViewEventTarget, SIGNALSETVIEWEVENTKEYS, SignalSetViewEventTarget, type SignalSetViewEvent, type SignalSetViewEventKey } from "$lib/signal_types/SignalSetViewEvent";
import type { ConnectionValue } from "$lib/circuit_types/GateType";

type TutorialEvent = {eventName:GameViewCircuitPanelEventKey | TutorialEventKey | SignalSetViewEventKey, f:(evt:any) => Promise<boolean | undefined>}
export type TutorialEventSequence = TutorialEvent[]

export interface TutorialEventSequenceControllerTemplate {
    stageEvent(idx:number): void;
    unstageEvent(idx:number): void;
    prepareNextEvent(from:CustomEvent<any, any>): void;
    getEvent(idx:number): TutorialEvent
}

export const TUTORIALEVENTSEQUENCEEVENTKEYS = ["preparenext"] as const
type TutorialEventSequenceEventKeyTuple = typeof TUTORIALEVENTSEQUENCEEVENTKEYS
export type TutorialEventSequenceEventKey = TutorialEventSequenceEventKeyTuple[number]

export interface TutorialEventSequenceEvent {}

export type TutorialEventSequenceEventListener = CustomEventListener<TutorialEventSequenceEvent, TutorialEventSequenceEventKey>

export class TutorialEventSequenceEventTarget extends CustomEventTarget<TutorialEventSequenceEvent, TutorialEventSequenceEventKey> {}

export class TutorialEventSequenceController implements TutorialEventSequenceControllerTemplate {

    stageEvent(idx: number): void {
        const stage = this.sequence[idx]
        if (!stage) return
        const eventName = stage.eventName
        if (TUTORIALEVENTKEYS.find((k) => k === eventName)) {
            const name = eventName as TutorialEventKey
            this.tutorialEventTarget.addEventListener(name, stage.f)
        }
        else if (GAMEVIEWCIRCUITPANELEVENTKEYS.find((k) => k === eventName)) {
            const name = eventName as GameViewCircuitPanelEventKey
            this.editorEventTarget.addEventListener(name, stage.f)
        }
        else if (SIGNALSETVIEWEVENTKEYS.find((k) => k === eventName)) {
            const name = eventName as SignalSetViewEventKey
            this.signalEventTarget.addEventListener(name, stage.f)
        }
    }
    unstageEvent(idx: number): void {
        const stage = this.sequence[idx]
        if (!stage) return
        const eventName = stage.eventName
        if (TUTORIALEVENTKEYS.find((k) => k === eventName)) {
            const name = eventName as TutorialEventKey
            this.tutorialEventTarget.removeEventListener(name, stage.f)
        }
        else if (GAMEVIEWCIRCUITPANELEVENTKEYS.find((k) => k === eventName)) {
            const name = eventName as GameViewCircuitPanelEventKey
            this.editorEventTarget.removeEventListener(name, stage.f)
        }
        else if (SIGNALSETVIEWEVENTKEYS.find((k) => k === eventName)) {
            const name = eventName as SignalSetViewEventKey
            this.signalEventTarget.removeEventListener(name, stage.f)
        }
    }
    prepareNextEvent(from:CustomEvent<any, any>): void {
        this.currentEvent++
        this.unstageEvent(this.currentEvent - 2)
        this.stageEvent(this.currentEvent - 1)
        this.eventSequenceTarget.dispatchEvent(
            createCustomEvent<
                TutorialEventSequenceEvent, 
                TutorialEventSequenceEventKey
            >({}, "preparenext", from.target)
        )
    }

    getEvent(idx:number) {return this.sequence[idx]}
    getCurrentEvent() {return this.sequence[this.currentEvent - 1]}

    private sequence:TutorialEventSequence
    private currentEvent = 0

    readonly eventSequenceTarget: TutorialEventSequenceEventTarget = new TutorialEventSequenceEventTarget()
    readonly tutorialEventTarget = new class extends TutorialEventTarget {
        constructor(
            prepareNextEvent: (from:CustomEvent<any, any>) => void
        ) {
            super()
            this.prepareNextEvent = prepareNextEvent
        }

        prepareNextEvent

        async dispatchEvent(event:CustomEvent<TutorialEvent, TutorialEventKey>) {
            const set = this.eventMap.get(event.type)
            if (!set) return false
            for (let ev of set) {
                if (await ev(event)) {
                    this.prepareNextEvent(event)
                    break
                }
            }
            return true
        }
    }(this.prepareNextEvent.bind(this))

    readonly editorEventTarget = new class extends GameViewCircuitPanelEventTarget {
        constructor(
            prepareNextEvent: (from:CustomEvent<any, any>) => void
        ) {
            super()
            this.prepareNextEvent = prepareNextEvent
        }

        prepareNextEvent

        async dispatchEvent(event:CustomEvent<GameViewCircuitPanelEvent, GameViewCircuitPanelEventKey>) {
            const set = this.eventMap.get(event.type)
            if (!set) return false
            for (let ev of set) {
                if (await ev(event)) {
                    this.prepareNextEvent(event)
                }
            }
            return true
        }
    }(this.prepareNextEvent.bind(this))

    readonly signalEventTarget = new class extends CircuitSignalSetViewEventTarget {
        constructor(
            prepareNextEvent: (from:CustomEvent<any, any>) => void
        ) {
            super()
            this.prepareNextEvent = prepareNextEvent
        }

        prepareNextEvent

        async dispatchEvent(event:CustomEvent<SignalSetViewEvent<ConnectionValue[]>, SignalSetViewEventKey>) {
            const set = this.eventMap.get(event.type)
            if (!set) return false
            for (let ev of set) {
                if (await ev(event)) {
                    this.prepareNextEvent(event)
                }
            }
            return true
        }
    }(this.prepareNextEvent.bind(this))

    constructor(
        sq:TutorialEventSequence
    ) {
        this.sequence = sq
    }
}