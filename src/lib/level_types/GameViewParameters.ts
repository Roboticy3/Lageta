import { CircuitController } from "$lib/circuit_types/CircuitController"
import { Symbols } from "$lib/dat/Symbols/Symbols";
import { ConnectionValueSignalSet, SignalSet } from "$lib/signal_types/Signal"
import { OrganizedCircuit, type OrganizedCircuitContents } from "$lib/storage_types/CircuitStorage"

export type GameViewParameters = {
    hint?: string;
    name?:string
    directions?:string
    grid?:GridSource
    completeCondition?:CompleteConditionSource
    completeRewards?:string[]

    allUnlocks?:boolean

    editorParams?:Object
    rendererParams?:Object

    storageKey?:string

    serializable?:boolean
}

export const MissingParameters = {
    name:"?",
    directions:"?",
    allUnlocks:false,
    editorParams:{},
    rendererParams:{},
    storageKey:"CircuitStorage"
} as GameViewParameters

export class CompleteCondition {
    inputSize=1
    outputSize=1

    constructor (
        from:CompleteConditionSource
    ) {
        if (from instanceof SignalSet) {
            this.inputSize = from.inputs
            this.outputSize = from.outputs
        }


    }
}

export function gridSourceToGrid(source:GridSource) {
    if (source === undefined || source instanceof CircuitController) {
        return source?.gateGrid
    }
    else {
        return new OrganizedCircuit(source).unpack()
    }
}

export type GridSource = CircuitController | OrganizedCircuitContents | undefined
export type CompleteConditionSource = ConnectionValueSignalSet | undefined

export function parseDirections(directions?:string, symbols=Symbols) {
    if (directions === undefined) return undefined

    let newDirections = directions

    symbols.entries().forEach(([k, v]) => {
        newDirections = newDirections.replaceAll(`{${k}}`, v)
    })

    return newDirections
}
