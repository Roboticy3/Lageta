<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { GateType, GateTypeController, GateTypeView } from "$lib/circuit_types/GateType";
    import { drawConnectionPoint } from "$lib/dat/GateTypes/GateTypes";
    import { onMount } from "svelte";
    import { compose, fromString, identity, scale, toSVG, transform, translate } from "transformation-matrix";

    /**
     * @type {CircuitController}
     */
    export let circuitController

    let translateX = 0
    let translateY = 0
    let scaleX = 3
    let scaleY = 3

    export let showGates = true
    export let showConnectionPoints = true
    export let showWires = true

    /**
     * @type {import("$lib/circuit_types/GateGraph").ConnectionType}
     */
    let connectionDisplayMode = ""

    /**
     * @type {import("transformation-matrix").Matrix}
     */
    let transformMatrix = compose(translate(translateX, translateY), scale(scaleX, scaleY))

    /**
     * @param {number} tX
     * @param {number} tY
     * @param {number} sX
     * @param {number} sY
     */
     export function setTransformMatrix(tX, tY, sX, sY) {
        transformMatrix = compose(translate(tX, tY), scale(sX, sY))
        translateX = tX
        translateY = tY
        scaleX = sX
        scaleY = sY
    }

    export function getTransformMatrix() {
        return transformMatrix
    }

    export function getTransformString() {
        return toSVG(transformMatrix)
    }

    /**
     * @type {SVGGElement}
     */
    let gridGroup

    /**
     * @type {SVGGElement}
     */
    let gateGroup

    const gridSize = circuitController.getGridSize();

    const cellOffset = 10

    let viewBoxWidth = cellOffset * gridSize[0]
    let viewBoxHeight = cellOffset * gridSize[1]
    
    onMount(() => {
        drawGrid()
        drawGates()
    })

    export function drawGrid() {
        
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
            if (svg instanceof SVGElement) {
                gateGroup.removeChild(svg)
            }
            else {
                console.log("tried to update nonexistent gate",id)   
            }
        }
        else {
            return {svg:svg, cType:cType, gPos:gPos}
        }
    }
    
    /**
     * @param {number} id
     */
    export function updateGate(id) {

        if (!showGates) return

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

        console.log("drawing gate:",id,svg)
        
    }

    export function drawGates() {
        const c = circuitController.getNumGates()
        for (let i = 0; i < c; i++) {
            updateGate(i)
        }
    }

    /**
     * 
     * @param {number} id
     */
    function gateIdString(id) {
        return `gate-${id}`
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
     * @param {number | import("$lib/circuit_types/Gate").GateState} idOrState
     */
    function svgGate(cType, idOrState) {
        const state = typeof idOrState === "number" ? circuitController.getGateState(idOrState) : idOrState
        if (state === undefined) return `<text fill="black">gate ${idOrState}</text>`
        const body = showGates ? cType.view.draw(state) : ""     

        return body + svgConnectionPoints(cType, state)
    }

    /**
     * @param {GateTypeController} cType
     * @param {number | import("$lib/circuit_types/Gate").GateState} idOrState
     */
    function svgConnectionPoints(cType, idOrState) { 
        const state = (typeof idOrState === "number" ? circuitController.getGateState(idOrState) : idOrState) || {override:[]}

        const inputs = showConnectionPoints ? cType.view.inputOffsets.map((o, i) => {
            return drawConnectionPoint(o[0], o[1], state.override[i])
        }) : []

        const outState = cType.model.f(state)
        const outputs = showConnectionPoints ? cType.view.outputOffsets.map((o, i) => {
            return drawConnectionPoint(o[0], o[1], outState.override[i])
        }) : []

        console.log(inputs, outputs)

        return inputs.join() + outputs.join()
    }

</script>

<svg 
    class="circuit-svg" 
    viewBox="
        {-translateX} 
        {-translateY} 
        {scaleX * gridSize[0] * cellOffset + translateX} 
        {scaleY * gridSize[1] * cellOffset + translateY}
    " width="{scaleX * gridSize[0] * cellOffset + translateX}px">
    <g transform="scale({scaleX}, {scaleY})">
        <g bind:this={gridGroup} id="circuit-svg-lines" stroke="var(--grid-color)" stroke-width="0.25px" fill="none"></g>
        <g bind:this={gateGroup} id="circuit-svg-gates" stroke="var(--gate-color)" stroke-width="0.5px" fill="none"></g>
    </g>  
</svg>

<style>
    .circuit-svg {
        pointer-events: none;
        display: flex;
    }
</style>