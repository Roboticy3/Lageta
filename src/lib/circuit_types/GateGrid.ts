import type { Gate } from "./Gate"
import { Buf } from "./Gate"
import type { GateGraph } from "./GateGraph"

export class GateGrid {

    graph:GateGraph

    constructor(graph:GateGraph, sizeX:number | undefined = undefined, sizeY:number | undefined = undefined) {
        this.graph = graph
        this.gates = graph.gates

        this.sizeX = sizeX || this.sizeX
        this.sizeY = sizeY || this.sizeY
        this.grid = new Array<number | undefined>(this.sizeX * this.sizeY)
    }

    sizeX = 40
    sizeY = 40

    clampIndex(gate:Gate, x:number, y:number) {
        const gType = gate.type
        return [
            Math.max(Math.min(x, this.sizeX - gType.gridWidth), 0),
            Math.max(Math.min(y, this.sizeY - gType.gridHeight), 0)
        ]
    }

    cellOffset = 30

    offsetToIndex(offsetX:number, offsetY:number) {
        const x = Math.floor(offsetX / this.cellOffset)
        const y = Math.floor(offsetY / this.cellOffset)
        return [x, y]
    }

    indexToOffset(x:number, y:number) {
        return [this.cellOffset * x, this.cellOffset * y]
    }

    grid:Array<number | undefined>
    gates = new Array<Gate | undefined>()

    gateCount = 0

    get(x:number, y:number) {
        const id = this.indexToId(x, y)
        if (id === undefined) {
            return undefined
        }
        return this.gates[id]
    }

    getInRange(x:number, y:number, sizeX:number, sizeY:number, exclude:Array<number> = []) {

        var collision = undefined;
        for (let i = 0; i < sizeY; i++) {
            for (let j = 0; j < sizeX; j++) {
                const val = this.indexToId(x + j, y + i)
                if (val !== undefined && exclude.indexOf(val) == -1) {
                    collision = val
                    break;
                }
            }
            if (collision !== undefined && exclude.indexOf(collision) == -1) {
                break;
            }
        }

        return collision
    }

    indexToId(x:number, y:number) {
        return this.grid[x + this.sizeX * y]
    }

    //add a gate at the given coordinates, and fail to add anything if another gate is in the way
    addGate(x:number, y:number, gate:Gate):number[] | undefined{
        const gType = gate.type
        const cell = this.getGateIndex(gate, x, y)

        const [sizeX, sizeY] = [gType.gridWidth, gType.gridHeight]
        const collision = this.getInRange(
            cell[0], cell[1], sizeX, sizeY
            )
        
        if (collision !== undefined) {
            return undefined
        }

        this.addGateNoChecks(cell[0], cell[1], gate)
        this.graph.resetConnectionsAt(gate.id || 0)

        return cell
    }

    addGateExisting(g:Gate) {
        const id = g.id || 0
        const gType = g.type
        this.gates[id] = g
        this.setIndexToRange(id, g.x || 0, g.y || 0, gType.gridWidth, gType.gridHeight)
    }

    //get a gate's position from a sample index
    getGateIndex(gate:Gate, x:number, y:number) {
        //x -= Math.floor(gate.gridHeight * .5)
        //y -= Math.floor(gate.gridWidth * .5)

        const clamp = this.clampIndex(gate, x, y)
        x = clamp[0]
        y = clamp[1]

        return [x, y]
    }

    getGateInputOffsets(gate:Gate) {
        const gType = gate.type
        let result = new Array<[number, number]>(gType.sizeIn)
        for (let i = 0; i < gType.sizeIn; i++) {
            result[i] = this.getGateInputOffset(gate, i)
        }

        return result
    }

    getGateOutputOffsets(gate:Gate) {
        const gType = gate.type
        let result = new Array<[number, number]>(gType.sizeOut)
        for (let i = 0; i < gType.sizeOut; i++) {
            result[i] = this.getGateOutputOffset(gate, i)
        }

        return result
    }

    getGateInputOffset(gate:Gate, input:number): [number, number] {
        const gridOffset = gate.type.inputOffsets[input]
        return [
            ((gate.x || 0) + gridOffset[0]) * this.cellOffset, 
            ((gate.y || 0) + gridOffset[1]) * this.cellOffset
        ]
    }

    getGateOutputOffset(gate:Gate, output:number): [number, number] {
        const gridOffset = gate.type.outputOffsets[output]
        return [
            ((gate.x || 0) + gridOffset[0]) * this.cellOffset, 
            ((gate.y || 0) + gridOffset[1]) * this.cellOffset
        ]
    }



    removeGate(id:number, clear:boolean=false) {
        const gate = this.gates[id]
        if (gate === undefined) {
            return undefined
        }
        const gType = gate.type
        const gatePosX = gate.x || 0
        const gatePosY = gate.y || 0

        this.setIndexToRange(undefined, gatePosX, gatePosY, gType.gridWidth, gType.gridHeight)

        if (clear) {
            this.gates[id] = undefined
            gate.clearId()
            gate.clearPos()

            this.graph.disconnectGate(id)
        }
        
        return gate
    }

    moveGate(id:number, toX:number, toY:number) {
        const gate = this.gates[id]
        if (!gate) {
            return undefined
        }
        const gType = gate.type

        const [sizeX, sizeY] = [gType.gridWidth, gType.gridHeight]

        const toCell = this.getGateIndex(gate, toX, toY)
        toX = toCell[0]
        toY = toCell[1]

        const collision = this.getInRange(toX, toY, sizeX, sizeY, [id])
        if (collision !== undefined) {
            console.log(id, collision)
            return undefined
        }

        this.removeGate(id)
        
        this.setIndexToRange(id, toX, toY, sizeX, sizeY)

        gate.givePos(toX, toY)
        return toCell
    }

    iterGates(iter:(g:Gate) => void) {
        for (let i = 0; i < this.gates.length; i++) {
            const g = this.gates[i]
            if (g === undefined) {
                continue
            }
            iter(g)
        }
    }

    //simple add gate assuming there is space at the specified coordinates
    //does not center the gate, but places its top-left at the given coordinates
    private addGateNoChecks(x:number, y:number, gate:Gate) {
        
        const gType = gate.type
        const [sizeX, sizeY] = [gType.gridWidth, gType.gridHeight]
        const gateId = this.gates.length

        this.setIndexToRange(gateId, x, y, sizeX, sizeY)

        gate.giveId(gateId)
        gate.givePos(x, y)
        this.gates.push(gate)
    }

    private setIndexToRange(id:number | undefined, x:number, y:number, sizeX:number, sizeY:number) {
        for (let i = 0; i < sizeY; i++) {
            for (let j = 0; j < sizeX; j++) {
                const index = x + j + (y + i) * this.sizeX
                this.grid[index] = id
            }
        }
    }


}