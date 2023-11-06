import type { Gate } from "./Gate";
import { GateGraph } from "./GateGraph"
import type { Connection } from "./GateGraph";
import { GateGrid } from "./GateGrid";

const connectionSelectRadius = 10

export class CircuitControllerQueryResult {
    object:Gate | Connection | undefined
    type: "Gate" | "Input" | "Output" | ""

    constructor(
        object:Gate | Connection | undefined = undefined,
        type:"Gate" | "Input" | "Output" | "" = ""
    ) {
        this.object = object
        this.type = type
    }
}

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
            new CircuitControllerQueryResult(
                graph.inputs[gate.id || 0][i],
                "Input"
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
            new CircuitControllerQueryResult(
                graph.outputs[gate.id || 0][i],
                "Output"
            ) 
        }

        return new CircuitControllerQueryResult(
            gate,
            "Gate"
        ) 
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

        const newSvg = (
`
<g 
    id="${gType.name}-${gateId}" 
    ${this.getGateSvgTransform(gate)}>
    ${getGateSvgContents(gType.name)}
</g>
`
        )
        
        svgContents.push(newSvg)
        
        console.log(this.gateGrid.graph)
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

    svgIdToGateId(id:string) {
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
            svg[i] = `<path d="M ${hpos} 0 L ${hpos} ${offsetHeight}" stroke="${color}"/>`
        }
        for (let j = 0; j < grid.sizeY; j++) {
            const vpos = j * grid.cellOffset
            svg[grid.sizeX + j] = `<path d="M 0 ${vpos} L ${offsetWidth} ${vpos}" stroke="${color}"/>`
        }

        return svg
    }

    gridEuclidDistance(dX:number, dY:number) {
        return Math.sqrt(dX * dX + dY * dY)
    }

    showConnectionPoints(connectionBuilder:(offsetX:number, offsetY:number) => string) {
        const graph = this.gateGrid.graph
        let result = ""

        graph.iterConnections((g, t, j, _c) => {
        const inputOffsets = this.gateGrid.getGateInputOffsets(g)
        const outputOffsets = this.gateGrid.getGateOutputOffsets(g)
            switch (t) {
                case "input":
                    result += connectionBuilder(
                        inputOffsets[j][0],
                        inputOffsets[j][1])
                    break
                case "output":
                    result += connectionBuilder(
                        outputOffsets[j][0],
                        outputOffsets[j][1])
                    break
            }
        })

        return result
    }

    indexToOffset(x:number, y:number) {
        return this.gateGrid.indexToOffset(x,y)
    }
}