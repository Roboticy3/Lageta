import { CircuitController } from "$lib/circuit_types/CircuitController"
import { GateTypeController } from "$lib/circuit_types/GateType";
import { TruthTable } from "$lib/circuit_types/TruthTable";
import { Symbols, TruthTableMacro } from "$lib/dat/Symbols/Symbols";
import { ConnectionValueSignalSet, SignalSet } from "$lib/signal_types/Signal"
import { OrganizedCircuit, type OrganizedCircuitContents } from "$lib/storage_types/CircuitStorage"

export type GameViewParameters = {

    //The name of the circuit
    name?:string

    //The text shown to the player when they enter a GameView
    //directions automatically are concatenated with the truth table of completeCondition?.solver
    directions?:string
    //The text shown to the player when they spend a hint token in a GameView
    hint?: string;

    //The circuit loaded into this GameView if CircuitStorage can't find an existing circuit under name
    grid?:GridSource
    //The place where this GameView will look for existing circuits
    storageKey?:string
    //whether the circuit made in this GameView should be saved to CircuitStorage. Set to false for levels that are randomly generated
    serializable?:boolean

    //The signal that must be satisfied to complete this GameView
    completeCondition?:CompleteConditionSource
    //visual solver override. Used to make the truth table in a level's directions different from the actual solver's truth table
    solverOverride?:string | GateTypeController

    //The gates, levels, and tools awarded to the player on completion, listed by name
    completeRewards?:string[]

    //Whether this GameView should respect the player's current progress, or give them access to all loaded GateTypes
    allUnlocks?:boolean

    //extra parameters to send to the GameView, can toggle things like whether gates can be moved or connection point can be seen
    editorParams?:Object
    rendererParams?:Object

    
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

export type DirectionsProperties = {
    truthTable?:TruthTable,
}

export function parseDirections(directions?:string, symbols=Symbols, truthTableMacro=TruthTableMacro): (string | DirectionsProperties)[] | undefined {
    if (directions === undefined) return undefined

    let newDirections:(string | DirectionsProperties)[] = [directions]

    //after processing the basic replacements, look for truth table macros
    const execArray = TruthTableMacro.exec(directions)
    //the truth table parameters are captured by the first group of the macro, so extract that, then construct and return a truth table
    
    if (execArray) {
        const capture = execArray[1]
        //extracting the truth table data involves the ever-error-prone JSON.parse, so catch the error and display a suitably polite message
        try {
        const truthTableParams = capture ? JSON.parse(capture):undefined
        newDirections = [
            directions.slice(0, execArray.index), 
            {truthTable:new TruthTable(truthTableParams)}, 
            directions.slice(execArray.index + execArray[0].length)
        ]
        } catch (e) {
            newDirections = [
                directions.slice(0, execArray.index), 
                `--Error: could not parse ${capture} due to ${e}. Apologies.`,
                directions.slice(execArray.index + execArray[0].length)
            ]
        }
    }

    newDirections.forEach((d, i) => {
        if (typeof d === "string") {
            let dString = d
            symbols.entries().forEach(([k, v]) => {
                dString = dString.replaceAll(`{${k}}`, v)
            })
            newDirections[i] = dString
            
        }
    })
    

    return newDirections
}
