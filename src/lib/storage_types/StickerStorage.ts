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

    /**
     * Load stickers from storage
     * 
     * Stickers are purely visual elements, so they are not combined with the grid automatically, loop through the results to add stickers later
     * @param name 
     * @param x 
     * @param y 
     * @returns 
     */
    load(name?:string, x=0, y=0) {
        if (name !== undefined) {
            this.name = name
        }

        let existing = this.getKey(this.name)
        if (existing === undefined) {
            return "Stickers Not Found In Storage"
        }

        if (name !== undefined) {
            this.name = name
        }

        const newStickers = existing.stickers
        if (newStickers === undefined) {
            return "Stickers Empty"
        }

        else {
            newStickers.forEach((s) => {
                s.x += x
                s.y += y
            })
            return newStickers
        }
    }

    remove(s:string | undefined) {
        const has = this.getKey(s || "")
        if (has !== undefined) {
            this.removeKey(s || "")
            this.commit()
            return true
        }
        return false
    }

    private getKey(k:string) {
        for (let i = 0; i < this.stickerStorage.length; i++) {
            const pair = this.stickerStorage[i]
            if (pair.k == k) {
                const ret = pair.v
                return ret
            }
        }
        return undefined
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

    private removeKey(k:string) {
        for (let i = 0; i < this.stickerStorage.length; i++) {
            const pair = this.stickerStorage[i]
            if (pair.k == k) {
                const ret = pair.v
                this.stickerStorage.splice(i, 1)
                return ret
            }
        }
        return undefined
    }

    keys() {
        let keys = new Array<string>(this.stickerStorage.length)
        for (let i = 0; i < keys.length; i++) {
            keys[i] = this.stickerStorage[i].k
        }
        return keys
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
