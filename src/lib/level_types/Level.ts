import { GateType, GateTypeController, type ConnectionValue } from "$lib/circuit_types/GateType"
import { CompleteCondition, type GameViewParameters } from "./GameViewParameters"
import { Buf, type GateTypeParameters, Input, Output, getGateType, randomGateType } from "../dat/GateTypes/GateTypes"
import { countingSignal, type LevelParameters } from "$lib/dat/Levels/Levels"
import { type OrganizedCircuitContents } from "$lib/storage_types/CircuitStorage"

export let all_levels = new Map<String, Level>()

export class Level {
    private params:GameViewParameters

    readonly x:number
    readonly y:number

    readonly desiredId:number | undefined

    readonly type:GateTypeController

    readonly playCondition:Array<ConnectionValue>

    constructor(
        params:LevelParameters
    ) {

        this.x = params.x || -1
        this.y = params.y || -1
        this.desiredId = params.desiredId === undefined ? undefined : params.desiredId
        this.params = params.params || {}

        this.type = getGateType(params.type || Buf)

        console.log(this.type)

        this.playCondition = params.playCondition || new Array<boolean>(this.type.model.sizeOut).fill(true)

        if (params.register && params.params?.name) {
            all_levels.set(params.params.name, this)
        }

        console.log("Created level", this)
    }

    unpack() {
        return this.params;
    }

    name() {
        return this.params.name
    }
}
