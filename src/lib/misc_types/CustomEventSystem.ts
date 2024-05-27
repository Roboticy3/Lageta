export interface KeyMapInterface<E> {[key:string]: E}

export type CustomEvent<E, K extends string> = {timeStamp:number, target:EventTarget | null, type:K} & E

export type CustomEventListener<E, K extends string> = (evt:CustomEvent<E, K>) => any

export class CustomEventTarget<E, K extends string> {
    protected eventMap:Map<K, Set<CustomEventListener<E, K>>> = new Map()

    addEventListener(
        type: K,
        listener: CustomEventListener<E, K>
    ) {
        const set = this.eventMap.get(type)
        if (set) set.add(listener)
        else this.eventMap.set(type, new Set([listener]))
    }
    dispatchEvent(event: CustomEvent<E, K>) {
        const set = this.eventMap.get(event.type)
        if (!set) return false
        for (let ev of set) {
            ev(event)
        }
        return true
    }
    removeEventListener(
        type: K,
        listener: CustomEventListener<E, K>
    ) {
        const set = this.eventMap.get(type)
        if (set) set.delete(listener)
    }
}

export function createCustomEvent<E, K extends string>(props:E, type:K, target:EventTarget | null): CustomEvent<E, K> {
    return {...{type:type, target:target, timeStamp:Date.now()}, ...props} as CustomEvent<E, K>
}