import type { Gate } from "./Gate";
import type { Connection, GateGraph } from "./GateGraph";
import type { GateGrid } from "./GateGrid";

export class CircuitController {
    gateGrid:GateGrid

    constructor(
        gateGrid:GateGrid
    )
    {
        this.gateGrid = gateGrid
    }

    query(
        offsetX:number,
        offsetY:number
    )
    {
        const [x, y] = this.gateGrid.offsetToIndex(offsetX, offsetY)
        const gate = this.gateGrid.get(x, y)

        if (gate === undefined) {
            return undefined
        }
        const gType = gate.type

        const inputOffsets = this.gateGrid.getGateInputOffsets(gate)
        let i = 0;
        for (; i < gType.sizeIn; i++) {
            const offset = inputOffsets[i]
            const dX = offsetX - offset[0]
            const dY = offsetY - offset[1]

            const d = this.gridEuclidDistance(dX, dY)
            if (d < 10) {
                break
            }
        }

        console.log(i)

        const graph = this.gateGrid.graph
        if (i != gType.sizeIn) {
            return graph.inputs[gate.id || 0][i]
        }

        return gate
    }

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

    showConnectionPoints(id:number, connectionBuilder:(offsetX:number, offsetY:number) => string) {
        const graph = this.gateGrid.graph
        const gate = this.gateGrid.gates[id]
        if (!gate) {
            return ""
        }

        let result = 
`<g
    ${this.getGateSvgTransform(gate)}>\n`

        graph.iterConnectionsOnGate(id, (g, t, j, c) => {
            const gT = g.type
            switch (t) {
                case "input":
                    const inputOffset = this.gateGrid.indexToOffset(
                        gT.inputOffsets[j][0], gT.inputOffsets[j][1]
                    )
                    result += connectionBuilder(
                        inputOffset[1],
                        inputOffset[1])
                case "output":
                    const outputOffset = this.gateGrid.indexToOffset(
                        gT.outputOffsets[j][0], gT.outputOffsets[j][1]
                    )
                    result += connectionBuilder(
                        outputOffset[0],
                        outputOffset[1])
            }
        })

        result += "\n</g>"

        return result
    }
}