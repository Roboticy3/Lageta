
import type { Gate } from "./Gate";
import type { GateGrid } from "./GateGrid";

export class GateGraph {
    inputs:Array<Array<Connection | undefined>> = []
    outputs:Array<Array<Connection | undefined>> = []
    gates:Array<Gate | undefined> = []

    constructor(grid?:GateGrid) {
        if (grid === undefined) {
            return
        }
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

    addConnection(c:Connection) {
        let inGate = this.gates[c.from]
        let toGate = this.gates[c.to]
        if (inGate === undefined || toGate === undefined)
        {
            return
        }

        const inConnection = this.inputs[c.to][c.input]
        const outConnection = this.outputs[c.from][c.output]
        this.removeConnection(inConnection)
        this.removeConnection(outConnection)

        this.addConnectionNoChecks(c)
    }

    private addConnectionNoChecks(c:Connection) {
        this.outputs[c.from][c.output] = c
        this.inputs[c.to][c.input] = c
    }

    removeConnection(c:Connection | undefined) {
        if (typeof c === "undefined") {
            return
        }

        this.outputs[c.from][c.output] = undefined
        this.inputs[c.to][c.input] = undefined
    }

    resetConnectionsAt(id:number) {

        let gate = this.getGate(id)
        if (gate === undefined) {
            return
        }
        const gType = gate.type
        
        this.inputs[id] = new Array<Connection | undefined>(gType.sizeIn)
        this.outputs[id] = new Array<Connection | undefined>(gType.sizeOut)
    }

    disconnectGate(id:number) {
        const gate = this.gates[id]
        if (gate === undefined) {
            return undefined
        }
        const gType = gate.type

        
        this.inputs[id] = []
        this.outputs[id] = []
    }

    iterConnections(iter:ConnectionReader, type:ConnectionType="") {
        for (let i = 0; i < this.gates.length; i++) {
            this.iterConnectionsOnGate(i, iter, type)
        }
    }

    iterConnectionsOnGate(id: number, iter:ConnectionReader, type:ConnectionType="") {
        const gate = this.gates[id]
        if (gate === undefined) {
            return
        }
        const inputs = this.inputs[id]
        const outputs = this.outputs[id]

        if (type === "" || type === "Input") {for (let j = 0; j < inputs.length; j++) {
            const input = inputs[j]
            iter(gate, "Input", j, input)
        }}

        if (type === "" || type === "Output") {for (let j = 0; j < outputs.length; j++) {
            const output = outputs[j]
            iter(gate, "Output", j, output)
        }}
    }
}

export class Connection {
    from:number
    output:number
    to:number
    input:number

    constructor(
        from:number, 
        output:number, 
        to:number, 
        input:number
    )
    {
        this.from = from
        this.output = output
        this.to = to
        this.input = input
    }
}

export type ConnectionType = ""|"Input"|"Output"

export type ConnectionReader = (g:Gate, t:string, j:number, c:Connection | undefined) => undefined


