import { Freeplay, Level } from "$lib/menu_types/Level";
import { parseStorage } from "./ParseStorage";

export class LevelStorage {
    private level:Level
    private storageKey:string = "currentLevel"

    constructor(
        level:Level = Freeplay, 
        storageKey:string | undefined = undefined
    ) {
        this.level = level
        this.storageKey = storageKey || this.storageKey
    }

    commit(level = this.level) {
        sessionStorage.setItem(this.storageKey, JSON.stringify(level))
    }

    getCurrentLevel() {
        this.level = parseStorage(
            sessionStorage, 
            this.storageKey, 
            () => {
                return new Level()
            }
        )
        this.commit()
        return this.level
    }
}