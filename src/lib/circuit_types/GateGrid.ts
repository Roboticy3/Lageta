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
        const x = Math.floor(offsetX / 10)
        const y = Math.floor(offsetY / 10)
        return [x, y]
    }

    indexToOffset(x:number, y:number): [number, number] {
        return [10 * x, 10 * y]
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
        return this.atCell(x, y) //lol
    }

    /**
     * Check if a gate can be added at the current posision.
     * @param x 
     * @param y 
     * @param gate 
     * @returns 
     */
    canAddGate(x:number, y:number, gate:Gate) {
        const gType = gate.type

        const [sizeX, sizeY] = [gType.gridWidth, gType.gridHeight]
        const clamped = this.clampGate(gate, x, y)
        if (clamped[0] !== x || clamped[1] !== y) {
            return "Out of Bounds"
        }
        
        //check for collisions with existing gates
        const collision = this.getInRange(
            x, y, sizeX, sizeY
            )
        
        if (collision !== undefined && collision != gate.id) {
            return "Collision"
        }

        return "Ok"
    }

    canMoveGate(x:number, y:number, gate:Gate) {
        const gType = gate.type

        const [sizeX, sizeY] = [gType.gridWidth, gType.gridHeight]
        const clamped = this.clampGate(gate, x, y)
        if (clamped[0] !== x || clamped[1] !== y) {
            return "Out of Bounds"
        }
        
        //check for collisions with existing gates
        const collision = this.getInRange(
            x, y, sizeX, sizeY, [gate.id]
        )
        
        if (collision !== undefined && collision != gate.id) {
            return "Collision"
        }

        return "Ok"
    }

    //add a gate at the given coordinates, and fail to add anything if another gate is in the way
    addGate(x:number, y:number, gate:Gate) {

        if (this.canAddGate(x, y, gate) !== "Ok") return false

        //add the gate
        this.addGateNoChecks(x, y, gate)

        return true
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
                return "Gate Not In Inputs List"
            }
            this.inputs[i] = undefined
        }
        if (gType.sizeOut === 0) {
            const i = this.outputs.indexOf(gate)
            if (i === -1) {
                return "Gate Not In Outputs List"
            }
            this.outputs[i] = undefined
        }

        return "Ok"
    }

    moveGate(id:number, toX:number, toY:number) {
        const gate = this.gates[id]
        if (!gate) {
            return undefined
        }

        if (this.canMoveGate(toX, toY, gate) !== "Ok") return false

        const gType = gate.type
        const [sizeX, sizeY] = [gType.gridWidth, gType.gridHeight]

        this.removeGate(id, false)
        this.setIndexToRange(id, toX, toY, sizeX, sizeY)
        gate.givePos(toX, toY)

        return true
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

    private iterRange(x:number, y:number, sizeX:number, sizeY:number, iter:(x:number, y:number) => any) {
        for (let i = 0; i < sizeY; i++) {
            for (let j = 0; j < sizeX; j++) {
                if (iter(x + j, y + i)) {
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
        this.iterRange(x, y, sizeX, sizeY, (x, y) => {
            this.setCell(x, y, id)
        })
    }

    clampPos(x:number, y:number) {
        return [
            Math.max(Math.min(x, this.sizeX), 0),
            Math.max(Math.min(y, this.sizeY), 0)
        ]
    }

    clampRect(x:number, y:number, x2:number, y2:number) {
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
            return "Grid Does Not Fit"
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
            
            const collisionId = this.getInRange(
                gridPos[0],      gridPos[1],
                gType.gridWidth, gType.gridWidth
            )

            
            if (collisionId !== undefined) {
                found = g
                return
            }
            //if the gate passes the collision, update it's data to prepare it for addition
            g.x = gridPos[0]
            g.y = gridPos[1]
            g.id = (g.id || 0) + this.gates.length
        })

        if (found !== undefined) {
            console.log("new grid collides with original at ", found)
            return "Grid Collides With Original"
        }

        let newGates = this.gates.concat(grid.gates)
        this.gates = newGates

        grid.iterGates((g) => {
            this.addGateExisting(g)
        })

        this.graph.concatGraph(grid.graph)

        this.graph.gates = newGates
        

        return "Ok"
    }

    /**
     * Shoot a ray through the grid 
     * https://www.redblobgames.com/grids/line-drawing/ helped
     * @param x 
     * @param y 
     * @param dx 
     * @param dy 
     * @returns 
     */
    rayCast(x:number, y:number, dx:number, dy:number, length?:number, ignoreStart=true): number | undefined {
        const N = Math.sqrt(dx * dx + dy * dy)
        const stepX = dx / (N + 1)
        const stepY = dy / (N + 1)

        let steps = 0
        const maxSteps = length ? ((N + 1) * length / N) : Infinity

        let px = x
        let py = y
        let hit = ignoreStart ? undefined : this.atCell(x, y)

        while (hit === undefined && steps < maxSteps) {
            px += stepX
            py += stepY
            steps++

            const gridX = Math.round(px)
            const gridY = Math.round(py)
            const clamped = this.clampPos(gridX, gridY)

            if ((clamped[0] !== gridX) || (clamped[1] !== gridY)) break

            hit = this.atCell(gridX, gridY)
        }

        return hit
    }

    atCell(x:number, y:number) {
        return this.grid[x + this.sizeX * y]
    }

    private setCell(x:number, y:number, id:number | undefined) {
        this.grid[x + this.sizeX * y] = id
    }
}