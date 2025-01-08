import { CircuitController } from "$lib/circuit_types/CircuitController"
import { GateGraph } from "$lib/circuit_types/GateGraph"
import type { GateGrid } from "$lib/circuit_types/GateGrid"
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

export function randomLevel(lParams:LevelParameters, gParams:GateTypeParameters, highP:number, serializable=false) {
    const newGParams = {...gParams}
    newGParams.inputs ||= lParams.inputs
    newGParams.outputs ||= lParams.outputs

    //generate a random gate type to be the solver for this level
    const gType = randomGateType(newGParams, highP)
    console.log("creating random level... generated gate type: ", gType)

    //use the gate type to modify lParams
    //the random gate must be used to compute the grid size, contents, complete condition, and play condition. Everything else should be left unmodified
    
    //make shallow copies of the big objects in the parameters
    const newLParams = {...lParams}
    const newParams = {...lParams.params}
    newParams.serializable = serializable
    newLParams.params = newParams

    //grid size will give 2 grid squares above and below the inputs and outputs
    const inSize = lParams.inputs || gType.model.sizeIn
    const outSize = lParams.outputs || gType.model.sizeOut
    const pinMax = Math.max(...[inSize, outSize])
    const inputType = new GateTypeController(Input(inSize))
    const outputType = new GateTypeController(Output(outSize))

    const verticalGridMargin = 3
    const verticalGridScale = 1
    const gridHeight = verticalGridScale * pinMax + 2 * verticalGridMargin

    //grid will have a width of the input width + the output width + 2 * the same maximum
    const horizontalGridScale = 5
    const gridWidth = horizontalGridScale * pinMax + inputType.model.gridWidth + outputType.model.gridWidth

    //grid contents will contain one input and output of the correct size
    const grid:OrganizedCircuitContents = {
        size:[gridWidth, gridHeight],
        gateTypes:[inputType, outputType],
        gates:[
            {x:0,y:verticalGridMargin + (pinMax - inSize),id:0,type:inputType.name},
            {x:gridWidth - outputType.model.gridWidth,y:verticalGridMargin + (pinMax - inSize),id:1,type:outputType.name},
        ]
    }

    newParams.grid = grid
    console.log("creating random level... generated grid: ", newParams.grid)

    //repeat the signal as many times as it takes to pass 500 frames
    const stepSize = 5
    const targetLength = 200
    const repeatCount = Math.ceil(targetLength / (stepSize * Math.pow(2, inSize)))
    const signal = countingSignal(gType, stepSize, repeatCount)

    newParams.completeCondition = signal
    console.log("creating random level... generated signal: ", newParams.completeCondition)

    //finally, generate a random input string, compute the expected output, and set that to the play condition
    const randomInput = new Array(inSize)
    for (let i = 0; i < inSize; i++) {
        randomInput[i] = Math.random() >= highP
    }
    const randomState = gType.model.f({override:randomInput})

    newLParams.playCondition = new Array(outSize)
    for (let i = 0; i < outSize; i++) {
        newLParams.playCondition[i] = randomState.override[i] || false
    }

    console.log("creating random level... generated play condition: ", newLParams.playCondition)

    return newLParams

}

