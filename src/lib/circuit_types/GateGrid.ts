import type { Gate } from "./Gate"
import type { GateGraph } from "./GateGraph"

/**
 * Store a grid of gates, keeping track of their position
 * This script exchanges memory efficiency for time efficiency by storing the whole grid as an array, making collision O(1) but memory O(width * height) at least
 * Gates are intended to be stored in a grid, and since the grid stores them in the grid array, their position is sometimes referred to as their "Index"
 */
export class GateGrid {

    graph:GateGraph

    sizeX = 20
    sizeY = 20
    cellOffset = 30

    grid:Array<number | undefined>
    gates = new Array<Gate | undefined>()

    constructor(
        graph:GateGraph, 
        sizeX:number | undefined = undefined, 
        sizeY:number | undefined = undefined,
        gates:Array<Gate> = []
    ) {
        this.sizeX = sizeX || this.sizeX
        this.sizeY = sizeY || this.sizeY
        this.grid = new Array<number | undefined>(this.sizeX * this.sizeY)

        for (let i = 0; i < gates.length; i++) {
            const gate = gates[i]
            this.addGateExisting(gate)
        }
        graph.gates = this.gates

        this.graph = graph
    }

    offsetToIndex(offsetX:number, offsetY:number) {
        const x = Math.floor(offsetX / this.cellOffset)
        const y = Math.floor(offsetY / this.cellOffset)
        return [x, y]
    }

    indexToOffset(x:number, y:number) {
        return [this.cellOffset * x, this.cellOffset * y]
    }

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

    /**
     * Check if a gate can be added at the current posision.
     * @param x 
     * @param y 
     * @param gate 
     * @returns 
     */
    canAddGate(x:number, y:number, gate:Gate): number[] | undefined {
        const gType = gate.type
        const cell = this.getGateIndex(gate, x, y)

        const [sizeX, sizeY] = [gType.gridWidth, gType.gridHeight]
        
        //check for collisions with existing gates
        const collision = this.getInRange(
            cell[0], cell[1], sizeX, sizeY
            )
        
        if (collision !== undefined) {
            return undefined
        }

        return cell
    }

    //add a gate at the given coordinates, and fail to add anything if another gate is in the way
    addGate(x:number, y:number, gate:Gate):number[] | undefined{
        const cell = this.canAddGate(x, y, gate)
        if (cell === undefined) return undefined

        //add the gate
        this.addGateNoChecks(cell[0], cell[1], gate)

        return cell
    }

    /**
     * Intended to be used by OrganizedCircuit objects when unpacking their loaded gates
     * If the gate is already instantiated, and you know the gate is in a valid position, this function may be faster than addGate
     * @param g 
     */
    addGateExisting(g:Gate) {
        const id = g.id || 0
        const gType = g.type
        this.gates[id] = g
        this.setIndexToRange(id, g.x || 0, g.y || 0, gType.gridWidth, gType.gridHeight)
        this.addInputOutput(g)
    }

    

