import type { CircuitController } from "$lib/circuit_types/CircuitController"
import { Not, type GateType, Buf, And, Or, Input } from "$lib/circuit_types/Gate"
import type { GateGrid } from "$lib/circuit_types/GateGrid"
import { Freeplay, W1S1, type Level, W1S2 } from "$lib/menu_types/Level"
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
        localStorage.setItem(this.storageKey, JSON.stringify(storage))
    }

    gates() {
        return this.progressStorage.gates
    }

    levels() {
        return this.progressStorage.levels
    }
}

class ProgressStorageObject {
    gates:Array<GateType> = [
        Buf,
        Not,
        And,
        Or,
        Input
    ]
    levels:Array<Level> = [
        Freeplay,
        W1S1,
        W1S2
    ]

    push(p:ProgressStorageObject) {
        this.gates.push(...p.gates)
        this.levels.push(...p.levels)
    }
}