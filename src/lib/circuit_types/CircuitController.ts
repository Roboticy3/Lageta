import { Gate, type GateType } from "./Gate";
import { GateGraph, Connection, type ConnectionType } from "./GateGraph"
import { GateGrid } from "./GateGrid";
import { identity, transform, type Matrix, type Transform, applyToPoint, inverse, toSVG, fromObject, translate, rotateDEG, rotate, scale} from "transformation-matrix";

const connectionSelectRadius = 10

//
/**
 * return type of CircuitController.query()
 * @member gate readonly reference to a gate. This exposes the model class Gate to the view, but does not allow modification.
 * @member type result can refer to either a Gate, Connection (Input or Output), or nothing, if the query didn't hit anything on it's grid.
 * @member connectionIndex if type is Input or Output, connectionIndex will store a number telling where to find or put a connection later. 
 */
export class CircuitControllerQueryResult {
    readonly gate:Gate | undefined

    type: "Gate" | "Input" | "Output" | ""
    connectionIndex:number | undefined

    constructor(
        gate:Gate | undefined = undefined,
        type:"Gate" | "Input" | "Output" | "" = "",
        connectionIndex:number | undefined = undefined
    ) {
        this.gate = gate
        this.type = type
        if ((type === "Input" || type === "Output") && 
            gate !== undefined && connectionIndex !== undefined) {
                this.connectionIndex = connectionIndex
        }
    }
}

export type ConnectionIndex = {id:number, type:ConnectionType, index:number}

/**
 * Controller class for the "circuit," consisting of a GateGrid and GateGraph.
 * The CircuitController provides the user interface with all the necessary components to display and interact with the circuit.
 * The "circuit display" is an SVG string, handled by the view using functions from this class.
 * Gates in the circuit display have id tags matching their index in the actual array used by gateGrid.
 * @member gateGrid The grid of the circuit, reference to the graph is also held here.
 * @member transformMatrix A 2D transformation matrix to allow for panning and zooming of the display of the circuit without breaking the functions that take pixel offsets as arguments.
 */
export class CircuitController {
    readonly gateGrid:GateGrid

    private transformMatrix:Matrix

    constructor(
        gateGrid:GateGrid | undefined = undefined,
        makeMain:boolean = true
    )
    {
        if (gateGrid !== undefined) {
            this.gateGrid = gateGrid
        }
        else {
            let graph = new GateGraph()
            let gateGrid = new GateGrid(graph)
            this.gateGrid = gateGrid
        }

        this.transformMatrix = transform(translate(100, 100))

        if (makeMain) {
            mainController = this
        }
    }

    /**
     * Take a pixel offset from the circuit's local space and project it to a pixel offset in the circuit html element.
     * @param offsetX 
     * @param offsetY 
     * @returns 
     */
    projectOffset(offsetX:number, offsetY:number) {
        const p:[number, number] = [offsetX, offsetY]
        return applyToPoint(this.transformMatrix, p)
    }

    /**
     * Take a pixel offset from the circuit html element and unproject it to a pixel offset in the circuit's local space
     * @param offsetX
     * @param offsetY 
     * @returns 
     */
    unprojectOffset(offsetX:number, offsetY:number) {
        const p:[number, number] = [offsetX, offsetY]
        return applyToPoint(inverse(this.transformMatrix), p)
    }

    /**
     * Given an id from the circuit display, return a gate
     * @param gateId 
     * @returns 
     */
    getGateFromSvgId(gateId:string) {
        const id = this.svgIdToGateId(gateId)

        return this.gateGrid.gates[id]
    }

    /**
     * Given a cell index in the grid, return an offset in the ciruit's local space
     * @param x 
     * @param y 
     * @returns 
     */
    indexToOffset(x:number, y:number) {
        return this.gateGrid.indexToOffset(x,y)
    }

    /**
     * Given a ConnectionType, return it's opposite, or "" if it was empty to begin with.
     * @param t 
     * @returns 
     */
    flipConnectionType(t:ConnectionType) {
        switch (t){
            case "Input":
                return "Output"
            case "Output":
                return "Input"
            default:
                return ""
        }
    }
    
    /**
     * Get the length of a vector of pixel offsets in the circuit's local spae
     * @param dX 
     * @param dY 
     * @returns 
     */
    gridEuclidDistance(dX:number, dY:number) {
        return Math.sqrt(dX * dX + dY * dY)
    }

    /**
     * return a gate from a specific id
     * this function is bad because it gives a mutable reference to a Gate, a model class, to the view. Oh well!
     * @param gateId 
     * @returns 
     */
    getGate(gateId:number) {
        return this.gateGrid.gates[gateId]
    }

    /**
     * Change the grid cell offset to a new value
     * @param offset 
     */
    setGridCellOffset(offset:number) {
        this.gateGrid.cellOffset = offset
    }
    
    /**
     * @returns the number of gates in this controller's grid
     */
    getNumGates() {
        return this.gateGrid.gates.length
    }

