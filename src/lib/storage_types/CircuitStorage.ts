import type { CircuitController } from "../circuit_types/CircuitController";
import { Buf, Gate, type GateType } from "../circuit_types/Gate";
import { Connection, GateGraph } from "../circuit_types/GateGraph";
import { GateGrid } from "../circuit_types/GateGrid";
import { parseStorage } from "./ParseStorage";

//controller for saving and loading circuits
//apparently svelte store is supposed to help me with this. 
//local storage isn't the best, but JSON parsing is, and both are less heavy then whatever svelte has cooking up so we're using that

//storage format:
/*
    [ 
      0:
        k:circuitName
        v:organizedCircuit
        
      1:
        k:circuitName
        v:organizedCircuit

        .
        .
        .
    ]
*/
export class CircuitStore {

    private grid:GateGrid
    private name:string

    private circuitStorage:Array<{k:string, v:OrganizedCircuit}>
    private storageKey = "CircuitStorage"

    constructor(
        circuitController:CircuitController,
        circuitName:string,
        storageKey:string | undefined = undefined
    ) {
        this.grid = circuitController.gateGrid
        this.name = circuitName

        this.storageKey = storageKey || this.storageKey

        this.circuitStorage = parseStorage(
            localStorage, this.storageKey,
            () => {return new Array<{k:string, v:OrganizedCircuit}>()}
        )
        this.commit()
    }

    private commit(storage = this.circuitStorage) {
        localStorage.setItem(this.storageKey, JSON.stringify(storage))
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
        this.setKey(this.name, organizedCircuit)
        console.log(this.circuitStorage)
        this.commit()

        return true
    }

    load(name:string | undefined, x=0, y=0) {
        if (name !== undefined) {
            this.name = name
        }

        let existing = this.getKey(this.name)
        if (existing === undefined) {
            console.log(this.name, " not found in storage")
            return false
        }

        existing = new OrganizedCircuit(existing)

        if (name !== undefined) {
            this.name = name
        }

        const newGrid = existing.unpack()
        if (newGrid === undefined) {
            return false
        }

        console.log(newGrid)
        const result = this.grid.addGrid(newGrid, x, y)
        console.log(this.grid)

        return result === 0
    }

    remove(s:string | undefined) {
        const has = this.getKey(s || "")
        if (has !== undefined) {
            this.removeKey(s || "")
            this.commit()
            console.log("bruh")
            return true
        }
        return false
    }

    private getKey(k:string) {
        for (let i = 0; i < this.circuitStorage.length; i++) {
            const pair = this.circuitStorage[i]
            if (pair.k == k) {
                const ret = pair.v
                return ret
            }
        }
        return undefined
    }

    private setKey(k:string, v:OrganizedCircuit) {
        for (let i = 0; i < this.circuitStorage.length; i++) {
            const pair = this.circuitStorage[i]
            if (pair.k == k) {
                const ret = pair.v
                pair.v = v
                return ret
            }
        }

        this.circuitStorage.push({k, v})
    }

    private removeKey(k:string) {
        for (let i = 0; i < this.circuitStorage.length; i++) {
            const pair = this.circuitStorage[i]
            if (pair.k == k) {
                const ret = pair.v
                this.circuitStorage = this.circuitStorage.splice(i, 1)
                return ret
            }
        }
        return undefined
    }

    keys() {
        let keys = new Array<string>(this.circuitStorage.length)
        for (let i = 0; i < keys.length; i++) {
            keys[i] = this.circuitStorage[i].k
        }
        return keys
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
        from:any
    ) {
        
        if (from instanceof GateGrid) {
            this.fromGrid(from)
        }
        else if (typeof(from) === "string") {
            this.fromString(from)
        }
        else {
            this.fromObject(from)
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
        this.fromObject(ob) 
    }

    fromObject(ob:any){
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