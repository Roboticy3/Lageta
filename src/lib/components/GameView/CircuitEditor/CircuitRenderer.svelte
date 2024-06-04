<svelte:options accessors={true}/>
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import CircuitDraggable from './CircuitDraggable.svelte';
    import { GateType, GateTypeController, GateTypeView } from "$lib/circuit_types/GateType";
    import { onMount, tick } from "svelte";
    import { compose, fromString, identity, scale, toSVG, transform, translate } from "transformation-matrix";
    import { draw } from "svelte/transition";
    import ResizingSvg from "$lib/components/Misc/ResizingSvg.svelte";
    import { CircuitRendererIDStandard } from "$lib/circuit_types/CircuitRendererIDSpace";
    import { browser } from "$app/environment";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";

    /**
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {CircuitDraggable}
     */
    export let circuitDraggable

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
     */
    export let editorEventTarget

    /**
     * @type {any}
     */
    export let rendererParams = {}
    $: if(svgHead) updateParams(rendererParams)

    /**
     * @param {any} _params
     */
    function updateParams(_params) {
        drawGates()
        drawGrid()
    }

    /**
     * @type {import("$lib/circuit_types/GateGraph").ConnectionType}
     */
    let connectionPointDisplayMode = ""

    /**
     * @type {SVGElement}
     */
    let svgHead
    export function getSvgHead() {
        return svgHead
    }

    /**
     * @type {ResizingSvg}
     */
    let resizer
    /**
     * @param {[number, number]} offset
     */
    export function toLocal(offset) {
        return resizer.outerOffsetToInner(offset)
    }
    /**
     * @param {[number, number]} offset
     */
     export function toGlobal(offset) {
        return resizer.innerOffsetToOuter(offset)
    }

    export function getMatrix() {
        return resizer.getMatrix()
    }

    export function triggerResize() {
        resizer.correct()
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

    const idSpace = new CircuitRendererIDStandard()

    const gridSize = circuitController.getGridSize();

    const cellOffset = 10

    let viewBoxWidth = cellOffset * gridSize[0]
    let viewBoxHeight = cellOffset * gridSize[1]
    
    onMount(async () => {
        updateParams(rendererParams)

        linkDraggable()

        svgHead.setAttribute('id', idSpace.headIdString())
    })

    export function drawGrid() {

        if (rendererParams.showGrid !== true) return
        
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
     * @returns {{svg:SVGElement | null, cType:GateTypeController, gPos:[number,number]} | undefined}
     */
    function getGateElementAndTypeAndClean(id) {
        const cType = circuitController.getGateTypeController(id)
        const gPos = circuitController.getGatePosition(id)
        let svg = gateGroup.querySelector(`#${idSpace.gateIdString(id)}`)
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
            return {svg: (svg instanceof SVGElement ? svg:null), cType:cType, gPos:gPos}
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

        const gateInner = svgGateBody(cType, id)
        const gateTransform = svgGridTransform(gPos[0], gPos[1])
        const idString = idSpace.gateIdString(id)
        if (svg instanceof SVGElement) {
            svg.setAttribute('transform',gateTransform)
        }
        else {
            svg = svgWrapGroup('', gateTransform, idString)
            gateGroup.appendChild(svg)
        }

        setChild(svg, svgWrapGroup(gateInner, '', `${idString}-body`))
        const points =  svgConnectionPoints(cType, id, circuitController.getGateState(id) || cType.generateDefaultState())
        console.log(points)
        for (let p of points) {
            setChild(svg, p)
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
     * @param {Element} head
     * @param {Element} newChild
     */
    function setChild(head, newChild) {
        if (newChild.parentElement === head) return
        const id = newChild.getAttribute('id')
        const existing = head.querySelector(`#${id}`)
        if (existing) head.replaceChild(newChild, existing) //why on earth are the arguments ordered this way? 15 minutes down the drain...
        else head.appendChild(newChild)
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

        const idString = idSpace.wireIdString(index)
        let svg = document.querySelector(`#${idSpace.wireIdString(index)}`)

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
            svg.innerHTML = wires.join('')
        }
        else {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", 'g')
            svg.setAttribute('id', idString)
            svg.innerHTML = wires.join('')
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

        editorEventTarget?.addEventListener("drag", onDragCircuit)
        editorEventTarget?.addEventListener("drop", clearActives)

        const activeWire = document.createElementNS("http://www.w3.org/2000/svg", 'g')
        activeWire.setAttribute('id', "wire-active")
        connectionGroup.appendChild(activeWire)

        const activeGate = document.createElementNS("http://www.w3.org/2000/svg", 'g')
        activeGate.setAttribute('id', "gate-active")
        gateGroup.appendChild(activeGate)
    }

    /**
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEvent} param0
     */
    function onDragCircuit({from, to}) {
        switch (from.type) {
            case "Input":
            case "Output":
                drawActiveWire({from, to})
                break
            case "Gate":
                drawActiveGate({from, to})
                break
        }
    }

    /**
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEvent} param0
     */
     export function drawActiveWire({from, to}) {
        const localOffset = to.getLocalOffset()
        if (!localOffset) return
        const [localX, localY] = localOffset

        const source = from
        const gPos = source.getPos()
        const cType = source.gateTypeController
        const index = source.connectionIndex

        const target = to
        const activeWire = connectionGroup.querySelector("#wire-active")
        
        if (activeWire === null || gPos === undefined || index === undefined || cType === undefined) return
        /**
         * @type {[number, number] | null}
         */
        let fromOffset
        let connectionOffset
        switch (source.type) {
            case "Input": 
                connectionOffset = cType.view.inputOffsets[index]
                fromOffset = [gPos[0] * 10 + connectionOffset[0], gPos[1] * 10 + connectionOffset[1]]
                break
            case "Output": 
                connectionOffset = cType.view.outputOffsets[index]
                fromOffset = [gPos[0] * 10 + connectionOffset[0], gPos[1] * 10 + connectionOffset[1]]
                break
            default: return
        }

        activeWire.setAttribute('stroke', 'gray')
        let value = undefined
        switch (source.type) {
            case "Input":
                if (target.type === "Output")
                    value = circuitController.getConnectionValue({id:target.getId() || 0, type:"Output", index:target.connectionIndex || 0})
                break
            case "Output":
                value = circuitController.getConnectionValue({id:source.getId() || 0, type:"Output", index:source.connectionIndex || 0})
        }

        activeWire.innerHTML = drawWire(fromOffset, localOffset, value)
    }

    export function clearActiveWire() {
        const activeWire = connectionGroup.querySelector("#wire-active")
        if (activeWire === null) return
        console.log("erasing active wire")
        activeWire.innerHTML = ""
    }

    /**
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEvent} param0
     */
     export function drawActiveGate({from, to}) {

        const localOffset = to.getLocalOffset()
        if (!localOffset) return

        const [localX, localY] = localOffset

        const cType = from.getGateType()
        const id = from.getId()

        let previewResult
        let svg = gateGroup.querySelector(`#gate-active`)
        console.log("previewing ", cType, "with id", id)

        if (id && cType) {
            previewResult = circuitController.previewMoveGateLocal(id, localX, localY)
        } else if (cType) {
            previewResult = circuitController.previewAddGateLocal(cType, localX, localY)
        }
        else return

        if (svg) {
            svg.setAttribute('stroke','black')
            let gPos = previewResult.at
            if (previewResult.error != "") {
                svg.setAttribute('stroke','gray')
            }
            const transform = svgGridTransform(gPos[0], gPos[1])
            svg.setAttribute('transform', transform)
            svg.appendChild(svgWrapGroup(svgGateBody(cType, id)))
            
        }
    }

    export function clearActiveGate() {
        const activeGate = gateGroup.querySelector("#gate-active")
        if (activeGate === null) return
        activeGate.innerHTML = ""
    }

    export function clearActives() {
        clearActiveGate()
        clearActiveWire()
    }

    /**
     * 
     * @param {import("$lib/circuit_types/CircuitController").ConnectionIndex} index
     */
    

    /**
     * Return an svg transform group containing the string inner
     * @param {string} inner the svg being wrapped
     * @param {string | undefined} transform the transform of the group
     * @param {string | undefined} id the element id of the group
     */
    function svgWrapGroup(inner, transform = undefined, id = undefined) {
        const elem = document.createElementNS("http://www.w3.org/2000/svg","g")
        if (transform) elem.setAttribute("transform", transform)
        if (id) elem.setAttribute("id", id)
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
    function svgGateBody(cType, idOrState) {
        if (rendererParams.showGates === false) return ""
        const state = (typeof idOrState === "object" ? 
            idOrState : 
            (idOrState === undefined ?  
                cType.generateDefaultState() : 
                (circuitController.getGateState(idOrState) || cType.generateDefaultState())
            )
        )
        const id = typeof idOrState === "number" ? idOrState : undefined
        return cType.view.draw(state)
    }

    /**
     * @param {import("$lib/circuit_types/GateType").ConnectionValue} value
     */
    function connectionValueToColor(value) { 
        let color = ""
        switch (value) {
            case true: 
                color = `var(--connection-color-on)`
                break
            case false: 
                color = `var(--connection-color-off)`
                break
            default:
                color = `black`
                break
        }
        return color
    }

    /**
     * @param {import("$lib/circuit_types/GateType").ConnectionValue} value
     * @param {string} label
     */
    function svgConnectionPoint(value = undefined, label = "", extraValueParams = "", extraLabelParams = `x="4"`) {
        const color = connectionValueToColor(value)
        return `
<path d="M -1 -1 l 2 1 l -2 1 Z" stroke-width=".25px" stroke="${color}" ${extraValueParams}/>\n
${rendererParams.showLabels !== false ? `<text stroke="none" fill="${color}" font-size="0.2em" ${extraLabelParams}>${label}</text>`:""}
        `
    }

    /**
     * @param {import("$lib/circuit_types/CircuitController").ConnectionIndex} index
     * @param {import("$lib/circuit_types/GateType").ConnectionValue} value
    */
    export function setConnectionPointDesiredValue(index, value) {
        const pointIdString = idSpace.connectionPointIdString(index)
        const point = svgHead.querySelector(`#${pointIdString}`)
        const parent = point?.parentElement
        if (!point || !parent) return
        const transform = point.getAttribute('transform') || ""
        const inner = svgConnectionPointDesiredValue(value)
        setChild(parent, svgWrapGroup(inner, transform, idSpace.connectionPointDesiredValueIdString(index)))
    }

    export function clearConnectionPointDesiredValues() {
        const indicators = svgHead.querySelectorAll('[id^="point-target-"]')
        for (let element of indicators) {
            element.remove()
        }
    }

    /**
     * 
     * @param {import("$lib/circuit_types/GateType").ConnectionValue} value
     */
    function svgConnectionPointDesiredValue(value) {
        let color = `var(--connection-color-x)`
        if (value === true) color = `var(--connection-color-on)`
        else if (value === false) color = `var(--connection-color-off)`
        return `<circle r="2.5" stroke="${color}" stroke-dasharray="1" fill="none"/>`
    }

    /**
     * @param {GateTypeController} cType
     * @param {number} id
     * @param {import("$lib/circuit_types/Gate").GateState} state
     */
    function svgConnectionPoints(cType, id, state) { 
        const inputs = rendererParams.showConnectionPoints === false ? [] : cType.view.inputOffsets.map((o, i) => {
            return svgWrapGroup(svgConnectionPoint(
                state.override[i], cType.view.inputLabels[i], "", `x="-16"`
            ), `translate(${o[0]} ${o[1]})`, idSpace.connectionPointIdString({id:id, type:"Input", index:i}))
        })

        const outState = cType.model.f(state) //temp hack, state should store outputs too
        const outputs =  rendererParams.showConnectionPoints === false ? [] : cType.view.outputOffsets.map((o, i) => {
            return svgWrapGroup(svgConnectionPoint(
                outState.override[i], cType.view.outputLabels[i]
            ), `translate(${o[0]} ${o[1]})`, idSpace.connectionPointIdString({id:id, type:"Output", index:i}))
        })

        switch (connectionPointDisplayMode) {
            case "": return inputs.concat(outputs)
            case "Input": return inputs
            case "Output": return outputs
        }
    }

    /**
     * @param {[number, number]} from
     * @param {[number, number]} to
     * @param {import("$lib/circuit_types/GateType").ConnectionValue} value
     */
    function drawWire(from, to, value = undefined) {
        const color = connectionValueToColor(value)
        return `<path d="M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}" stroke="${color}" />`
    }
    
    /**
     * 
     * @param {CircuitControllerQueryResult} q
     * @returns {SVGElement | null}
     */
    function queryToElement(q) {
        switch (q.type) {
            case "Gate":
                return svgHead.querySelector(
                    `#${idSpace.gateIdString(q.getId() || 0)}`
                )
            case "Input":
            case "Output":
                return svgHead.querySelector(
                    `#${idSpace.connectionPointIdString({id:q.getId() || 0, type:q.type, index:q.connectionIndex || 0})}`
                )
        }

        return null
    }

    const highlightTransformEffect = 'scale(1.25, 1.25) rotate(3)'

    /**
     * @param {CircuitControllerQueryResult} q
     */
    export function onEntered(q) {
        //console.log("entered", q)
        if (q.type === "Gate") return
        const svg = queryToElement(q)
        const g = svg?.children[0]
        if (g) {
            const existing = g.getAttribute('transform')
            g.setAttribute('transform', (existing || '') + highlightTransformEffect )
        }   
    }

    /**
     * 
     * @param {CircuitControllerQueryResult} q
     */
    export function onExited(q) {
        //console.log("exited", q)
        if (q.type === "Gate") return
        const svg = queryToElement(q)
        const g = svg?.children[0]
        if (g) {
            const existing = g.getAttribute('transform')
            if (existing) {
                const i = existing.lastIndexOf(highlightTransformEffect)
                g.setAttribute('transform', existing.substring(0, i) + existing.substring(i + highlightTransformEffect.length))
            }
        }
    }

    /**
     * select an element from the renderer's output
     * @param {string} qs
     */
    export function getElement(qs) {
        return svgHead.querySelector(qs)
    } 



</script>

<ResizingSvg 

    offsetX={0} 
    offsetY={0}
    minWidth={gridSize[0] * cellOffset}
    minHeight={gridSize[0] * cellOffset}
    bind:svg={svgHead}
    bind:this={resizer}
    ancestry={1 || rendererParams.resizeAncestry}
>
    <g transform="scale(1, 1)">
        <g id="circuit-bounding-box">
            <!--white border forces the size to be more consistent-->
            <rect 
                stroke="white"
                fill="none"
                width="{gridSize[0] * cellOffset}" 
                height="{gridSize[1] * cellOffset}"
                x="0"
                y="0"
            >
        </g>
        <g bind:this={gridGroup} id="circuit-svg-lines" stroke="var(--grid-color)" stroke-width="0.25px" fill="none"></g>
        <g bind:this={gateGroup} id="circuit-svg-gates" stroke="var(--gate-color)" stroke-width="0.5px" fill="none"></g>
        <g bind:this={connectionGroup} id="circuit-svg-connections" stroke="var(--gate-color)" stroke-width="0.5px" fill="none"></g>
    </g>
    <path></path>
    <text></text>
    <slot />
</ResizingSvg>

<style>
    path {
        pointer-events: none;
    }

    text {
        pointer-events: none;
    }
</style>