import { CircuitController } from "$lib/circuit_types/CircuitController"
import { GateGraph } from "$lib/circuit_types/GateGraph"
import type { GateGrid } from "$lib/circuit_types/GateGrid"
import { GateType } from "$lib/circuit_types/GateType"
import { CompleteCondition, GameViewParameters } from "./GameViewParameters"
import { LevelGateType } from "../dat/GateTypes/GateTypes"

export let all_levels = new Map<String, Level>()

export class Level {
    private params:GameViewParameters

    readonly x:number
    readonly y:number

    readonly type:GateType

    readonly playCondition:Array<boolean>

    constructor(
        params:GameViewParameters,
        x:number = 0,
        y:number = 0,
        type:GateType = LevelGateType,
        playCondition:Array<boolean> | undefined = undefined,
        register:boolean = true
    ) {

        this.x = x
        this.y = y
        this.params = params

        this.type = type

        this.playCondition = playCondition || new Array<boolean>(this.type.sizeOut).fill(true)

        if (register) {
            all_levels.set(params.name, this)
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

