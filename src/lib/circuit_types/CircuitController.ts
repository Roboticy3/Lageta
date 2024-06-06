import type { SignalPlayer } from "$lib/signal_types/Signal";
import { Gate, createGate } from "./Gate";
import { GateGraph, Connection, type ConnectionType, type GateGraphEvent, type GateGraphEventListener, type GateGraphEventKey } from "./GateGraph"
import { GateGrid } from "./GateGrid";
import { identity, transform, type Matrix, type Transform, applyToPoint, inverse, toSVG, fromObject, translate, rotateDEG, rotate, scale} from "transformation-matrix";
import { GateType, GateTypeController, GateTypeView, type ConnectionValue } from "./GateType";
import { all_gates, getGateType, type GateTypeParameters } from "$lib/dat/GateTypes/GateTypes";
import { CircuitControllerQueryResult, type CircuitControllerQueryResultContentType } from "./CircuitControllerQueryResult";
import type { CustomEventListener } from "$lib/misc_types/CustomEventSystem";

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

    private renderer?:any = null

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

    giveRenderer(renderer:any) {
        this.renderer = renderer
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
        return this.renderer?.toGlobal([offsetX, offsetY])
    }

    /**
     * Take a pixel offset from the circuit html element and unproject it to a pixel offset in the circuit's local space
     * @param offsetX
     * @param offsetY 
     * @returns 
     */
    unprojectOffset(offsetX:number, offsetY:number) {
        return this.renderer?.toLocal([offsetX, offsetY])
    }

    getMatrix() {
        return this.renderer?.getMatrix()
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

    query(e:MouseEvent) {
        const [offsetX, offsetY] = [e.offsetX, e.offsetY]
        const [pageX, pageY] = [e.pageX, e.pageY]
        const timeStamp = e.timeStamp
        const [localX, localY] = this.unprojectOffset(offsetX, offsetY)
        
        const [x, y] = this.gateGrid.offsetToIndex(localX, localY)
        const gate = this.gateGrid.get(x, y)
        if (gate === undefined) {
            return new CircuitControllerQueryResult(
                undefined, undefined, undefined, undefined,
                [localX, localY], [pageX, pageY],
                timeStamp
            )
        }
        const [gridOffsetX, gridOffsetY] = [gate.x * 10, gate.y * 10]
        const gType = gate.type
        const cType = all_gates.get(gType.name)
        if (cType === undefined) {
            return new CircuitControllerQueryResult(
                undefined, undefined, undefined, undefined,
                [localX, localY], [pageX, pageY],
                timeStamp
            )
        }
        const vType = cType.view

        const inputOffsets = vType.inputOffsets
        let i = 0;
        for (; i < gType.sizeIn; i++) {
            const offset = [inputOffsets[i][0] + gridOffsetX, inputOffsets[i][1] + gridOffsetY]
            const dX = localX - offset[0]
            const dY = localY - offset[1]

            const d = this.gridEuclidDistance(dX, dY)
            if (d < 5) {
                break
            }
        }

        if (i != gType.sizeIn) {
            return new CircuitControllerQueryResult(
                gate,
                "Input", i, cType,
                [localX, localY], [pageX, pageY],
                timeStamp
            ) 
        }

        const outputOffsets = vType.outputOffsets
        i = 0
        for (; i < gType.sizeOut; i++) {
            const offset = [outputOffsets[i][0] + gridOffsetX, outputOffsets[i][1] + gridOffsetY]
            const dX = localX - offset[0]
            const dY = localY - offset[1]

            const d = this.gridEuclidDistance(dX, dY)
            if (d < 5) {
                break
            }
        }

        if (i != gType.sizeOut) {
            return new CircuitControllerQueryResult(
                gate,
                "Output", i, cType,
                [localX, localY], [pageX, pageY],
                timeStamp
            ) 
        }

        return new CircuitControllerQueryResult(
            gate, "Gate", undefined, cType,
            [localX, localY], [pageX, pageY],
            timeStamp
        ) 
    }

    toQuery(
        id:number | undefined, 
        type:CircuitControllerQueryResultContentType | undefined, 
        connectionIndex:number | undefined, 
        localOffset?:[number, number],
        pageOffset?:[number, number],
        timeStamp?:number
    ) {
        const gate = this.gateGrid.gates[id || 0]
        return new CircuitControllerQueryResult(
            gate, type, connectionIndex, 
            this.getGateTypeController(id || 0), 
            localOffset, pageOffset,
            timeStamp
        )
    }

    /**
     * Given a cell index in the grid, return an offset in the ciruit's local space
     * @param x 
     * @param y 
     * @returns 
     */
    indexToOffset(x:number, y:number): [number, number] {
        return this.gateGrid.indexToOffset(x,y)
    }

    localOffsetToIndex(offsetX:number, offsetY:number) {
        return this.gateGrid.offsetToIndex(offsetX, offsetY)
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
        return this.gateGrid.gates.filter(v => v).length
    }

    getGateIdLength() {
        return this.gateGrid.gates.length
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
        const [localX, localY] = this.unprojectOffset(offsetX, offsetY)
        return this.addGateLocal(cType, localX, localY)
    }

    addGateLocal(
        cType:GateTypeController,
        localX:number,
        localY:number
    ) {
        if (!this.isLocalOffsetInGrid(localX, localY)) {
            return "Out of Bounds"
        }

        const [x, y] = this.localOffsetToIndex(localX, localY)       
        return this.addGateAtCell(cType, x, y)
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
        if (result !== true) {
            console.log("failed add!")
            return "Failed Add"
        }

        this.renderer?.updateGate(gate.id)

        return "Ok"
    }

    previewAddGate(
        cType:GateTypeController,
        offsetX:number,
        offsetY:number
    ) {
        const [localX, localY] = this.unprojectOffset(offsetX, offsetY)
        this.previewAddGateLocal(cType, localX, localY)
    }

    previewAddGateLocal(
        cType:GateTypeController,
        localX:number, 
        localY:number
    ) {
        const [x, y] = this.gateGrid.offsetToIndex(localX, localY)
        const gate = new Gate(cType.model)
        gate.id = -1
        const error = this.gateGrid.canAddGate(x, y, gate)
        return {at:[x, y], error:error}
    }

    previewMoveGate(
        id:number,
        offsetX:number,
        offsetY:number
    ) {
        const [localX, localY] = this.unprojectOffset(offsetX, offsetY)
        return this.previewMoveGateLocal(id, localX, localY)
    }

    previewMoveGateLocal(
        id:number,
        localX:number,
        localY:number
    ) { 
        const [x, y] = this.gateGrid.offsetToIndex(localX, localY)
        const gate = this.gateGrid.gates[id]
        if (!gate) return {at:[x, y], error:"Missing Gate"}
        const error = this.gateGrid.canAddGate(x, y, gate)
        return {at:[x, y], error:error}
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
        const [localX, localY] = this.unprojectOffset(offsetX, offsetY)
        this.moveGateLocal(id, localX, localY)
    }

    moveGateLocal(
        id:number,
        localX:number,
        localY:number
    ) {
        const [x, y] = this.localOffsetToIndex(localX, localY)
        console.log("moving gate ", id, " to ", x, y)

        if (!this.isLocalOffsetInGrid(localX, localY)) {
            return "Out of Bounds"
        }

        const vType = this.getGateTypeView(id)
        if (vType === undefined) return "Gate Type Not Found"
        if (!(vType.moveable === true)) {
            return "Gate Not Moveable"
        }

        const result = this.gateGrid.moveGate(id, x, y)
        if (result !== true) {
            console.log("failed move!")
            return "Failed Move"
        }

        this.renderer?.updateGate(id)

        return "Ok"
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

        const existing = this.gateGrid.graph.getAllConnectionsOnGate(id)

        const result = this.gateGrid.removeGate(id, true)
        if (result === undefined) {
            console.log("gate not found! ")
            return
        }

        existing.forEach((c) => {
            if (c) this.renderer?.updateWire(c.from)
        })

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

        const existing = this.getConnectedTo(to, input)

        const result = graph.addConnection(c)

        const outputValue = this.getGateOutputs(from)?.override.at(output)

        this.renderer?.updateWire([from, output], outputValue)
        if (existing) {
            this.renderer?.updateWire(existing, outputValue)
        }

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
                graph.removeInput([index.id, index.index])
                this.renderer?.updateWire(fromIndex) 
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
    ): [number, number] | undefined{
        const gateId = index.id
        const vType = this.getGateTypeView(gateId)
        if (vType === undefined) return undefined
        switch (index.type) {
            default:
                return [0, 0]
            case "Input":
                return vType.inputOffsets[index.index]
            case "Output":
                return vType.outputOffsets[index.index]
        }
    }

    getConnectionValue(
        index:ConnectionIndex
    ) {
        const gateId = index.id
        switch (index.type) {
            default:
            case "Input":
                const inputs = this.getGateInputs(gateId)
                if (inputs === undefined) return
                return inputs[index.index]
            case "Output":
                const outputs = this.getGateOutputs(gateId)
                if (outputs === undefined) return
                return outputs.override[index.index]
        }
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
            result.push(...this.getGateOutputLabels(g))
        }
        return result
    }

    setInput(index:[number, number], val:boolean) {
        this.gateGrid.graph.setFlow(index, val)
        this.renderer?.updateGate(index[0])
    }

    setInputs(val:ConnectionValue[]) {
        const inputs = this.gateGrid.inputs.map((g) => {
            return g?.id
        })
        const graph = this.gateGrid.graph
        graph.setFlows(val, inputs)
    }

    getOutputs() {
        let result:ConnectionValue[] = []
        for (let g of this.gateGrid.outputs) {
            if (g === undefined) {
                continue
            }
            result.push(...g.state.override.map((v) => {
                return v
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
        const [localX, localY] = this.unprojectOffset(offsetX, offsetY)
        return this.isLocalOffsetInGrid(localX, localY)
    }

    isLocalOffsetInGrid(localX:number, localY:number) {
        const grid = this.gateGrid
        const [sizeX, sizeY] = [
            grid.sizeX * 10,
            grid.sizeY * 10
        ]

        return (
            localX >= 0 && localY >= 1 &&
            localX < sizeX && localY < sizeY
        )
    }

    addGraphListener(type: GateGraphEventKey, listener: GateGraphEventListener) {
        this.gateGrid.graph.addEventListener(type, listener)
    }

    removeGraphListener(type: GateGraphEventKey, listener: GateGraphEventListener) {
        this.gateGrid.graph.removeEventListener(type, listener)
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
    private player:SignalPlayer<ConnectionValue> | undefined = undefined
    setPlayer(player:SignalPlayer<ConnectionValue>) {
        this.player = player
    }

    isPlaying() {
        return this.player?.isScrubbing() || false
    }

    getPlayerValue() {
        return this.player?.getCurrentValue()
    }

    setDesiredConnectionValues(
        data:{index:ConnectionIndex, value:ConnectionValue}[] | undefined = undefined
    ) {
        if (!data) {
            this.renderer?.clearConnectionPointDesiredValues()
            return
        }
        if (this.renderer) { data.forEach((v) => {
            this.renderer?.setConnectionPointDesiredValue(v.index, v.value)
        }) }
    }

    setDesiredOutputs(
        data:ConnectionValue[] | undefined = undefined
    ) {
        if (!data) {
            this.renderer?.clearConnectionPointDesiredValues()
            return
        }

        let d = 0
        for (let g of this.gateGrid.outputs) {
            
            if (g === undefined) {
                continue
            }

            const inputs = g.getInputs()
            
            inputs.forEach(((g:Gate, _v:ConnectionValue, i:number) => {
                this.renderer?.setConnectionPointDesiredValue({id:g.id, index:i, type:"Input"}, data[d])
                d++
            }).bind(inputs, g))
        }
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