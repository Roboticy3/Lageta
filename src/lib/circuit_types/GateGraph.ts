
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

    mergeConnection(a:Connection, b:Connection, overrideFrom=false) {
        if (overrideFrom) {
            const af = a.from
            const bf = b.from
            this.inputs[af[0]][af[1]] = undefined
            a.from = bf
            this.inputs[bf[0]][bf[1]] = undefined
        }

        const ato = a.to
        const bto = b.to
        for (let i = 0; i < bto.length; i++) {
            const to = bto[i]
            const indexOf = ato.indexOf(to)
            if (indexOf === -1) {
                ato.push(to)
                this.setInput(to, a)
            }
        }
    }

    addConnection(c:Connection) {
        if (!this.verifyConnection(c)) {
            return
        }

        const outConnection = this.outputs[c.from[0]][c.from[1]]
        if (outConnection !== undefined) {
            this.mergeConnection(outConnection, c)
            return
        }

        const to = c.to
        const inputs = this.inputs
        for (let i = 0; i < to.length; i++) {
            this.removeInput(to[i])
        }

        this.addConnectionNoChecks(c)
    }

    private addConnectionNoChecks(c:Connection) {
        const from = c.from
        this.setOutput(from, c)
        
        const to = c.to
        for (let i = 0; i < to.length; i++) {
            this.setInput(to[i], c)
        }
    }

    removeInput(a:[number, number]) {
        const c = this.getInput(a)
        if (c === undefined) {
            return
        }
        const to = c.to
        let i = 0
        for (; i < to.length; i++) {
            if (to[i][0] === a[0] && to[i][1] === a[1])  {
                break
            }
        }
        if (i === to.length) {
            return
        }
        to.splice(i, 1)
        this.setInput(a, undefined)

        if (to.length === 0) {
            this.setOutput(c.from, undefined)
        }
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
}

export type ConnectionType = ""|"Input"|"Output"

export type ConnectionReader = (from:Gate, output:number, to:Gate, input:number, c:Connection) => any

export type ConnectionPointReader = (gate:Gate, type:ConnectionType, point:number) => any
