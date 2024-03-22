<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { GateType } from "$lib/circuit_types/GateType";
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
    export function updateGate(id) {

        const gType = circuitController.getGateType(id)
        const gPos = circuitController.getGatePosition(id)
        const idString = gateIdString(id)
        let svg = gateGroup.querySelector(`#${gateIdString(id)}`)
        if (gType === undefined || gPos === undefined) {
            if (svg instanceof SVGElement) {
                gateGroup.removeChild(svg)
            }
            else {
                console.log("tried to update nonexistend gate",id)   
            }
        }
        else {
            const gateInner = svgGate(gType, id)
            const gateTransform = svgGridTransform(gPos[0], gPos[1])
            if (svg instanceof SVGElement) {
                svg.setAttribute('transform',gateTransform)
                svg.innerHTML = gateInner
            }
            else {
                svg = svgWrapGroup(
                    gateInner,
                    gateTransform,
                    idString
                )
                gateGroup.appendChild(svg)
            }
            
            console.log("drawing gate:",id,svg)
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
     * @param {GateType} gType
     * @param {number} id
     */
    function svgGate(gType, id) {
        return `<circle r="8" cx="10" cy="10" />`
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