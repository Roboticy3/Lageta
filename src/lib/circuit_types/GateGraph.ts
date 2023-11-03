
import type { Gate } from "./Gate";
import type { GateGrid } from "./GateGrid";

export class GateGraph {
    inputs:Array<Array<Connection>> = []
    outputs:Array<Array<Connection>> = []
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
            let gate = this.getGate(g)
            if (gate === undefined) {
                continue
            }
            const gType = gate.type
            this.inputs[g] = new Array<Connection>(gType.sizeIn)
            this.outputs[g] = new Array<Connection>(gType.sizeOut)
            for (let i = 0; i < gType.sizeIn; i++) {
                this.inputs[g][i] = new Connection(gate, undefined)
            }
            for (let i = 0; i < gType.sizeOut; i++) {
                this.outputs[g][i] = new Connection(gate, undefined)
            }
        }
    }

    private getGate(i:number) {
        return this.gates[i]
    }

    addLink(from:number, output:number, to:number, input:number) {
        let inGate = this.gates[from]
        let toGate = this.gates[to]
        let inConnection = this.inputs[from]
        let outConnection = this.outputs[to]
        
        if (inGate === undefined || toGate === undefined ||
            inConnection === undefined || outConnection === undefined)
        {
            return undefined
        }

        inConnection[output].to = to
        outConnection[input].to = from
    }

    addGate() {
        const gate = this.gates[this.gates.length - 1]
        if (gate === undefined) {
            return undefined
        }
        const gType = gate.type

        this.inputs.push(new Array<Connection>(gType.sizeIn))
        this.outputs.push(new Array<Connection>(gType.sizeOut))
    }

    disconnectGate(id:number) {
        const gate = this.gates[id]
        if (gate === undefined) {
            return undefined
        }

        

        this.inputs[id] = []
        this.outputs[id] = []
    }

    iterConnections(iter:(g:Gate, t:string, j:number, c:Connection) => undefined) {
        for (let i = 0; i < this.gates.length; i++) {
            this.iterConnectionsOnGate(i, iter)
        }
    }

    iterConnectionsOnGate(id: number, iter:(g:Gate, t:string, j:number, c:Connection) => undefined) {
        const gate = this.gates[id]
        if (gate === undefined) {
            return
        }
        const inputs = this.inputs[id]
        const outputs = this.outputs[id]

        let type = "input"
        for (let j = 0; j < inputs.length; j++) {
            const input = inputs[id]
            iter(gate, type, j, input)
        }

        type = "output"
        for (let j = 0; j < outputs.length; j++) {
            const output = outputs[id]
            iter(gate, type, j, output)
        }
    }
}

export class Connection {
    gate:Gate
    to:number | undefined

    constructor(
        gate:Gate,
        to:number | undefined
    )
    {
        this.gate = gate
        this.to = to
    }
}


