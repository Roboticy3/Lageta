
import { Flow, type ConnectionValue, type Gate } from "./Gate";
import type { GateGrid } from "./GateGrid";

export class GateGraph {
    inputs:Array<Array<Connection | undefined>> = []
    outputs:Array<Array<Connection | undefined>> = []
    gates:Array<Gate | undefined> = []

    constructor(grid?:GateGrid) {
        if (grid === undefined) {
            return
        }
        this.fromGrid(grid)
    }

    fromGrid(grid:GateGrid) {     
        this.gates = grid.gates

        let gateCount = grid.gates.length
        this.inputs = new Array(gateCount)
        this.outputs = new Array(gateCount)

        for (let g = 0; g < gateCount; g++) {
            this.resetConnectionsAt(g)    
        }
    }

    getGate(i:number) {
        return this.gates[i]
    }

    setOutput(a:[number, number], c:Connection | undefined) {
        this.outputs[a[0]][a[1]] = c
    }

    getOutput(a:[number, number]) {
        return this.outputs[a[0]][a[1]]
    }

    setInput(a:[number, number], c:Connection | undefined) {
        this.inputs[a[0]][a[1]] = c
    }

    getInput(a:[number, number]) {
        return this.inputs[a[0]][a[1]]
    }

    verifyConnection(c:Connection) {
        const outGate = this.gates[c.from[0]]
        if (outGate === undefined || c.from[1] > outGate.type.sizeOut )
        {
            return false
        }
        const to = c.to
        for (let i = 0; i < to.length; i++) {
            const toGate = this.gates[to[i][0]]
            if (toGate === undefined || to[i][1] > toGate.type.sizeIn) {
                return false
            }
        }

        return true
    }

    /**
     * Merge connection a with connection b, and replace connection a with connection b
     * Updates the circuit. If there is an error, the merge is undone by storing a copy of a, removing b, and then adding the copy back into the circuit
     * @param a 
     * @param b 
     * @returns 
     */
    mergeConnection(a:Connection, b:Connection) {
        const ato = a.to
        const bto = b.to
        for (let i = 0; i < bto.length; i++) {
            const toi = bto[i]
            const indexOf = this.findInput(a, toi)
            if (indexOf === -1) {
                ato.push(toi)
                this.removeInput(toi)
                this.setInput(toi, a)
            }
        }
    }

    /**
     * Add a connection to the circuit
     * Updates the circuit. If there is an error, it's either handled in mergeConnection or the connection is simply removed
     * @param c 
     * @returns 
     */
    addConnection(c:Connection): CircuitResolutionResult {
        //check that the connection points to valid gates
        if (!this.verifyConnection(c)) {
            return Corrupted
        }

        const cycleCheck = this.addConnectionPropogate(c)

        //check if a connection already exists at the output point
        //if so, merge with the existing connection
        const outConnection = this.outputs[c.from[0]][c.from[1]]
        if (outConnection !== undefined) {
            this.mergeConnection(outConnection, c)
            return cycleCheck
        }

        //otherwise, add the connection
        const result = this.addConnectionNoChecks(c)
        return result
    }

    private addConnectionNoChecks(c:Connection):CircuitResolutionResult {

        const to = c.to
        for (let i = 0; i < to.length; i++) {
            this.removeInput(to[i])
        }

        const from = c.from
        this.setOutput(from, c)

        let fromGate = this.gates[from[0]]
        if (fromGate === undefined) {
            return Stupid
        }

        //this.resolveInputsTo(fromGate)
        //this.resolveInputsFrom(fromGate)

        for (let i = 0; i < to.length; i++) {
            this.setInput(to[i], c)
        }

        return {error:"", result:[], exitDepth:0}
    }

    private addConnectionPropogate(c:Connection): CircuitResolutionResult {
        let fromGate = this.gates[c.from[0]]
        if (fromGate === undefined) {
            return Corrupted
        }

        let cycleTarget = new Set<Gate>()
        const to = c.to
        for (let i = 0; i < to.length; i++) {
            let toGate = this.gates[to[i][0]]
            if (toGate === undefined) continue

            cycleTarget.add(toGate)
        }

        const backResult = this.resolveInputsTo(fromGate)
        if (backResult.error !== "") {
            return backResult
        }
        fromGate.override = backResult.result
        const output = fromGate.execute()[c.from[1]]

        cycleTarget = new Set<Gate>([fromGate])

        for (let i = 0; i < to.length; i++) {
            let toGate = this.gates[to[i][0]]
            if (toGate === undefined) continue

            toGate.override[to[i][1]] = output
            const forwardResultI = this.resolveInputsFrom(toGate)
            if (forwardResultI.error !== "") {
                return forwardResultI
            }
        }

        return {
            error:"",
            result:fromGate.override,
            exitDepth:0
        }
    }

