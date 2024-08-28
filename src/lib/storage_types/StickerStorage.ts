import { Sticker } from "$lib/dat/Tools/Tools"
import { parseStorage } from "./ParseStorage"

export class StickerStorage {

    private stickerRegistry:Array<SerializableSticker>
    private name:string

    private stickerStorage:Array<{k:string, v:OrganizedCircuitStickerContents}>
    private storageKey = "StickerStorage"

    constructor(
        stickerRegistry:Array<SerializableSticker>,
        circuitName:string,
        storageKey:string | undefined = undefined
    ) {
        this.stickerRegistry = stickerRegistry
        this.name = circuitName

        this.storageKey = storageKey || this.storageKey

        this.stickerStorage = parseStorage(
            localStorage, this.storageKey,
            () => {return new Array<{k:string, v:OrganizedCircuitStickerContents}>()}
        )
    }

    private commit(storage = this.stickerStorage) {
        localStorage.setItem(this.storageKey, JSON.stringify(storage))
    }

    save(name?:string) {
        if (name !== undefined) {
            this.name = name
        }

        if (this.stickerRegistry.length === 0) {
            return "No Stickers"
        }

        this.setKey(this.name, {stickers:this.stickerRegistry})
        this.commit()

        return "Ok"
    }
    
    private setKey(k:string, v:OrganizedCircuitStickerContents) {
        for (let i = 0; i < this.stickerStorage.length; i++) {
            const pair = this.stickerStorage[i]
            if (pair.k == k) {
                const ret = pair.v
                pair.v = v
                return ret
            }
        }

        this.stickerStorage.push({k, v})
    }

}

export type OrganizedCircuitStickerContents = {
    stickers?:Array<SerializableSticker>
}

export class SerializableSticker {
    x:number
    y:number
    sticker:Sticker

    constructor(
        x:number,
        y:number,
        sticker:Sticker
    ) {
        this.x = x
        this.y = y
        this.sticker = sticker
    }
}
