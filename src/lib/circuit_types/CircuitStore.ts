import type { CircuitController } from "./CircuitController";
import { Buf, Gate, type GateType } from "./Gate";
import { Connection, GateGraph } from "./GateGraph";
import { GateGrid } from "./GateGrid";

//controller for saving and loading circuits
//apparently svelte store is supposed to help me with this. 
//local storage isn't the best, but JSON parsing is, and both are less heavy then whatever svelte has cooking up so we're using that
export class CircuitStore {

    private grid:GateGrid
    private name:string

    constructor(
        circuitController:CircuitController,
        circuitName:string
    ) {
        this.grid = circuitController.gateGrid
        this.name = circuitName
    }

    save(name:string | undefined) {
        if (name !== undefined) {
            this.name = name
        }

        if (this.grid.gates.length === 0) {
            console.log("circuit is empty!")
            return false
        }

        const organizedCircuit = new OrganizedCircuit(this.grid)
        localStorage.setItem(this.name, JSON.stringify(organizedCircuit))

        return true
    }

    load(name:string | undefined, x=0, y=0) {
        if (name !== undefined) {
            this.name = name
        }

        const existing = localStorage.getItem(this.name)
        if (existing === null) {
            console.log(this.name, " not found in storage")
            return false
        }

        if (name !== undefined) {
            this.name = name
        }

        const organizedCircuit = new OrganizedCircuit(existing)
        const newGrid = organizedCircuit.unpack()
        if (newGrid === undefined) {
            return false
        }

        console.log(newGrid)
        const result = this.grid.addGrid(newGrid, x, y)
        console.log(this.grid)

        return result === 0
    }

    remove(s:string | undefined) {
        const has = localStorage.getItem(s || "")
        if (has !== null) {
            localStorage.removeItem(s || "")
            return true
        }
        return false
    }
}

class OrganizedCircuit {
    gateTypes:Array<GateType> = []
    gates:Array<SerializableGate> = []
    connections:Array<Connection> = []
    //the size of the circuit in grid squares
    size:[number, number] = [0, 0]
    //the amount the gates have to be shifted by to land in the corner when loaded
    offset:[number, number] = [0, 0]

    constructor(
        from:GateGrid | string
    ) {
        
        if (from instanceof GateGrid) {
            this.fromGrid(from)
        }
        else {
            this.fromString(from)
        }
    }

    fromGrid(grid:GateGrid) {
        let types = new Map<string, GateType>()

        this.gates = new Array<SerializableGate>(0)
        let indexMap = new Map<number, number>()

        this.offset = [Infinity, Infinity]
        this.size = [0, 0]
        
        grid.iterGates((g) => {
            const gType = g.type
            if (!types.has(gType.name)) {
                types.set(gType.name, gType)
            }

            indexMap.set(g.id || 0, this.gates.length)
            g.id = this.gates.length
            this.gates.push(new SerializableGate(g, gType.name))

            this.offset[0] = Math.min(this.offset[0], g.x || 0)
            this.offset[1] = Math.min(this.offset[1], g.y || 0)
            this.size[0] = Math.max(this.size[0], (g.x || 0) + gType.gridWidth)
            this.size[1] = Math.max(this.size[1], (g.y || 0) + gType.gridHeight)
        })
        
        this.size[0] -= this.offset[0]
        this.size[1] -= this.offset[1]

        const graph = grid.graph
        let connections = new Set<Connection>()
        graph.iterConnections((_g, _o, _t, _i, c) => {
            connections.add(c)
            c.from[0] = indexMap.get(c.from[0]) || 0
            c.from[1] = indexMap.get(c.from[1]) || 0
            
            const to = c.to
            for (let i = 0; i < to.length; i++) {
                const toi = to[i]
                toi[0] = indexMap.get(toi[0]) || 0
                toi[1] = indexMap.get(toi[1]) || 0
            }
        })

        this.gateTypes = [...types.values()]
        this.connections = [...connections.values()]
    }

    fromString(string:string) {
        const ob = JSON.parse(string)
        try {
            this.gateTypes = ob.gateTypes as Array<GateType>
            this.gates = ob.gates as Array<SerializableGate>
            this.connections = ob.connections as Array<Connection>
            this.size = ob.size as [number, number]
            this.offset = ob.offset as [number, number]
        } catch (e) {
            console.log("failed to load", ob, "into as a circuit!")
        }  
    }

    unpack() {
        const graph = new GateGraph()
        const grid = new GateGrid(graph, this.size[0], this.size[1])

        let types = new Map<string, GateType>()
        for (let i = 0; i < this.gateTypes.length; i++) {
            const t = this.gateTypes[i]
            types.set(t.name, t)
        }

        grid.gates = new Array<Gate | undefined>(this.gates.length)

        const offset = this.offset
        this.iterGates((g) => {
            const nG = new Gate(types.get(g.type) || Buf)
            nG.givePos(g.x - offset[0], g.y - offset[1]) 
            nG.giveId(g.id) 
            grid.addGateExisting(nG)
        })

        graph.fromGrid(grid)

        for (let i = 0; i < this.connections.length; i++) {
            const c = this.connections[i]
            graph.setOutput(c.from, c)
            const to = c.to
            for (let j = 0; j < to.length; j++) {
                graph.setInput(to[j], c)
            }
        }

        console.log(this)
        return grid
    }

    iterGates(iter:(g:SerializableGate) => void) {
        const gates = this.gates
        for (let i = 0; i < gates.length; i++) {
            const g = gates[i]
            if (g === null) {
                continue
            }
            iter(g)
        }
    }
}

//gate with no type reference, since types are serialized separately
class SerializableGate {
    x:number
    y:number
    id:number
    type:string
    constructor(
        gate:Gate,
        type:string
    ) {
        this.x = gate.x || 0
        this.y = gate.y || 0
        this.id = gate.id || 0
        this.type = type
    }
}