    /**
     * Get a gate's position from a sample index
     * @param gate 
     * @param x 
     * @param y 
     * @returns 
     */
    getGateIndex(gate:Gate, x:number, y:number) {
        //center about the grid
        //x -= Math.floor(gate.gridHeight * .5)
        //y -= Math.floor(gate.gridWidth * .5)

        const clamp = this.clampGate(gate, x, y)
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

    getGateInputOffset(gate:Gate | undefined, input:number): [number, number] {
        if (gate === undefined) {
            return [0, 0]
        }
        const gridOffset = gate.type.inputOffsets[input]
        return [
            ((gate.x || 0) + gridOffset[0]) * this.cellOffset, 
            ((gate.y || 0) + gridOffset[1]) * this.cellOffset
        ]
    }

    getGateOutputOffset(gate:Gate | undefined, output:number): [number, number] {
        if (gate === undefined) {
            return [0, 0]
        }
        const gridOffset = gate.type.outputOffsets[output]
        return [
            ((gate.x || 0) + gridOffset[0]) * this.cellOffset, 
            ((gate.y || 0) + gridOffset[1]) * this.cellOffset
        ]
    }

    removeGate(id:number, clear:boolean=true) {
        const gate = this.gates[id]
        if (gate === undefined) {
            return undefined
        }
        const gType = gate.type
        const gatePosX = gate.x || 0
        const gatePosY = gate.y || 0

        this.setIndexToRange(undefined, gatePosX, gatePosY, gType.gridWidth, gType.gridHeight)
        this.removeInputOutput(gate)

        if (clear) {
            this.gates[id] = undefined

            this.graph.disconnectGate(id)
        }
        
        return gate
    }

    private removeInputOutput(gate:Gate) {
        const gType = gate.type
        if (gType.sizeIn === 0) {
            const i = this.inputs.indexOf(gate)
            if (i === -1) {
                console.log(gate, " should be in inputs list!")
                return
            }
            this.inputs[i] = undefined
        }
        if (gType.sizeOut === 0) {
            const i = this.outputs.indexOf(gate)
            if (i === -1) {
                console.log(gate, " should be in outputs list!")
                return
            }
            this.outputs[i] = undefined
        }
    }

    moveGate(id:number, toX:number, toY:number) {
        const gate = this.gates[id]
        if (!gate) {
            return undefined
        }
        
        const toCell = this.canMoveGate(gate, toX, toY)
        if (toCell === undefined) return undefined

        toX = toCell[0]
        toY = toCell[1]
        const gType = gate.type
        const [sizeX, sizeY] = [gType.gridWidth, gType.gridHeight]

        this.removeGate(id, false)
        this.setIndexToRange(id, toX, toY, sizeX, sizeY)
        gate.givePos(toX, toY)

        return toCell
    }

    canMoveGate(gate:Gate, toX:number, toY:number) {
        const gType = gate.type

        const [sizeX, sizeY] = [gType.gridWidth, gType.gridHeight]

        const toCell = this.getGateIndex(gate, toX, toY)
        toX = toCell[0]
        toY = toCell[1]

        const collision = this.getInRange(toX, toY, sizeX, sizeY, [gate.id])
        if (collision !== undefined) {
            return undefined
        }

        return [toX, toY]
    }

    iterGates(iter:(g:Gate) => any) {
        for (let i = 0; i < this.gates.length; i++) {
            const g = this.gates[i]
            if (g === undefined) {
                continue
            }
            if (iter(g)) {
                break
            }
        }
    }

    private iterRange(x:number, y:number, sizeX:number, sizeY:number, iter:(index:number) => any) {
        for (let i = 0; i < sizeY; i++) {
            for (let j = 0; j < sizeX; j++) {
                const index = x + j + (y + i) * this.sizeX
                if (iter(index)) {
                    break
                }
            }
        }
    }

    //simple add gate assuming this would not corrupt the grid
    private addGateNoChecks(x:number, y:number, gate:Gate) {
        
        const gType = gate.type
        const [sizeX, sizeY] = [gType.gridWidth, gType.gridHeight]
        const gateId = this.gates.length

        //"draw" the gate to the grid, by putting it's id in all the squares it covers
        this.setIndexToRange(gateId, x, y, sizeX, sizeY)
        //give the gate to inputs or outputs if necessary
        this.addInputOutput(gate)

        //push the gate to the gates array
        gate.giveId(gateId)
        gate.givePos(x, y)
        this.gates.push(gate)

        //update the graph
        this.graph.resetConnectionsAt(gate.id || 0)
    }

    inputs:Array<Gate | undefined> = []
    outputs:Array<Gate | undefined> = []

    private addInputOutput(gate:Gate) {
        const gType = gate.type
        const [input, output] = [gType.sizeIn === 0, gType.sizeOut === 0]
        if (input) this.inputs.push(gate)
        if (output) this.outputs.push(gate)
    }

    private setIndexToRange(id:number | undefined, x:number, y:number, sizeX:number, sizeY:number) {
        this.iterRange(x, y, sizeX, sizeY, (index) => {
            this.grid[index] = id
        })
    }

    private clampRect(x:number, y:number, x2:number, y2:number) {
        return [
            Math.max(Math.min(x, this.sizeX - x2), 0),
            Math.max(Math.min(y, this.sizeY - y2), 0)
        ]
    }

    private clampGate(gate:Gate, x:number, y:number) {
        const gType = gate.type
        return this.clampRect(x, y, gType.gridWidth, gType.gridHeight)
    }

    addGrid(grid:GateGrid, x:number, y:number) {
        //check size
        if (this.sizeX < grid.sizeX || this.sizeY < grid.sizeY) {    
            console.log("grid does not fit!")
            return 1
        }

        //adjust to fit
        const x2 = x + grid.sizeX
        const y2 = y + grid.sizeY

        const [newX, newY] = this.clampRect(x, y, x2, y2)

        //check collisions with original circuit
        var found:Gate | undefined
        grid.iterGates((g) => {
            const gType = g.type
            const gridPos = [(g.x || 0) + x, (g.y || 0) + y]
            
            const collision = this.getInRange(
                gridPos[0],      gridPos[1],
                gType.gridWidth, gType.gridWidth
            )
            
            if (collision !== undefined) {
                found = g
                return 2
            }

            //if the gate passes the collision, update it's data to prepare it for addition
            g.x = gridPos[0]
            g.y = gridPos[1]
            g.id = (g.id || 0) + this.gates.length
        })

        if (found !== undefined) {
            console.log("new grid collides with original at ", found)
            return 2
        }

        let newGates = this.gates.concat(grid.gates)
        this.gates = newGates

        grid.iterGates((g) => {
            this.addGateExisting(g)
        })

        this.graph.concatGraph(grid.graph)

        this.graph.gates = newGates
        

        return 0
    }
}