    /**
     * 
     * @param offsetX 
     * @param offsetY 
     * @returns A CircuitControllerQueryResult that may contain a gate, as well as a connection.
     */
    query(
        offsetX:number,
        offsetY:number,
    )
    {
        const [localX, localY] = this.unprojectOffset(offsetX, offsetY)
        
        const [x, y] = this.gateGrid.offsetToIndex(localX, localY)
        const gate = this.gateGrid.get(x, y)
        if (gate === undefined) {
            return new CircuitControllerQueryResult()
        }
        const gType = gate.type

        const inputOffsets = this.gateGrid.getGateInputOffsets(gate)
        let i = 0;
        for (; i < gType.sizeIn; i++) {
            const offset = inputOffsets[i]
            const dX = localX - offset[0]
            const dY = localY - offset[1]

            const d = this.gridEuclidDistance(dX, dY)
            if (d < connectionSelectRadius) {
                break
            }
        }

        if (i != gType.sizeIn) {
            return new CircuitControllerQueryResult(
                gate,
                "Input",
                i
            ) 
        }

        const outputOffsets = this.gateGrid.getGateOutputOffsets(gate)
        i = 0
        for (; i < gType.sizeOut; i++) {
            const offset = outputOffsets[i]
            const dX = localX - offset[0]
            const dY = localY - offset[1]

            const d = this.gridEuclidDistance(dX, dY)
            if (d < connectionSelectRadius) {
                break
            }
        }

        if (i != gType.sizeOut) {
            return new CircuitControllerQueryResult(
                gate,
                "Output",
                i
            ) 
        }

        return new CircuitControllerQueryResult(
            gate,
            "Gate"
        ) 
    }

    /**
     * Attempt to add a gate of a given type to the grid at the given global offset
     * @param gType 
     * @param offsetX 
     * @param offsetY 
     * @returns 
     */
    addGate(
        gType:GateType, 
        offsetX:number, 
        offsetY:number
    ) {
        const gate = new Gate(gType)
        console.log("adding gate: ", gate)

        const gateId = this.gateGrid.gates.length

        const [localX, localY] = this.unprojectOffset(offsetX, offsetY)
        console.log(localX, localY, offsetX, offsetY)
        let [x, y] = this.gateGrid.offsetToIndex(localX, localY)
        const result = this.gateGrid.addGate(x, y, gate)
        if (result === undefined) {
            console.log("failed add!")
            return
        }

        console.log(this.gateGrid.graph)
    }

    /**
     * Move the gate at the given id to the new global offset
     * @param gateId 
     * @param offsetX 
     * @param offsetY 
     * @returns 
     */
    moveGate(
        gateId:string, 
        offsetX:number, 
        offsetY:number
    ) {
        console.log("moving gate: ", gateId)

        const id = this.svgIdToGateId(gateId)

        const gate = this.gateGrid.gates[id]
        if (gate === undefined) {
            return
        }
        const gType = gate.type
        if (!gType.moveable) {
            return
        }

        const [localX, localY] = this.unprojectOffset(offsetX, offsetY)
        console.log(offsetX, offsetY, localX, localY)
        let [x, y] = this.gateGrid.offsetToIndex(localX, localY)

        const result = this.gateGrid.moveGate(id, x, y)
        if (result === undefined) {
            console.log("failed move!")
            return
        }

        console.log(this.gateGrid)
    }

    /**
     * Remove a gate at the given id.
     * @param gateId 
     * @param svgContents 
     */
    removeGate(
        gateId:string,
        svgContents:Array<string>
    ) {
        console.log("removing gate: ", gateId)
        const id = this.svgIdToGateId(gateId)

        const result = this.gateGrid.removeGate(id, true)
        if (result === undefined) {
            console.log("gate not found! ")
        }

        svgContents[id] = ""

        console.log(this.gateGrid)
    }

    /**
     * Add a connection using two gate ids and two connection indices. Connections from->outputs[output] to to->inputs[input]
     * @param from 
     * @param output 
     * @param to 
     * @param input 
     */
    addConnection(
        from:number,
        output:number,
        to:number,
        input:number,
    ) {

        const graph = this.gateGrid.graph
        const c = new Connection(from, output, to, input)
        graph.addConnection(c)
        
        console.log(graph)
    }

    /**
     * Remove a connection, requires an id, connection type and index. Does nothing if the type is ""
     * @param gateId 
     * @param type 
     * @param index 
     */
    removeConnection( 
        index:ConnectionIndex
    ) {
        const graph = this.gateGrid.graph
        
        switch (index.type) {
            case "Input":
                graph.removeInput([index.id, index.index])
                break
            case "Output":
                const c = graph.outputs[index.id][index.index]
                if (c === undefined) {
                    break
                }
                graph.removeOutput(c)
                break
        }

        console.log(graph)
    }

    /**
     * Get the incoming connection from a given id and input index
     * @param gateId 
     * @param index 
     * @returns 
     */
    getConnectedTo(
        gateId:number,
        inputIndex:number
    ) {
        const graph = this.gateGrid.graph
        
        const c = graph.inputs[gateId][inputIndex]
        console.log(c)

        return c?.from
    }

