import { Gate, createGate, type GateState } from "$lib/circuit_types/Gate";
import { GateType, GateTypeController } from "$lib/circuit_types/GateType";
import { Buf, all_gates, getGateType } from "$lib/dat/GateTypes/GateTypes";
import type { CircuitController } from "../circuit_types/CircuitController";
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
export class CircuitStorage {

    private grid:GateGrid | undefined = undefined
    private name:string

    private circuitStorage:Array<{k:string, v:OrganizedCircuitContents}>
    private storageKey = "CircuitStorage"

    constructor(
        circuitName:string,
        circuitController:CircuitController | undefined = undefined,
        storageKey:string | undefined = undefined,
    ) {
        this.name = circuitName
        this.grid = circuitController?.gateGrid
        this.storageKey = storageKey || this.storageKey

        this.circuitStorage = parseStorage(
            localStorage, this.storageKey,
            () => {return new Array<{k:string, v:OrganizedCircuitContents}>()}
        )
    }

    private commit(storage = this.circuitStorage) {
        localStorage.setItem(this.storageKey, JSON.stringify(storage))
    }

    getGrid() {
        return this.grid
    }

    save(name?:string, compressIdSpace=true) {
        if (this.grid === undefined) {
            return "No Grid"
        }
        
        if (name !== undefined) {
            this.name = name
        }

        if (this.grid.gates.length === 0) {
            return "Grid Is Empty"
        }

        const organizedCircuit = new OrganizedCircuit(this.grid, compressIdSpace)
        this.setKey(this.name, organizedCircuit.pack())
        this.commit()

        return "Ok"
    }

    load(name?:string, x=0, y=0, inPlaceGraphMerge=false) {
        const newGridResult = this.loadNew(name || this.name)
        if (!(newGridResult instanceof GateGrid)) {
            return newGridResult
        }
        const newGrid = newGridResult

        if (this.grid === undefined) {
            this.grid = newGrid

            return "Ok"
        }

        if (inPlaceGraphMerge) {
            this.grid.graph.mergeGraph(newGrid.graph)

            return "Ok"
        }
        else {
            const result = this.grid.addGrid(newGrid, x, y)
            return result
        }
    }

    loadNew(name?:string) {
        if (name !== undefined) {
            this.name = name
        }

        let existing = this.getKey(this.name)
        if (existing === undefined) {
            return "Grid Not Found In Storage"
        }

        let circuit = new OrganizedCircuit(existing)

        const newGrid = circuit.unpack()
        if (newGrid === undefined) {
            return "Grid Failed To Unpack"
        }

        return newGrid
    }

