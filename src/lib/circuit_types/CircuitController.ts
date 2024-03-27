import type { SignalPlayer } from "$lib/signal_types/Signal";
import type { SignalSetController } from "$lib/signal_types/SignalSetController";
import { Gate, createGate } from "./Gate";
import { GateGraph, Connection, type ConnectionType } from "./GateGraph"
import { GateGrid } from "./GateGrid";
import { identity, transform, type Matrix, type Transform, applyToPoint, inverse, toSVG, fromObject, translate, rotateDEG, rotate, scale} from "transformation-matrix";
import CircuitRenderer from "$lib/components/GameView/CircuitRenderer.svelte";
import { GateType, GateTypeController, GateTypeView } from "./GateType";
import { all_gates, getGateType, type GateTypeParameters } from "$lib/dat/GateTypes/GateTypes";

const connectionSelectRadius = 5

//
/**
 * return type of CircuitController.query()
 * @member gate readonly reference to a gate. This exposes the model class Gate to the view, but does not allow modification.
 * @member type result can refer to either a Gate, Connection (Input or Output), or nothing, if the query didn't hit anything on it's grid.
 * @member connectionIndex if type is Input or Output, connectionIndex will store a number telling where to find or put a connection later. 
 */
export class CircuitControllerQueryResult {
    readonly gate:Gate | undefined

    readonly gateTypeController:GateTypeController | undefined

    readonly type: "Gate" | "Input" | "Output" | ""
    readonly connectionIndex:number | undefined

    constructor(
        gate:Gate | undefined = undefined,
        type:"Gate" | "Input" | "Output" | "" = "",
        connectionIndex:number | undefined = undefined,
        gateTypeController:GateTypeController | undefined = undefined
    ) {
        this.gate = gate
        this.gateTypeController = gateTypeController
        this.type = type
        if ((type === "Input" || type === "Output") && 
            gate !== undefined && connectionIndex !== undefined) {
                this.connectionIndex = connectionIndex
        }

    }

    getId() {return this.gate?.id}

    getPos() {return this.gate ? [this.gate.x, this.gate.y]:undefined}
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
    onComplete:() => void

    private renderer:CircuitRenderer | null = null

    constructor(
        gateGrid:GateGrid | undefined = undefined,
        onComplete:() => void = () => {},
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

        if (makeMain) {
            mainController = this
        }

        this.onComplete = onComplete
    }

    giveRenderer(renderer:CircuitRenderer) {
        this.renderer = renderer
        this.gateGrid.graph.connectionListeners.add(renderer.updateGate) //go-go gadget super spaghetti bullshit!
    }

    getRenderer() {
        return this.renderer
    }

    /**
     * Take a pixel offset from the circuit's local space and project it to a pixel offset in the circuit html element.
     * @param offsetX 
     * @param offsetY 
     * @returns 
     */
    projectOffset(offsetX:number, offsetY:number) {
        const p:[number, number] = [offsetX, offsetY]
        if (this.renderer) return applyToPoint(this.renderer.getTransformMatrix(), p)
        return p
    }