    /**
     * Get the local offset of a connection point
     * @param gate 
     * @param type 
     * @param index 
     * @returns 
     */
    getConnectionPoint(
        index:ConnectionIndex
    ) {
        switch (index.type) {
            default:
            case "Input":
                return this.gateGrid.getGateInputOffset(this.getGate(index.id), index.index)
            case "Output":
                return this.gateGrid.getGateOutputOffset(this.getGate(index.id), index.index)
        }
    }

    resolve() {
        const outputs = this.gateGrid.outputs.values()
        let result = new Array<boolean>()
        for (const output of outputs) {
            if (output === undefined) {
                continue
            }
            const override = this
                .gateGrid
                .graph
                .resolveInputsAt(output)
            result.push(...override)
        }
        return result
    }

    /**
     * Convert and SVG id tag to a numeric id
     * @param id 
     * @returns 
     */
    private svgIdToGateId(id:string) {
        const idParts = id.split("-")
        return Number(idParts[1])
    }

    /**
     * return a string array of SVG lines denoting the cells of the grid
     * @param color 
     * @returns 
     */
    gridCellsSvg(color:String = "purple") {
        const grid = this.gateGrid
        let svg = new Array<String>(grid.sizeX + grid.sizeY)
        const offsetHeight = grid.cellOffset * grid.sizeY
        const offsetWidth = grid.cellOffset * grid.sizeX
        for (let i = 0; i < grid.sizeX; i++) {
            const hpos = i * grid.cellOffset
            svg[i] = `<path d="M ${hpos} 0 L ${hpos} ${offsetHeight}" stroke="${color}" stroke-width=".25pt"/>`
        }
        for (let j = 0; j < grid.sizeY; j++) {
            const vpos = j * grid.cellOffset
            svg[grid.sizeX + j] = `<path d="M 0 ${vpos} L ${offsetWidth} ${vpos}" stroke="${color}" stroke-width=".25pt"/>`
        }
        return svg
    }

    /**
     * Given a drawing function for gates, return an array of strings containing whem all in SVG form.
     * @param getGateSvgContents 
     * @returns 
     */
    drawGates(getGateSvgContents:(name:string) => string) {
        var result = Array<string>()
        this.gateGrid.iterGates((g) => {
        result.push
    (
`
<g 
    id="${g.id || 0}" 
    ${this.getGateSvgTransform(g)}>
    ${getGateSvgContents(g.type.name)}
</g>
`
    )
        })

        return result
    }

    /**
     * Given a function for drawing connection points, draw all connection points of the given type
     * @param connectionBuilder 
     * @param type If a blank ConnectionType is given, all the connections, Inputs and Outputs, will be drawn.
     * @returns 
     */
    drawConnectionPoints(connectionBuilder:(localX:number, localY:number) => string, type:ConnectionType="") {
        const graph = this.gateGrid.graph
        let result = ""

        graph.iterConnectionPoints((g, t, j) => {
            const inputOffsets = this.gateGrid.getGateInputOffsets(g)
            const outputOffsets = this.gateGrid.getGateOutputOffsets(g)
            switch (t) {
                case "Input":
                    result += connectionBuilder(
                        inputOffsets[j][0],
                        inputOffsets[j][1]
                    )
                    break
                case "Output":
                    result += connectionBuilder(
                        outputOffsets[j][0],
                        outputOffsets[j][1]
                    )
                    break
            }
        }, type)
        
        return result
    }

    /**
     * Given a function for drawing connection wires, draw all connection wires
     * @param wireBuilder 
     * @returns 
     */
    drawWires(wireBuilder:(fromOffset:[number, number], toOffset:[number, number]) => string) {
        const graph = this.gateGrid.graph
        let result = new Array<string>()
        
        graph.iterConnections((f, o, t, i, _c) => {
            const fOffsets = this.gateGrid.getGateOutputOffsets(f)
            const tOffsets = this.gateGrid.getGateInputOffsets(t)
            result.push(wireBuilder(fOffsets[o], tOffsets[i]))
        })

        return result
    }

    /**
     * @returns A string in svg format for the transformation matrix, needed to display the circuit with proper pan and zoom
     */
    getMatrixSvg() {
        return toSVG(this.transformMatrix)
    }

    /**
     * get the svg transform of a gate
     * if a 20x20 gate svg represents a 1x1 cell gate, the transform will be standard
     * @param gate 
     * @returns 
     */
    getGateSvgTransform(gate:Gate) {
        const gType = gate.type
        const position = this.gateGrid.indexToOffset(gate.x || 0, gate.y || 0)
        const snappedX = position[0]
        const snappedY = position[1]

        const scale = this.gateGrid.cellOffset / 10

        return `transform="translate(${snappedX} ${snappedY}) scale(${scale} ${scale})"`
    }
}

/**
 * Reference to whatever the current controller is of the circuit being displayed
 */
export var mainController:CircuitController | undefined = undefined