    remove(s:string | undefined) {
        const has = this.getKey(s || "")
        if (has !== undefined) {
            this.removeKey(s || "")
            this.commit()
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

    private setKey(k:string, v:OrganizedCircuitContents) {
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
                this.circuitStorage.splice(i, 1)
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

export class OrganizedCircuit {
    gateTypes:Array<string> = []
    gates:Array<SerializableGate | undefined> = []
    connections:Array<Connection> = []
    //the size of the circuit in grid squares
    size:[number, number] = [15, 15]
    //the amount the gates have to be shifted by to land in the corner when loaded
    offset:[number, number] = [0, 0]

    constructor(
        from:GateGrid | string | OrganizedCircuitContents,
        compressIdSpace=true
    ) {
        
        if (from instanceof GateGrid) {
            this.fromGrid(from, compressIdSpace)
        }
        else if (typeof(from) === "string") {
            this.fromString(from)
        }
        else {
            this.fromObject(from)
        }
    }

    fromGrid(grid:GateGrid, compressIdSpace=true, trim=false) {
        let types = new Set<string>()

        this.gates = []
        let indexMap = new Map<number, number>()

        for (let i = 0; i < grid.gates.length; i++) {
            const g = grid.gates[i]
            if (g === undefined) {
                if (!compressIdSpace) this.gates.push(undefined)
                continue
            }
            const gType = g.type
            types.add(gType.name)

            const compressedId = this.gates.length
            indexMap.set(g.id, compressedId)
            this.gates.push(new SerializableGate(g.x, g.y, compressedId, gType.name))
        }

        if (trim) this.setDimensionsFromGridTrimmed(grid)
        else {
            this.size = [grid.sizeX, grid.sizeY]
            this.offset = [0, 0]
        }

        const graph = grid.graph
        let connections = new Array<Connection>()
        graph.iterConnections((_g, _o, _t, _i, c) => {
            const newC = new Connection(c.from[0], c.from[1], -1, -1)
            newC.to = new Array<[number, number]>(c.to.length)
            for (let i = 0; i < c.to.length; i++) {
                newC.to[i] = [c.to[i][0], c.to[i][1]]
            }
            connections.push(newC)
        })

        this.gateTypes = [...types.keys()]
        this.connections = connections
    }

    setDimensionsFromGridTrimmed(grid:GateGrid) {
        this.offset = [Infinity, Infinity]
        this.size = [0, 0]
        
        grid.iterGates((g) => {
            this.offset[0] = Math.min(this.offset[0], g.x || 0)
            this.offset[1] = Math.min(this.offset[1], g.y || 0)

            const gType = g.type
            this.size[0] = Math.max(this.size[0], (g.x || 0) + gType.gridWidth)
            this.size[1] = Math.max(this.size[1], (g.y || 0) + gType.gridHeight)
        })
        
        this.size[0] -= this.offset[0]
        this.size[1] -= this.offset[1]
    }

    fromString(string:string) {
        const ob = JSON.parse(string)
        this.fromObject(ob) 
    }

    //there literally has to be a better way to do this but I have no idea how TypeScript works so oh well
    fromObject(ob:OrganizedCircuitContents){
        this.gateTypes = ob.gateTypes?.map((v) => typeof v === "string" ? v:v.model.name)|| this.gateTypes
        this.gates = ob.gates || this.gates
        this.connections = ob.connections || this.connections
        this.size = ob.size || this.size
        this.offset = ob.offset || this.offset
    }

    unpack() {
        const graph = new GateGraph()
        const grid = new GateGrid(graph, this.size[0], this.size[1])

        let types = new Set<string>()
        for (let i = 0; i < this.gateTypes.length; i++) {
            const t = this.gateTypes[i]
            types.add(t)
        }

        grid.gates = new Array<Gate | undefined>(this.gates.length)

        const offset = this.offset
        this.iterGates((g) => {
            const nG = this.unpackGate(g)
            nG.givePos(g.x - offset[0], g.y - offset[1]) 
            grid.addGateExisting(nG)
        })

        graph.fromGrid(grid)

        this.connections.forEach((c) => graph.addConnection(c))
        return grid
    }

    pack() {
        const packed = {
            gates:this.gates,
            gateTypes:this.gateTypes,
            connections:this.connections,
            size:this.size,
            offset:this.offset
        }
        return packed
    }

    iterGates(iter:(g:SerializableGate) => void) {
        const gates = this.gates
        for (let i = 0; i < gates.length; i++) {
            const g = gates[i]
            if (!g) {
                continue
            }
            iter(g)
        }
    }

    unpackGate(g:SerializableGate) {
        const type = all_gates.get(g.type) || getGateType(Buf)
        let nG = createGate(type)
        nG.givePos(g.x, g.y) 
        nG.giveId(g.id)
        return nG
    }
}

export type OrganizedCircuitContents = {
    gateTypes?:Array<string | GateTypeController>
    gates?:Array<SerializableGate | undefined>
    connections?:Array<Connection>
    size?:[number, number]
    offset?:[number, number]
}

//gate with no type reference, since types are serialized separately
export class SerializableGate {
    x:number
    y:number
    id:number
    type:string
    constructor(
        x:number,
        y:number,
        id:number,
        type:string
    ) {
        this.x = x
        this.y = y
        this.id = id
        this.type = type
    }
}