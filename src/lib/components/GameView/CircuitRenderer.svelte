<svelte:options accessors={true}/>
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import CircuitDraggable from './CircuitDraggable.svelte';
    import { GateType, GateTypeController, GateTypeView } from "$lib/circuit_types/GateType";
    import { onMount, tick } from "svelte";
    import { compose, fromString, identity, scale, toSVG, transform, translate } from "transformation-matrix";
    import { draw } from "svelte/transition";

    /**
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {CircuitDraggable}
     */
    export let circuitDraggable
    
    /**
     * @type {import("$lib/renderer_types/RendererState").RendererState}
     */
    export let rendererState = {
        translateX:0,
        translateY:0,
        scaleX:4,
        scaleY:4
    }
    
    /**
     * @type {import("$lib/renderer_types/RendererParameters").RendererParameters}
     */
    export let rendererParams = {}

    /**
     * @type {import("$lib/circuit_types/GateGraph").ConnectionType}
     */
    let connectionPointDisplayMode = ""

    /**
     * @type {SVGElement}
     */
    let svgHead

    /**
     * @param {number} tX
     * @param {number} tY
     * @param {number} sX
     * @param {number} sY
     */
    export function setTransformMatrix(tX, tY, sX, sY) {
        rendererState.translateX = tX
        rendererState.translateY = tY
        rendererState.scaleX = sX
        rendererState.scaleY = sY
        rendererState = rendererState
        return compose(translate(tX, tY), scale(sX, sY))
    }

    export function updateTransformMatrix() {
        return setTransformMatrix(
            rendererState.translateX,
            rendererState.translateY,
            rendererState.scaleX,
            rendererState.scaleY
        )
    }

    export function getTransformString() {
        return toSVG(updateTransformMatrix())
    }

    /**
     * @type {SVGGElement}
     */
    let gridGroup

    /**
     * @type {SVGGElement}
     */
    let gateGroup

    /**
     * @type {SVGElement}
     */
    let connectionGroup

    const gridSize = circuitController.getGridSize();

    const cellOffset = 10

    let viewBoxWidth = cellOffset * gridSize[0]
    let viewBoxHeight = cellOffset * gridSize[1]
    
    onMount(async () => {
        drawGrid()
        drawGates()

        linkDraggable()

        applyInitialTransformParams()
    })

    function applyInitialTransformParams() {
        const [tX, tY] = rendererParams.initialTranslate || [rendererState.translateX, rendererState.translateY]
        const [sX, sY] = rendererParams.initialScale || [rendererState.scaleX, rendererState.scaleY]
        setTransformMatrix(tX, tY, sX, sY)
    }

    export function drawGrid() {

        if (rendererParams.showGrid === false) return
        
        let grid = new Array(gridSize[0] + gridSize[1] - 2).fill("")
        const endX = cellOffset * gridSize[0]
        const endY = cellOffset * gridSize[1]
        for (let i = 0; i < gridSize[0] - 1; i++) {
            const x = cellOffset * (i + 1)
            grid[i] = svgLine(x, 0, x, endY)
        }
        for (let i = 0; i < gridSize[1] - 1; i++) {
            const y = cellOffset * (i + 1)
            grid[gridSize[0] + i - 1] = svgLine(0, y, endX, y)
        }
        gridGroup.innerHTML = grid.join('\n')
        console.log("drawing grid: ", grid)
    }

    /**
     * @param {number} id
     */
    function getGateElementAndTypeAndClean(id) {
        const cType = circuitController.getGateTypeController(id)
        const gPos = circuitController.getGatePosition(id)
        let svg = gateGroup.querySelector(`#${gateIdString(id)}`)
        if (cType === undefined || gPos === undefined) {
            //if an svg element exists but not the gate, remove the gate and all associated connections
            if (svg instanceof SVGElement) {
                console.log("clearing gate",id)
                gateGroup.removeChild(svg)
            }
            //otherwise, it just doesn't exist, can't do anything with that
            else {
                console.log("tried to update nonexistent gate",id)   
            }
        }
        //if everything exists, return all the needed data
        else {
            return {svg:svg, cType:cType, gPos:gPos}
        }
    }
    
    /**
     * @param {number} id
     */
    export function updateGate(id) {

        const result = getGateElementAndTypeAndClean(id)
        if (result === undefined) return
        let svg = result.svg
        const cType = result.cType
        const gPos = result.gPos

        const gateInner = svgGate(cType, id)
        const gateTransform = svgGridTransform(gPos[0], gPos[1])
        if (svg instanceof SVGElement) {
            svg.setAttribute('transform',gateTransform)
            svg.innerHTML = gateInner
        }
        else {
            const idString = gateIdString(id)
            svg = svgWrapGroup(
                gateInner,
                gateTransform,
                idString
            )
            gateGroup.appendChild(svg)
        }

        for (let i = 0; i < cType.view.sizeOut; i++) {
            updateWire([id, i])
        }
        for (let i = 0; i < cType.view.sizeIn; i++) {
            const fromIndex = circuitController.getConnectedTo(id, i)
            if (fromIndex) updateWire(fromIndex)
        }

        console.log("drawing gate:",id,svg)
    }

    /**
     * @param {[number, number]} index
     * 
     * @param {import("$lib/circuit_types/GateType").ConnectionValue[] | undefined} outputs 
     * the outputs of the gate the connection is being drawn from, 
     * used to determine the color of the connection
     */
    export function updateWire(index, outputs = undefined) {
        
        if (rendererParams.showWires === false) return

        //if a list of outputs is missing, try to retrieve one from the controller
        if (outputs === undefined) outputs = circuitController.getGateOutputs(index[0])?.override

        const idString = wireIdString(index)
        let svg = document.querySelector(`#${wireIdString(index)}`)

        //check that all of the connection's endpoints exist, and that it's source gate exists
        const toIndices = circuitController.getConnectedFrom(index[0], index[1])
        let result = getGateElementAndTypeAndClean(index[0])
        if (result === undefined || outputs === undefined || toIndices === undefined) {
            if (svg) connectionGroup.removeChild(svg)
            return
        }

        //get the color of the connection and it's starting position
        const value = outputs[index[1]]
        const fVType = result.cType.view
        let localOffset = fVType.outputOffsets[index[1]]
        console.log(fVType, index)
        /**
         * @type {[number, number]}
         */
        const outputOffset = [localOffset[0] + result.gPos[0] * 10, localOffset[1] + result.gPos[1] * 10]

        //get the endpoint positions and pair them with the starting position to draw wires to a string array
        /**
         * @type {string[]}
         */
        const wires = []
        for (const toIndex of toIndices) {
            result = getGateElementAndTypeAndClean(toIndex[0])
            if (result === undefined) continue
            const tVType = result.cType.view
            localOffset = tVType.inputOffsets[toIndex[1]]
            /**
             * @type {[number, number]}
             */
            const inputOffset = [localOffset[0] + result.gPos[0] * 10, localOffset[1] + result.gPos[1] * 10]

            wires.push(drawWire(outputOffset, inputOffset, value))
        }

        //check if the connection is already rendered
        if (svg instanceof SVGElement) {
            svg.innerHTML = wires.join()
        }
        else {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", 'g')
            svg.setAttribute('id', idString)
            svg.innerHTML = wires.join()
            connectionGroup.appendChild(svg)
        }

        console.log("Updating wires: ", index, wires)
    }

    export function drawGates() {
        const c = circuitController.getNumGates()
        for (let i = 0; i < c; i++) {
            updateGate(i)
        }
    }

    async function linkDraggable() {
        await tick()

        const controller = circuitDraggable.getController()
        controller.dragCircuitHandler = onDragCircuit
        controller.dragEndHandler = clearActives

        const activeWire = document.createElementNS("http://www.w3.org/2000/svg", 'g')
        activeWire.setAttribute('id', "wire-active")
        connectionGroup.appendChild(activeWire)

        const activeGate = document.createElementNS("http://www.w3.org/2000/svg", 'g')
        activeGate.setAttribute('id', "gate-active")
        gateGroup.appendChild(activeGate)
    }

    /**
     * @param {MouseEvent} e
     */
    function onDragCircuit(e) {
        switch (circuitDraggable.getController().getContentType()) {
            case "Input":
            case "Output":
                drawActiveWire(e)
                break
            case "Gate":
                drawActiveGate(e)
                break
        }
    }

    /**
     * @param {MouseEvent} e
     */
    export function drawActiveWire(e) {
        if (e.target !== svgHead.parentElement) return

        const controller = circuitDraggable.getController()

        const source = controller.getContents()
        const gPos = source.getPos()
        const cType = source.gateTypeController
        const id = source.getId()
        const index = source.connectionIndex

        const target = circuitController.query(e.offsetX, e.offsetY)
        const activeWire = connectionGroup.querySelector("#wire-active")
        
        if (activeWire === null || gPos === undefined || index === undefined || cType === undefined) return
        /**
         * @type {[number, number] | null}
         */
        let fromOffset
        let localOffset
        switch (source.type) {
            case "Input": 
                localOffset = cType.view.inputOffsets[index]
                fromOffset = [gPos[0] * 10 + localOffset[0], gPos[1] * 10 + localOffset[1]]
                break
            case "Output": 
                localOffset = cType.view.outputOffsets[index]
                fromOffset = [gPos[0] * 10 + localOffset[0], gPos[1] * 10 + localOffset[1]]
                break
            default: return
        }

        activeWire.setAttribute('stroke', 'gray')
        if (target.type !== "" && target.type !== source.type && target.type !== "Gate") {
            const v = circuitController.getConnectionValue(
                {id:id || 0, index:index, type:source.type}
            )
            activeWire.setAttribute('stroke',v?'var(--connection-color-on)':'var(--connection-color-off')
        }

        activeWire.innerHTML = drawWire(fromOffset, circuitController.unprojectOffset(e.offsetX, e.offsetY))
    }

    export function clearActiveWire() {
        const activeWire = connectionGroup.querySelector("#wire-active")
        if (activeWire === null) return
        console.log("erasing active wire")
        activeWire.innerHTML = ""
    }

    /**
     * @param {MouseEvent} e
     */
    export function drawActiveGate(e) {
        if (e.target !== svgHead.parentElement) return
        const controller = circuitDraggable.getController()
        const cType = controller.getGateType()
        const id = controller.getId()
        let gPos
        let svg = gateGroup.querySelector(`#gate-active`)
        console.log("previewing ", cType, "with id", id)
        if (id && cType) {
            gPos = circuitController.previewMoveGate(id, e.offsetX, e.offsetY)
        } else if (cType) {
            gPos = circuitController.previewAddGate(cType, e.offsetX, e.offsetY)
        }
        else return

        if (svg) {
            svg.setAttribute('stroke','black')
            if (!gPos) {
                const localOffset = circuitController.unprojectOffset(e.offsetX, e.offsetY)
                gPos = circuitController.offsetToIndex(localOffset[0], localOffset[1])
                svg.setAttribute('stroke','gray')
            }
            const transform = svgGridTransform(gPos[0], gPos[1])
            svg.setAttribute('transform', transform)
            svg.innerHTML = svgGate(cType, id)
            
        }
    }

    export function clearActiveGate() {
        const activeGate = gateGroup.querySelector("#gate-active")
        if (activeGate === null) return
        activeGate.innerHTML = ""
    }

    export function clearActives() {
        console.log("dropping")
        clearActiveGate()
        clearActiveWire()
    }

    /**
     * 
     * @param {number} id
     */
    function gateIdString(id) {
        return `gate-${id}`
    }

    /**
     * @param {[number | string, number | string]} index
     */
    function wireIdString(index) {
        return `wire-${index[0]}-${index[1]}`
    }

    /**
     * Return an svg transform group containing the string inner
     * @param {string} inner the svg being wrapped
     * @param {string} transform the transform of the group
     * @param {string} id the element id of the group
     */
    function svgWrapGroup(inner, transform, id) {
        const elem = document.createElementNS("http://www.w3.org/2000/svg","g")
        elem.setAttribute("transform", transform)
        elem.setAttribute("id", id)
        elem.innerHTML = inner
        return elem
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    function svgGridTransform(x, y) {
        return `translate(${cellOffset * x}, ${cellOffset * y}) `
    }

    /**
     * @param {number} fromX
     * @param {number} fromY
     * @param {number} toX
     * @param {number} toY
     * @param {string} params
     */
    function svgLine(fromX, fromY, toX, toY, params="") {
        return `<path d="M ${fromX} ${fromY} L ${toX} ${toY}" ${params} />`
    }
    
    /**
     * @param {GateTypeController} cType
     * @param {number | import("$lib/circuit_types/Gate").GateState | undefined} idOrState
     */
    function svgGate(cType, idOrState=undefined) {
        let state = typeof idOrState === "number" ? circuitController.getGateState(idOrState) : idOrState
        if (state === undefined) state = cType.generateDefaultState()
        const body = rendererParams.showGates === false ? "" : cType.view.draw(state)

        return body + svgConnectionPoints(cType, state)
    }

    /**
     * @param {import("$lib/circuit_types/GateType").ConnectionValue} value
     */
    function connectionValueToColor(value) { 
        let color = ""
        switch (value) {
            case true: 
                color = `stroke="var(--connection-color-on)"`
                break
            case false: 
                color = `stroke="var(--connection-color-off)"`
                break
        }
        return color
    }

    /**
     * @param {number} offsetX
     * @param {number} offsetY
     * @param {import("$lib/circuit_types/GateType").ConnectionValue} value
     */
    function svgConnectionPoint(offsetX, offsetY, value = undefined) {
        const color = connectionValueToColor(value)
        return `<path d="M ${offsetX - 1} ${offsetY - 1} l 2 1 l -2 1 Z" stroke-width=".25px" ${color} />`
    }

    /**
     * @param {GateTypeController} cType
     * @param {number | import("$lib/circuit_types/Gate").GateState} idOrState
     */
    function svgConnectionPoints(cType, idOrState) { 
        const state = (typeof idOrState === "number" ? circuitController.getGateState(idOrState) : idOrState) || {override:[]}

        const inputs = rendererParams.showConnectionPoints === false ? [] : cType.view.inputOffsets.map((o, i) => {
            return svgConnectionPoint(o[0], o[1], state.override[i])
        })

        const outState = cType.model.f(state) //temp hack, state should store outputs too
        const outputs =  rendererParams.showConnectionPoints === false ? [] : cType.view.outputOffsets.map((o, i) => {
            return svgConnectionPoint(o[0], o[1], outState.override[i])
        })

        switch (connectionPointDisplayMode) {
            case "": return inputs.join() + outputs.join()
            case "Input": return inputs.join()
            case "Output": return outputs.join()
        }
    }

    /**
     * @param {[number, number]} from
     * @param {[number, number]} to
     * @param {import("$lib/circuit_types/GateType").ConnectionValue} value
     */
    function drawWire(from, to, value = undefined) {
        const color = connectionValueToColor(value)
        return `<path d="M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}" ${color} />`
    }

</script>

<svg 
    class="circuit-svg" 
    viewBox="
        {-rendererState.translateX} 
        {-rendererState.translateY} 
        {rendererState.scaleX * gridSize[0] * cellOffset + rendererState.translateX} 
        {rendererState.scaleY * gridSize[1] * cellOffset + rendererState.translateY}
    " width="{rendererState.scaleX * gridSize[0] * cellOffset + rendererState.translateX}px"
    bind:this={svgHead}
>
    <g transform="scale({rendererState.scaleX}, {rendererState.scaleY})">
        <g bind:this={gridGroup} id="circuit-svg-lines" stroke="var(--grid-color)" stroke-width="0.25px" fill="none"></g>
        <g bind:this={gateGroup} id="circuit-svg-gates" stroke="var(--gate-color)" stroke-width="0.5px" fill="none"></g>
        <g bind:this={connectionGroup} id="circuit-svg-connections" stroke="var(--gate-color)" stroke-width="0.5px" fill="none"></g>
    </g>  
</svg>

<style>
    .circuit-svg {
        pointer-events: none;
        display: flex;
    }
</style>