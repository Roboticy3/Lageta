import { SvelteComponent } from "svelte";
import { TutorialEventTarget, type TutorialEventKey, type TutorialEventListener } from "./TutorialEvent";
import { GameViewCircuitPanelEventTarget, type GameViewCircuitPanelEvent, type GameViewCircuitPanelEventKey, type GameViewCircuitPanelEventListener } from "$lib/circuit_types/GameViewCircuitPanelEvent";
import { CustomEventTarget, type CustomEventListener, type CustomEvent, createCustomEvent } from "$lib/misc_types/CustomEventSystem";

type TutorialEvent = {eventName:GameViewCircuitPanelEventKey | TutorialEventKey, f:(evt:any) => Promise<boolean | undefined>}
export type TutorialEventSequence = TutorialEvent[]

export interface TutorialEventSequenceControllerTemplate {
    stageEvent(idx:number): void;
    unstageEvent(idx:number): void;
    prepareNextEvent(from:CustomEvent<any, any>): void;
    getEvent(idx:number): TutorialEvent
}

export type TutorialEventSequenceEventKey = "preparenext"

export interface TutorialEventSequenceEvent {}

export type TutorialEventSequenceEventListener = CustomEventListener<TutorialEventSequenceEvent, TutorialEventSequenceEventKey>

export class TutorialEventSequenceEventTarget extends CustomEventTarget<TutorialEventSequenceEvent, TutorialEventSequenceEventKey> {}

export class TutorialEventSequenceController implements TutorialEventSequenceControllerTemplate {
    stageEvent(idx: number): void {
        const stage = this.sequence[idx]
        if (stage) switch (stage.eventName) {
            case "continue":
                this.tutorialEventTarget.addEventListener("continue", stage.f)
                break;
            default: this.editorEventTarget.addEventListener(stage.eventName, stage.f)
        }
    }
    unstageEvent(idx: number): void {
        const stage = this.sequence[idx]
        if (stage) switch (stage.eventName) {
            case "continue": 
                this.tutorialEventTarget.removeEventListener("continue", stage.f)
                break;
            default: this.editorEventTarget.removeEventListener(stage.eventName, stage.f)
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

    constructor(
        sq:TutorialEventSequence
    ) {
        this.sequence = sq
    }
}