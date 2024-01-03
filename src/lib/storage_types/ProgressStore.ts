import { And, Buf, Not, Or, all_gates } from "$lib/circuit_types/Gate"
import { Freeplay, W1S1, W1S2, all_levels } from "$lib/level_types/Level"
import { parseStorage } from "./ParseStorage"
//storage format
/*
    {
        gates:[
            0:
                type0
            1:
                type1
            .
            .
            .
        ]
        levels:[
            0:
                level0
            1:
                level1
            .
            .
            .
        ]
    }
*/
export class ProgressStorage {

    private progressStorage:ProgressStorageObject
    private storageKey = "ProgressStorage"
    private allUnlocks = false

    constructor(
        storageKey:string | undefined = undefined
    ) {

        this.storageKey = storageKey || this.storageKey
        this.progressStorage = parseStorage(
            localStorage, this.storageKey,
            () => {return new ProgressStorageObject()}
        )
        this.commit()
    }

    private commit(storage = this.progressStorage) {
        //don't update the progress if we're hacking lol
        if (this.allUnlocks) {
            return
        }
        localStorage.setItem(this.storageKey, JSON.stringify(storage))
    }

    cheat() {
        this.allUnlocks = true
        this.progressStorage.gates = [...all_gates.keys()] as string[]
        this.progressStorage.levels = [...all_levels.keys()] as string[]
        console.log(this.progressStorage)
    }

    gates() {
        return this.progressStorage.gates.map(
            (v, _i, _a) => {
                return all_gates.get(v) || Buf
            })
    }

    levels() {
        return this.progressStorage.levels.map(
            (v, _i, _a) => {
                return all_levels.get(v) || Freeplay
        })
    }

    findLevel(levelName:string) {
        return this.progressStorage.levels.indexOf(levelName)
    }
}

class ProgressStorageObject {
    gates:Array<string> = [
        "Buf",
        "Not",
        "And",
        "Or"
    ]
    levels:Array<string> = [
        "Freeplay",
        "1",
        "2"
    ]

    push(p:ProgressStorageObject) {
        this.gates.push(...p.gates)
        this.levels.push(...p.levels)
    }
}

console.log(new ProgressStorageObject())