    removeInput(a:[number, number]) {
        const c = this.getInput(a)
        if (c === undefined) {
            return
        }
        const to = c.to
        const i = this.findInput(c, a)
        if (i === -1) {
            return
        }
        const result = to.splice(i, 1)[0]
        this.setInput(a, undefined)

        if (to.length === 0) {
            this.setOutput(c.from, undefined)
        }

        let gate = this.gates[a[0]]
        if (gate !== undefined) {
            gate.override[a[1]] = undefined
            this.resolveInputsFrom(gate)
        }

        return result
    }

    removeOutput(c:Connection) {
        const to = c.to
        for (let i = 0; i < to.length; i++) {
            this.removeInput(to[i])
        }
    }

    resetConnectionsAt(id:number) {

        let gate = this.getGate(id)
        let sizeIn = 0
        let sizeOut = 0
        if (gate !== undefined) {
            const gType = gate.type
            sizeIn = gType.sizeIn
            sizeOut = gType.sizeOut
        }
        
        this.inputs[id] = new Array<Connection | undefined>(sizeIn)
        this.outputs[id] = new Array<Connection | undefined>(sizeOut)
    }

    disconnectGate(gateId:number) {
        const inputs = this.inputs[gateId]
        const outputs = this.outputs[gateId]

        for (let i = 0; i < outputs.length; i++) {
            const c = outputs[i]
            if (c === undefined) {
                continue
            }
            this.removeOutput(c)
        }

        for (let i = 0; i < inputs.length; i++) {
            this.removeInput([gateId, i])
        }

        this.inputs[gateId] = []
        this.outputs[gateId] =[]
    }

    iterConnections(iter:ConnectionReader) {
        for (let i = 0; i < this.gates.length; i++) {
            const gate = this.gates[i]
            if (gate === undefined) {
                continue
            }

            const outputs = this.outputs[i]
            for (let j = 0; j < outputs.length; j++) {
                const c = outputs[j]
                if (c === undefined) {
                    continue
                }

                const to = c.to
                for (let k = 0; k < to.length; k++) {
                    const tok = to[k]
                    const toGate = this.gates[tok[0]]
                    if (toGate === undefined) {
                        console.log("there should be a gate here!", tok[0])
                        continue
                    }
                    const input = tok[1]

                    if (iter (gate, j, toGate, input, c)) {
                        break
                    }
                }
            }
        }
    }

    iterConnectionPoints(iter:ConnectionPointReader, type:ConnectionType) {
        const gates = this.gates
        for (let i = 0; i < gates.length; i++) {
            const gate = gates[i]
            if (gate === undefined) {
                continue
            }
            const gType = gate.type
            const inputs = this.inputs
            const outputs = this.outputs

            if (type === "" || type === "Input") {for (let j = 0; j < gType.sizeIn; j++) {
                if (iter(gate, "Input", j)) {
                    break
                }
            }}
            if (type === "" || type === "Output") {for (let j = 0; j < gType.sizeOut; j++) {
                if (iter(gate, "Output", j)) {
                    break
                }
            }}
        }
    }

    //add a new graph onto the end of this one
    //after calling this function, the gates array needs to be updated separately since it shares a reference with a grid
    concatGraph(graph:GateGraph) {
        graph.iterConnections((_f, _o, _t, _i, c) => {
            c.from[0] += this.gates.length
            const to = c.to
            for (let i = 0; i < to.length; i++) {
                to[i][0] += this.gates.length
            }
        })

        this.inputs = this.inputs.concat(graph.inputs)
        this.outputs = this.outputs.concat(graph.outputs)
    }

    private findInput(c:Connection, input:[number, number]) {
        const to = c.to
        let i = to.length - 1
        for (; i > -1; i--) {
            if (to[i][0] === input[0] && to[i][1] === input[1])  {
                break
            }
        }
        return i
    }

    setFlow(index:[number, number], val:boolean) {
        const gate = this.gates[index[0]]
        if (!(gate instanceof Flow)) {
            return false
        }
        gate.override[index[1]] = val
        this.resolveInputsFrom(gate)
        return true
    }

