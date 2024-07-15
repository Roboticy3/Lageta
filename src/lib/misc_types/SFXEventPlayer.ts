import { CustomEventTarget } from "./CustomEventSystem";

export class SFXEventPlayer<E, K extends string> {
    readonly eventTarget:CustomEventTarget<E, K>

    readonly source:SFXEvent<K>[]

    readonly events:(() => any)[]

    constructor(
        eventTarget: CustomEventTarget<E, K>,
        source: SFXEvent<K>[],
        audioConstructor: (src?:string) => HTMLAudioElement
    ) {
        this.eventTarget = eventTarget
        this.source = source

        const events = new Array(source.length).fill(() => undefined)
        for (let i = 0; i < source.length; i++) {
            const s = source[i]
            const audio = audioConstructor(s.url)
            events[i] = () => {
                audio.play()
            }
            eventTarget.addEventListener(s.eventName, events[i])
        }
        this.events = events
    }
}

export type SFXEvent<K extends string> = {
    eventName:K,
    url:string
}