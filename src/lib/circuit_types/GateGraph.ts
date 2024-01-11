
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
    mergeConnection(a:Connection, b:Connection):CircuitResolutionResult {
        const fromGate = this.gates[a.from[0]]
        if (fromGate === undefined) {
            return Stupid
        }

        const ato = a.to
        const bto = b.to
        let temp = a.copy()
        this.setOutput(a.from, b)
        for (let i = 0; i < ato.length; i++) {
            const toi = ato[i]
            const indexOf = this.findInput(b, toi)
            if (indexOf === -1) {
                this.removeInput(toi)
                this.setInput(toi, b)
            }
            else {
                bto.push(toi)
                this.setInput(toi, b)
            }
        }

        this.resolveInputsFrom(fromGate)

        return {
            error:"",
            result:[],
            exitDepth:0
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

        //check if a connection already exists at the output point
        //if so, merge with the existing connection
        const outConnection = this.outputs[c.from[0]][c.from[1]]
        if (outConnection !== undefined) {
            return this.mergeConnection(outConnection, c)
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

        this.resolveInputsTo(fromGate)
        this.resolveInputsFrom(fromGate)

        for (let i = 0; i < to.length; i++) {
            this.setInput(to[i], c)
        }

        return {error:"", result:[], exitDepth:0}
    }

    private addConnectionPropogate(c:Connection) {
        const from = c.from
        let fromGate = this.gates[from[0]]
        if (fromGate === undefined) {
            return Stupid
        }

        //propagate the connection backwards
        const result = this.resolveInputsTo(fromGate)
        fromGate.override = result.result

        if (result.error !== "") {
            console.log("Shit! ",result)
            return result
        }

        const output = fromGate.execute()
        const to = c.to
        for (let toi of to) {
            let toGate = this.gates[toi[0]]
            if (toGate === undefined) {
                continue
            }
            toGate.override[toi[1]] = output[c.from[1]]
            const result = this.resolveInputsFrom(toGate, -1)
            if (result.error === "") {
                return result
            }
        }

        this.clearResolved()
        return result
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
            this.clearResolved()
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
        this.clearResolved()
        return true
    }

    /**
     * Keep a set of gates that resolveInputsTo and resolveInputsFrom have already seen
     */
    gatesResolved = new Set<Gate>()
    private checkCycleStep(gate:Gate, depth:number) {
        if (this.gatesResolved.has(gate)) {
            this.gatesResolved.clear()
            return true
        }
        else if (depth >= 0) {
            this.gatesResolved.add(gate)
        }
        return false
    }

    private clearResolved() {
        this.gatesResolved.clear()
    }

    /**
     * find the input array for a given gate
     * recursively sorts through every gate connected to the given one
     * @param id 
     */
    private resolveInputsTo(gate:Gate, depth:number=0): CircuitResolutionResult {
        console.log("resolving to ", gate)
        if (this.checkCycleStep(gate, depth)) {
            return {
                error:"Cycle",
                result:[],
                exitDepth:depth
            }
        }
        const gType = gate.type

        let result = {
            error:"",
            result:gate.override,
            exitDepth:depth
        } as CircuitResolutionResult

        //loop through each input and check for a valid connection
        for (let i = 0; i < gType.sizeIn; i++) {
            const nextResult = this.resolveInputTo(gate, i, depth)
            if (nextResult.error !== "") {
                return nextResult
            }
        }

        return result
    }

    private resolveInputTo(gate:Gate, inputIndex:number, depth:number=0): CircuitResolutionResult {
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

    private resolveInputsFrom(gate:Gate, depth:number=0): CircuitResolutionResult {
        console.log("resolving from ", gate)
        if (this.checkCycleStep(gate, depth)) {
            return {
                error:"Cycle",
                result:gate.override,
                exitDepth:depth
            }
        }
        const gType = gate.type

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
                const result = this.resolveInputsFrom(toGate, depth - 1)
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
