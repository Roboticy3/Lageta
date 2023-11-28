import { ConnectionSvg, wireSvg } from "$lib/components/GateSvgs.svelte";
import type { Gate } from "./Gate";
import { GateGraph, Connection, type ConnectionType } from "./GateGraph"
import { GateGrid } from "./GateGrid";

const connectionSelectRadius = 10

export class CircuitControllerQueryResult {
    gate:Gate | undefined

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

//using grid controller should avoid directly interfacing with things like gate indices and the grid and graph objects
//view still interacts with gate objects from time to time, but other types should be wrapped here
export class CircuitController {
    gateGrid:GateGrid

    constructor(
        gateGrid:GateGrid | undefined = undefined
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

        this.makeMainController()
    }

    query(
        offsetX:number,
        offsetY:number
    )
    {
        const [x, y] = this.gateGrid.offsetToIndex(offsetX, offsetY)
        const gate = this.gateGrid.get(x, y)
        const graph = this.gateGrid.graph

        if (gate === undefined) {
            return new CircuitControllerQueryResult() 
        }
        const gType = gate.type

        const inputOffsets = this.gateGrid.getGateInputOffsets(gate)
        let i = 0;
        for (; i < gType.sizeIn; i++) {
            const offset = inputOffsets[i]
            const dX = offsetX - offset[0]
            const dY = offsetY - offset[1]

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
            const dX = offsetX - offset[0]
            const dY = offsetY - offset[1]

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

    getGateFromSvgId(gateId:string) {
        const id = this.svgIdToGateId(gateId)

        return this.gateGrid.gates[id]
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

        const scale = [
            gType.gridWidth * this.gateGrid.cellOffset / 20,
            gType.gridHeight * this.gateGrid.cellOffset / 20
        ]

        return `transform="translate(${snappedX} ${snappedY}) scale(${scale[0]} ${scale[1]})"`
    }

    addGate(
        gate:Gate, 
        offsetX:number, 
        offsetY:number, 
        svgContents:Array<string>, 
        getGateSvgContents: (name:string) => string
    ) {
        console.log("adding gate: ", gate)
        const gType = gate.type

        const gateId = this.gateGrid.gates.length
        let [x, y] = this.gateGrid.offsetToIndex(offsetX, offsetY)
        const result = this.gateGrid.addGate(x, y, gate)
        if (result === undefined) {
            console.log("failed add!")
            return
        }
        
        svgContents.push(this.addGateSvg(gate, getGateSvgContents))
        
        console.log(this.gateGrid.graph)
    }

    addGateSvg(gate:Gate, getGateSvgContents: (name:string) => string) {
        const gType = gate.type
        const newSvg = (
`
<g 
    id="${gType.name}-${gate.id || 0}" 
    ${this.getGateSvgTransform(gate)}>
    ${getGateSvgContents(gType.name)}
</g>
`
        )
        
        return newSvg
    }

    moveGate(
        gateId:string, 
        offsetX:number, 
        offsetY:number, 
        svgContents:Array<string>, 
        getGateSvgContents: (name:string) => string
    ) {
        console.log("moving gate: ", gateId)

        const id = this.svgIdToGateId(gateId)

        const gate = this.gateGrid.gates[id]
        if (!gate) {
            return
        }
        const gType = gate.type

        let [x, y] = this.gateGrid.offsetToIndex(offsetX, offsetY)

        const result = this.gateGrid.moveGate(id, x, y)
        if (result === undefined) {
            console.log("failed move!")
            return
        }
        const newSvg = (
`
<g 
    id="${gateId}" 
    ${this.getGateSvgTransform(gate)}>
    ${getGateSvgContents(gType.name)}
</g>
`
        )
        
        svgContents[id] = newSvg

        console.log(this.gateGrid)
    }

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

    getGate(gateId:number) {
        return this.gateGrid.gates[gateId]
    }

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

    removeConnection(
        gateId:number, 
        type:ConnectionType, 
        index:number
    ) {
        const graph = this.gateGrid.graph

        
        switch (type) {
            case "Input":
                graph.removeInput([gateId, index])
                break
            case "Output":
                const c = graph.outputs[gateId][index]
                if (c === undefined) {
                    break
                }
                graph.removeOutput(c)
                break
        }

        console.log(graph)
    }

    getConnectedTo(
        gateId:number,
        index:number
    ) {
        const graph = this.gateGrid.graph
        
        const c = graph.inputs[gateId][index]
        console.log(c)

        return c?.from
    }

    getConnectionPoint(
        gate:Gate,
        type:ConnectionType,
        index:number,
    ) {
        switch (type) {
            default:
            case "Input":
                return this.gateGrid.getGateInputOffset(gate, index)
            case "Output":
                return this.gateGrid.getGateOutputOffset(gate, index)
        }
    }

    private svgIdToGateId(id:string) {
        const idParts = id.split("-")
        return Number(idParts[1])
    }

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

    setGridCellOffset(offset:number) {
        this.gateGrid.cellOffset = offset
    }

    gridEuclidDistance(dX:number, dY:number) {
        return Math.sqrt(dX * dX + dY * dY)
    }

    drawConnectionPoints(connectionBuilder:(offsetX:number, offsetY:number) => string, type:ConnectionType="") {
        const graph = this.gateGrid.graph
        let result = ""

        graph.iterConnectionPoints((g, t, j) => {
            const inputOffsets = this.gateGrid.getGateInputOffsets(g)
            const outputOffsets = this.gateGrid.getGateOutputOffsets(g)
            switch (t) {
                case "Input":
                    result += connectionBuilder(
                        inputOffsets[j][0],
                        inputOffsets[j][1])
                    break
                case "Output":
                    result += connectionBuilder(
                        outputOffsets[j][0],
                        outputOffsets[j][1])
                    break
            }
        }, type)
        
        return result
    }

    drawWires(wireBuilder:(fromOffset:[number, number], toOffset:[number, number]) => string) {
        const graph = this.gateGrid.graph
        let result = new Array<string>()
        
        graph.iterConnections((f, o, t, i, _c) => {
            const fOffsets = this.gateGrid.getGateOutputOffsets(f)
            const tOffsets = this.gateGrid.getGateInputOffsets(t)
            result.push(wireSvg(fOffsets[o], tOffsets[i]))
        })

        return result
    }

    indexToOffset(x:number, y:number) {
        return this.gateGrid.indexToOffset(x,y)
    }

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

    makeMainController() {
        mainController = this
    }
}

export var mainController:CircuitController | undefined = undefined