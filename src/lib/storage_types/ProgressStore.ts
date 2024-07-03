import { Buf, all_gates, getGateType, getGateTypeParams } from "$lib/dat/GateTypes/GateTypes"
import { all_levels } from "$lib/level_types/Level"
import { Freeplay, getLevel, getLevelParams, type LevelParameters } from "$lib/dat/Levels/Levels"
import { parseStorage } from "./ParseStorage"
import { browser } from "$app/environment"
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

        if (browser) {

            this.storageKey = storageKey || this.storageKey
            this.progressStorage = parseStorage(
                localStorage, this.storageKey,
                () => {return new ProgressStorageObject()}
            )
            this.commit()
        }
        else {
            throw Error("Cant instantiate ProgressStorage without localStorage!")
        }
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
    }

    gates() {
        return this.progressStorage.gates.map(
            (v, _i, _a) => {
                const result = getGateTypeParams(v)
                if (result) return getGateType(result)
                console.log("Failed to load GateType ",v)
                return getGateType(Buf)
            })
    }

    gateNames() {
        return this.progressStorage.gates
    }

    levels() {
        return this.progressStorage.levels.map(
            (v, _i, _a) => {
                const result = getLevelParams(v)
                if (result) return result
                console.log("Failed to load Level ",v)
                return Freeplay as LevelParameters
        })
    }

    findGate(gateName:string) {
        return this.progressStorage.gates.indexOf(gateName)
    }

    addGate(item:string) {
        const gateType = all_gates.get(item)
        if (gateType !== undefined && this.findGate(item) === -1) {
            this.progressStorage.gates.push(item)
        }
        this.commit()
        console.log("Unlocked gate ", item)
    }

    findLevel(levelName:string) {
        return this.progressStorage.levels.indexOf(levelName)
    }

    addLevel(item:string) {
        const params = getLevelParams(item)
        console.log(params)
        if (params !== undefined && this.findLevel(item) === -1) {
            this.progressStorage.levels.push(item)
        }
        this.commit()
        console.log("Unlocked level ", item)
    }

    passTutorial(name=this.getCurrentTutorial()) {
        console.log("passing tutorial", name)
        this.progressStorage.passedTutorials.push(name)
        this.progressStorage.currentTutorial = ""
        this.commit()
    }

    getCurrentTutorial() {
        return this.progressStorage.currentTutorial
    }

    setCurrentTutorial(name:string) {
        this.progressStorage.currentTutorial = name
        this.commit()
    }

    getPassedTutorials() {
        return this.progressStorage.passedTutorials
    }

    getNewLevels() {
        return this.progressStorage.newLevels
    }

    setNewLevels(newLevels:string[]) {
        this.progressStorage.newLevels = newLevels
        this.commit()
    }
}

class ProgressStorageObject {
    gates:Array<string> = [
        "Not"
    ]
    levels:Array<string> = []
    passedTutorials:Array<string> = []

    newLevels:Array<string> = []
    currentTutorial:string = "Tutorial"

    push(p:ProgressStorageObject) {
        this.gates.push(...p.gates)
        this.levels.push(...p.levels)
        this.passedTutorials.push(...p.passedTutorials)

        this.newLevels = p.newLevels
        this.currentTutorial = p.currentTutorial
    }
}