    /**
     * find the input array for a given gate
     * recursively sorts through every gate connected to the given one
     * @param id 
     */
    private resolveInputsTo(
        gate:Gate, 
        cycleCheck:Set<Gate> = new Set<Gate>(), 
        depth:number=0
    ): CircuitResolutionResult {
        console.log("resolving to ", gate)
        const gType = gate.type

        if (cycleCheck.has(gate)) {
            return {
                error:"Cycle",
                result:[],
                exitDepth:depth
            }
        }

        let result = {
            error:"",
            result:gate.override,
            exitDepth:depth
        } as CircuitResolutionResult

        //loop through each input and check for a valid connection
        for (let i = 0; i < gType.sizeIn; i++) {
            const nextResult = this.resolveInputTo(gate, i, cycleCheck, depth)
            if (nextResult.error !== "") {
                return nextResult
            }
        }

        return result
    }

    private resolveInputTo(
        gate:Gate, 
        inputIndex:number, 
        cycleCheck:Set<Gate> = new Set<Gate>(),
        depth:number=0
    ): CircuitResolutionResult {
        if (gate.override[inputIndex] !== undefined) {
            return {
                error:"",
                result:gate.override,
                exitDepth:depth
            }
        }
        const c = this.inputs[gate.id][inputIndex]
        if (c === undefined) {
            gate.override[inputIndex] = undefined
            return {
                error:"",
                result:gate.override,
                exitDepth:depth
            }
        }

        const from = c.from
        const newGate = this.gates[from[0]]
        if (newGate === undefined) {
            gate.override[inputIndex] = undefined
            return {
                error:"",
                result:gate.override,
                exitDepth:depth
            }
        }
        
        const result = this.resolveInputsTo(
            newGate,
            cycleCheck, 
            depth + 1
        )
        const output = newGate.execute(result.result)
        
        gate.override[inputIndex] = output[from[1]]
        return result
    }

    resetInputsAt(gate:Gate) {
        if (gate instanceof Flow) {
            return
        }
        gate.reset()
    }

    resetInputs() {
        for (let i = 0; i < this.gates.length; i++) {
            const gate  = this.gates[i]
            if (gate !== undefined) {
                this.resetInputsAt(gate)
            }
        }
    }

    private resolveInputsFrom(
        gate:Gate, 
        cycleCheck:Set<Gate> = new Set<Gate>(), 
        depth:number=0
    ): CircuitResolutionResult {
        console.log("resolving from ", gate)
        const gType = gate.type

        if (cycleCheck.has(gate)) {
            return {
                error:"Cycle",
                result:[],
                exitDepth:depth
            }
        }

        let outputs = gate.execute()

        for (let i = 0; i < gType.sizeOut; i++) {
            const c = this.outputs[gate.id][i]
            if (c === undefined) {
                continue
            }
            const to = c.to
            for (let j = 0; j < to.length; j++) {
                const toj = to[j]
                const toGate = this.gates[toj[0]]
                if (toGate === undefined) {
                    continue
                }
                toGate.override[toj[1]] = outputs[c.from[1]]
                const result = this.resolveInputsFrom(toGate, cycleCheck, depth - 1)
                if (result.error !== "") {
                    return result
                }
            }
        }

        return {
            error:"",
            result:gate.override,
            exitDepth:depth
        }
    }
}

export class Connection {
    from:[number, number]

    to:Array<[number, number]>

    constructor(
        from:number, 
        output:number, 
        to:number, 
        input:number
    )
    {
        this.from = [from, output]
        this.to = [[to, input]]
    }

    copy() {
        let newC = new Connection(
            this.from[0], this.from[1],
            0, 0
        )

        newC.to = this.to.map((v, i) => {
            return v
        })
        return newC
    }
}

export type ConnectionType = ""|"Input"|"Output"

export type ConnectionReader = (from:Gate, output:number, to:Gate, input:number, c:Connection) => any

export type ConnectionPointReader = (gate:Gate, type:ConnectionType, point:number) => any

export type CircuitResolutionResult = {
    error:""|"Cycle"|"Corrupted"|"Stupid", 
    result:Array<ConnectionValue>, 
    exitDepth:number
}

//if a gate is undefined at an index that was already checked by verifyConnection, it's Stupid.
//I will not be writing a handler for these, they will cause bugs if they dislike me and know their place otherwise
const Stupid:CircuitResolutionResult = {
    error:"Stupid",
    result:[],
    exitDepth:0
}

const Corrupted:CircuitResolutionResult = {
    error:"Corrupted",
    result:[],
    exitDepth:0
}
