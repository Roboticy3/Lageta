import { CircuitController } from "$lib/circuit_types/CircuitController"
import { GateGraph } from "$lib/circuit_types/GateGraph"
import type { GateGrid } from "$lib/circuit_types/GateGrid"
import { GateType, GateTypeController, type ConnectionValue } from "$lib/circuit_types/GateType"
import { CompleteCondition, GameViewParameters } from "./GameViewParameters"
import { Buf, LevelGateType, getGateType } from "../dat/GateTypes/GateTypes"
import type { LevelParameters } from "$lib/dat/Levels/Levels"

export let all_levels = new Map<String, Level>()

export class Level {
    private params:GameViewParameters

    readonly x:number
    readonly y:number

    readonly desiredId:number

    readonly type:GateTypeController

    readonly playCondition:Array<ConnectionValue>

    constructor(
        params:LevelParameters
    ) {

        this.x = params.x || 0
        this.y = params.y || 0
        this.desiredId = params.desiredId || 0
        this.params = params.params || new GameViewParameters()

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

    description() {
        return this.params.directions
    }

    name() {
        return this.params.name
    }
}

