import { Buf, all_gates, getGateType, getGateTypeParams } from "$lib/dat/GateTypes/GateTypes"
import { all_levels, Level } from "$lib/level_types/Level"
import { Freeplay, getLevel, getLevelParams, type LevelParameters } from "$lib/dat/Levels/Levels"
import { parseStorage } from "./ParseStorage"
import { browser } from "$app/environment"
import { getToolParams } from "$lib/dat/Tools/Tools"
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

    commit(storage = this.progressStorage) {
        //don't update the progress if we're hacking lol
        if (this.allUnlocks) {
            return
        }
        localStorage.setItem(this.storageKey, JSON.stringify(storage))
    }

    cheat() {
        this.allUnlocks = true
        this.progressStorage.gates = [...all_gates.keys()] as string[]
        this.progressStorage.levels = Array.from(all_levels.keys()).map(v => {return {name:v, new:true, complete:false} as LevelProgress})
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
                const result = getLevelParams(v.name)
                if (result) return result
                console.log("Failed to load Level ",v.name)
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
        return this.progressStorage.levels.findIndex((v) => v.name === levelName)
    }

    addLevel(levelName:string) {
        const params = getLevelParams(levelName)
        if (params !== undefined && this.findLevel(levelName) === -1) {
            this.progressStorage.levels.push({name:levelName, new:true})
        }
        this.commit()
        console.log("Unlocked level ", levelName)
    }

    addHintTokens(count=1) {
        this.progressStorage.hintTokens += count
        this.commit()
    }

    getHintTokens() {
        return this.progressStorage.hintTokens
    }

    findTool(toolName:string) {
        return this.progressStorage.tools.findIndex((p) => p.name === toolName)
    }

    getTool(toolName:string) {
        return this.progressStorage.tools.find((p) => p.name === toolName)
    }

    addTool(item:string) {
        const tParams = getToolParams(item)
        if (this.findTool(item) === -1 && tParams)
            this.progressStorage.tools.push(tParams)
        this.commit()
    }

    getTools() {
        return this.progressStorage.tools
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
        return this.progressStorage.levels.filter(v => v.new).map(v => v.name)
    }

    removeNewLevel(oldLevel:string) {
        let oldLevelProgress = this.getLevelProgress(oldLevel)
        if (oldLevelProgress) {
            oldLevelProgress.new = false
            this.commit()
        }
    }

    completeLevel(level:string) {
        let levelProgress = this.getLevelProgress(level)
        if (levelProgress) {
            levelProgress.complete = true
            this.commit()
        }
    }

    useHint(level:string) {
        let levelProgress = this.getLevelProgress(level)
        if (!levelProgress?.hintUsed && this.getHintTokens() >= 1) {
            if (!levelProgress) {
                this.addLevel(level)
                levelProgress = this.getLevelProgress(level)
                if (levelProgress) levelProgress.hintUsed = true
            }
            else {
                levelProgress.hintUsed = true
            }
            this.progressStorage.hintTokens -= 1
            this.commit()
            return true
        }
        return false
    }

    getLevelProgress(level:string) {
        return this.progressStorage.levels.find((v) => v.name === level) 
    }
}

class ProgressStorageObject {
    gates:Array<string> = []
    levels:Array<LevelProgress> = []
    tools:Array<ToolProgress> = []
    passedTutorials:Array<string> = []

    currentTutorial:string = "Tutorial"

    hintTokens=0

    push(p:ProgressStorageObject) {
        this.gates.push(...p.gates)
        this.levels.push(...p.levels)
        this.tools.push(...p.tools)
        this.passedTutorials.push(...p.passedTutorials)

        this.currentTutorial = p.currentTutorial

        this.hintTokens += p.hintTokens
    }
}

type LevelProgress = {
    name:string,
    new:boolean,
    complete?:boolean,
    hintUsed?:boolean
}

type ToolProgress = {
    name:string,
    data:any
}