    /**
     * Take a pixel offset from the circuit html element and unproject it to a pixel offset in the circuit's local space
     * @param offsetX
     * @param offsetY 
     * @returns 
     */
    unprojectOffset(offsetX:number, offsetY:number) {
        const p:[number, number] = [offsetX, offsetY]
        if (this.renderer) return applyToPoint(inverse(this.renderer.getTransformMatrix()), p)
        return p
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

    getGridSize() {
        return [this.gateGrid.sizeX, this.gateGrid.sizeY]
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
     * return a gate from a specific id, used by different parts of the model to communicate
     * this function is bad because it gives a mutable reference to a Gate, a model class, to the view. Oh well!
     * @param gateId 
     * @returns 
     */
    getGate(gateId:number) {
        return this.gateGrid.gates[gateId]
    }

    /**
     * return a GateTypeView from a specific id for the veiw
     * @param gateId 
     * @returns 
     */
    getGateTypeView(gateId:number) {
        const gate = this.getGate(gateId)
        if (gate === undefined) return gate
        return all_gates.get(gate.type.name)?.view
    }

    getGateTypeController(gateId:number) {
        const gate = this.getGate(gateId)
        if (gate === undefined) return gate
        return all_gates.get(gate.type.name)
    }

    getGatePosition(gateId:number): [number, number] | undefined {
        const gate = this.getGate(gateId)
        if (gate === undefined) return undefined
        return [gate.x, gate.y]
    }

    getGateState(gateId:number) {
        const gate = this.getGate(gateId)
        if (gate === undefined) return undefined
        return gate.state
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
        const [gridOffsetX, gridOffsetY] = [gate.x * 10, gate.y * 10]
        const gType = gate.type
        const cType = all_gates.get(gType.name)
        if (cType === undefined) {
            return new CircuitControllerQueryResult()
        }
        const vType = cType.view

        const inputOffsets = vType.inputOffsets
        let i = 0;
        for (; i < gType.sizeIn; i++) {
            const offset = [inputOffsets[i][0] + gridOffsetX, inputOffsets[i][1] + gridOffsetY]
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
                i,
                cType
            ) 
        }

        const outputOffsets = vType.outputOffsets
        i = 0
        for (; i < gType.sizeOut; i++) {
            const offset = [outputOffsets[i][0] + gridOffsetX, outputOffsets[i][1] + gridOffsetY]
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
                i,
                cType
            ) 
        }

        return new CircuitControllerQueryResult(
            gate,
            "Gate",
            undefined,
            cType
        ) 
    }

    toQuery(
        id:number = 0,
        type:"" | "Gate" | "Input" | "Output" = "",
        connectionIndex:number | undefined = undefined
    ) {
        const gate = this.gateGrid.gates[id]
        return new CircuitControllerQueryResult(
            gate, type, connectionIndex, this.getGateTypeController(id)
        )
    }

    toLocal(offsetX:number, offsetY:number) {
        const [localX, localY] = this.unprojectOffset(offsetX, offsetY)
        return this.gateGrid.offsetToIndex(localX, localY)

    }

    /**
     * Attempt to add a gate of a given type to the grid at the given global offset
     * @param gType 
     * @param offsetX 
     * @param offsetY 
     * @returns 
     */
    addGate(
        cType:GateTypeController, 
        offsetX:number, 
        offsetY:number
    ) {

        const [x, y] = this.toLocal(offsetX, offsetY)
        
        this.addGateAtCell(cType, x, y)

    }

    addGateAtCell(
        params:GateTypeParameters,
        x:number,
        y:number
    ) {
        const cType = getGateType(params)
        const gate = createGate(cType)
        console.log("adding gate: ", gate, " at ", x, y)

        const result = this.gateGrid.addGate(x, y, gate)
        if (result === undefined) {
            console.log("failed add!")
            return
        }

        this.renderer?.updateGate(gate.id)

        console.log(this.gateGrid)
    }

    previewAddGate(
        cType:GateTypeController,
        offsetX:number,
        offsetY:number
    ) {
        const [localX, localY] = this.unprojectOffset(offsetX, offsetY)
        const [x, y] = this.gateGrid.offsetToIndex(localX, localY)
        const gate = new Gate(cType.model)
        return this.gateGrid.canAddGate(x, y, gate)
    }

    previewMoveGate(
        id:number,
        offsetX:number,
        offsetY:number
    ) {
        const [localX, localY] = this.unprojectOffset(offsetX, offsetY)
        const [x, y] = this.gateGrid.offsetToIndex(localX, localY)
        const gate = this.gateGrid.gates[id]
        if (gate === undefined) return undefined
        return this.gateGrid.canMoveGate(gate, x, y)
    }

    /**
     * Move the gate at the given id to the new global offset
     * @param gateId 
     * @param offsetX 
     * @param offsetY 
     * @returns 
     */
    moveGate(
        id:number, 
        offsetX:number, 
        offsetY:number
    ) {
        const [x, y] = this.toLocal(offsetX, offsetY)
        console.log("moving gate ", id, " to ", x, y)

        const vType = this.getGateTypeView(id)
        if (vType === undefined) return
        if (!(vType.moveable === true)) {
            return
        }

        const result = this.gateGrid.moveGate(id, x, y)
        if (result === undefined) {
            console.log("failed move!")
            return
        }

        this.renderer?.updateGate(id)

        console.log(this.gateGrid)
    }

    /**
     * Remove a gate at the given id.
     * @param id 
     * @param svgContents 
     */
    removeGate(
        id:number
    ) {
        console.log("removing gate: ", id)

        const result = this.gateGrid.removeGate(id, true)
        if (result === undefined) {
            console.log("gate not found! ")
            return
        }

        this.renderer?.updateGate(id)

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
        const result = graph.addConnection(c)

        this.renderer?.updateWire([from, output])

        return result
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
                const fromIndex = this.getConnectedTo(index.id, index.index)
                if (fromIndex === undefined) break
                this.renderer?.updateWire(fromIndex)
                graph.removeInput([index.id, index.index])
                break
            case "Output":
                const c = graph.outputs[index.id][index.index]
                if (c === undefined) {
                    break
                }
                graph.removeOutput(c)
                this.renderer?.updateWire(c.from)
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

        return c?.from
    }

    getConnectedFrom(
        gateId:number,
        outputIndex:number
    ) {
        const graph = this.gateGrid.graph

        const c = graph.outputs[gateId][outputIndex]

        return c?.to
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
        const gateId = index.id
        const vType = this.getGateTypeView(gateId)
        if (vType === undefined) return undefined
        switch (index.type) {
            default:
            case "Input":
                return vType.inputOffsets[index.index]
            case "Output":
                return vType.outputLabels[index.index]
        }
    }

    addConnectionListener(
        f: (id: number) => void
    ) {
        this.gateGrid.graph.connectionListeners.add(f)
    }

    removeConnectionListener(
        f: (id: number) => void
    ) {
        this.gateGrid.graph.connectionListeners.delete(f)
    }

    getInputIds() {
        let result = new Array<[number, number]>()
        for (let i of this.gateGrid.inputs.values()) {
            if (i === undefined) {
                continue
            }
            const gType = i.type
            let chunk = new Array<[number, number]>(gType.sizeIn)
            for (let j = 0; j < gType.sizeOut; j++) {
                chunk[j] = [i.id, j]
            }
            result.push(...chunk)
        }

        return result
    }

    getInputs() {
        let result = new Array<boolean>()
        for (let i of this.gateGrid.inputs.values()) {
            if (i === undefined) {
                continue
            }
            const chunk = i.state.override.map((v) => {return v === true})
            result.push(...chunk)
        }

        return result
    }

    getInputLabels() {
        let result:string[] = []
        for (let g of this.gateGrid.inputs) {
            if (g === undefined) {
                continue
            }
            result.push(g.type.name)
        }
        return result
    }

    setInput(index:[number, number], val:boolean) {
        this.gateGrid.graph.setFlow(index, val)
    }

    setInputs(val:boolean[]) {
        const inputs = this.gateGrid.inputs.map((g) => {
            return g?.id
        })
        const graph = this.gateGrid.graph
        graph.setFlows(val, inputs)
    }

    getOutputs() {
        let result:boolean[] = []
        for (let g of this.gateGrid.outputs) {
            if (g === undefined) {
                continue
            }
            result.push(...g.state.override.map((v) => {
                return v || false
            }))
        }
        return result
    }

    getOutputLabels() {
        let result:string[] = []
        for (let g of this.gateGrid.outputs) {
            if (g === undefined) {
                continue
            }
            result.push(...this.getGateInputLabels(g))
        }
        return result
    }

    getGateInputLabels(gate:Gate) {
        const key = gate.type.name
        const cType = all_gates.get(key)
        return cType?.view.inputLabels || []
    }

    getGateInputs(
        id:number
    ) {
        const gate = this.gateGrid.gates[id]
        return gate?.state.override
    }

    getGateOutputs(
        id:number
    ) {
        const gate = this.gateGrid.gates[id]
        return gate?.execute(undefined)
    }

    getGateOutputLabels(gate:Gate) {
        const key = gate.type.name
        const cType = all_gates.get(key)
        return cType?.view.outputLabels || []
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

    isOffsetInGrid(offsetX:number, offsetY:number) {
        const localOffset = this.unprojectOffset(offsetX, offsetY)
        const grid = this.gateGrid
        const [sizeX, sizeY] = [
            grid.sizeX * 10,
            grid.sizeY * 10
        ]

        return (
            localOffset[0] >= 0 && localOffset[1] >= 1 &&
            localOffset[0] < sizeX && localOffset[1] < sizeY
        )
    }

    /**
     * Given a drawing function for gates, return an array of strings containing whem all in SVG form.
     * @param getGateTypeSvgContents 
     * @returns 
     */
    drawGates(getGateTypeSvgContents:(gate:GateType) => string) {
        var result = Array<string>()
        this.gateGrid.iterGates((g) => {
        result.push
    (
`
<g 
    id="${g.id || 0}" 
    ${this.getGateSvgTransform(g)}>
    ${getGateTypeSvgContents(g.type)}
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
    drawConnectionPoints(connectionBuilder:(localX:number, localY:number, pathParams?:string, label?:string, textParams?:string) => string, type:ConnectionType="") {
        const graph = this.gateGrid.graph
        let result = ""

        graph.iterConnectionPoints((g, t, j) => {
            const vType = this.getGateTypeView(g.id)
            if (vType === undefined) return
            const inputOffsets = vType.inputOffsets
            const outputOffsets = vType.outputOffsets
            const inputLabels = vType.inputLabels
            const outputLabels = vType.outputLabels
            switch (t) {
                case "Input":
                    result += connectionBuilder(
                        inputOffsets[j][0],
                        inputOffsets[j][1],
                        `stroke-width=.5px ` + (g.getInput(j) ? `fill="var(--connection-color-on)" stroke="none" `:`stroke="var(--connection-color-off)" `),
                        inputLabels[j]
                    )
                    
                    break
                case "Output":
                    result += connectionBuilder(
                        outputOffsets[j][0],
                        outputOffsets[j][1],
                        `stroke-width=.5px ` + (g.getOutput(j) ? `fill="var(--connection-color-on)" stroke="none" `:`stroke="var(--connection-color-off)" `),
                        outputLabels[j]
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
    drawWires(wireBuilder:(fromOffset:[number, number], toOffset:[number, number], pathParams:string) => string) {
        const graph = this.gateGrid.graph
        let result = new Array<string>()
        
        graph.iterConnections((f, o, t, i, _c) => {
            const fVType = this.getGateTypeView(f.id)
            if (fVType === undefined) return
            const fOffsets = fVType.outputOffsets
            const fValue = f.getOutputs()[o]

            const tVType = this.getGateTypeView(t.id)
            if (tVType === undefined) return
            const tOffsets = tVType.inputOffsets
            const params = fValue ? `stroke="var(--connection-color-on)"`:`stroke="var(--connection-color-off)"`
            result.push(wireBuilder(fOffsets[o], tOffsets[i], params))
        })

        return result
    }

    /**
     * @returns A string in svg format for the transformation matrix, needed to display the circuit with proper pan and zoom
     */
    getMatrixSvg() {
        return this.renderer?.getTransformString()
    }

    /**
     * get the svg transform of a gate
     * if a 20x20 gate svg represents a 1x1 cell gate, the transform will be standard
     * @param gate 
     * @returns 
     */
    getGateSvgTransform(gate:Gate | {type:GateType, x:number, y:number}) {
        const gType = gate.type
        const position = this.gateGrid.indexToOffset(gate.x, gate.y)
        const snappedX = position[0]
        const snappedY = position[1]

        return `transform="translate(${snappedX} ${snappedY})"`
    }

    //reference the player giving the signal in a SignalViewer
    private player:SignalPlayer | undefined = undefined
    setPlayer(player:SignalPlayer) {
        this.player = player
    }

    isPlaying() {
        return this.player?.isScrubbing() || false
    }

    //tell the view that the level has been beaten
    complete() {
        this.onComplete()
    }

}

/**
 * Reference to whatever the current controller is of the circuit being displayed
 */
export var mainController:CircuitController | undefined = undefined