<svelte:options accessors={true}/>
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import CircuitDraggable from './CircuitDraggable.svelte';
    import { GateTypeController } from "$lib/circuit_types/GateType";
    import { onMount } from "svelte";
    import ResizingSvg from "$lib/components/Misc/ResizingSvg.svelte";
    import { CircuitRendererIDStandard } from "$lib/renderer_types/CircuitRendererIDSpace";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { WireRenderer } from "$lib/renderer_types/WireRenderer";
    import { SFXPlayer } from "$lib/misc_types/SFXPlayer";

    /**
     * @type {CircuitController}
     */
    export let circuitController
    $: circuitController.addGraphListener("update", ({id}) => {
        console.log("renderer caught update", id)
        updateGate(id)
    })

    /**
     * @type {CircuitDraggable}
     */
    export let circuitDraggable

    /**
     * @type {GameViewCircuitPanelEventTarget}
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
     let wireGroup

    /**
     * @type {SVGGElement}
     */
    let gateGroup

    /**
     * @type {SVGGElement}
     */
    let activeGroup

    const idSpace = new CircuitRendererIDStandard()

    const gridSize = circuitController.getGridSize();

    const cellOffset = 10

    let viewBoxWidth = cellOffset * gridSize[0]
    let viewBoxHeight = cellOffset * gridSize[1]
    
    onMount(async () => {
        updateParams(rendererParams)

        svgHead.setAttribute('id', idSpace.headIdString())

        editorEventTarget?.addEventListener("drag", drawActive)
        editorEventTarget?.addEventListener("drop", clearActives)

        SFXPlayer.loadAudio(["hover.wav"])
    })

    /**
     * @param {string} id the id of the item, whether it already exists or not
     * @param {((arg0: Element) => void) | undefined} refresher update the item by changing its attributes
     * @param {(() => SVGGElement) | undefined} constructor create a new element and add it to the appropriate parent
     */
     export function updateItem(id, refresher = undefined, constructor = undefined) {
        if (!refresher) return
        const item = svgHead.querySelector(`#${id}`)
        if (!item && constructor) {
            const newItem = constructor()
            newItem.setAttribute('id', id)
            refresher(newItem)
        }
        else if (item) {
            refresher(item)
        }
    }

    /**
     * @param {Element} svg
     */
    function clearRefresher(svg) {
        svg.innerHTML = ""
    }

    /**
     * @param {number} id
     * @param {GateTypeController} cType
     * @param {[number, number]} gPos
     */
    function gateConstructor(id, cType, gPos) {

        const gateTransform = svgGridTransform(gPos[0], gPos[1])
        const idString = idSpace.gateIdString(id)

        const gateInner = ""

        const gate = svgWrapGroup(gateInner, '', `${idString}-body`)

        const g = svgWrapGroup('', gateTransform, idString)
        
        g.appendChild(gate)

        gateGroup.appendChild(g)

        return g
    }

    /**
     * @param {number} id
     * @param {Element} svg
     * @param {GateTypeController} cType
     * @param {[number, number]} gPos
     */
    function gateRefresher(id, cType, gPos, svg) {

        const gateTransform = svgGridTransform(gPos[0], gPos[1])
        const idString = idSpace.gateIdString(id)

        svg.setAttribute('transform',gateTransform)

        const body = svg.querySelector(`#${idString}-body`)
        console.log("should I draw a gate here?... ", body, rendererParams)
        if (body && !rendererParams.showBodyMask?.has(id)) {
            body.innerHTML = svgGateBody(cType, id)
        }

        const outputs = circuitController.getGateOutputs(id)?.override
        for (let i = 0; i < cType.view.sizeOut; i++) {
            /**
             * @type {import("$lib/circuit_types/CircuitController").ConnectionIndex}
             */
            const index = {id:id, type:"Output", index:i}
            updateItem(
                idSpace.connectionPointIdString(index),
                connectionPointRefresher.bind(connectionPointRefresher, index, cType, gPos),
                connectionPointConstructor.bind(connectionPointConstructor, index, cType, gPos)
            )

            console.log("updating wire ", [id, i], " with output ", outputs?.at(i))
            updateWire([id, i], outputs?.at(i))
        }
        const inputs = circuitController.getGateInputs(id)
        for (let i = 0; i < cType.view.sizeIn; i++) {
            /**
             * @type {import("$lib/circuit_types/CircuitController").ConnectionIndex}
             */
            const index = {id:id, type:"Input", index:i}
            updateItem(
                idSpace.connectionPointIdString(index),
                connectionPointRefresher.bind(connectionPointRefresher, index, cType, gPos),
                connectionPointConstructor.bind(connectionPointConstructor, index, cType, gPos)
            )

            const fromIndex = circuitController.getConnectedTo(id, i)
            if (fromIndex) {
                const fromValue = circuitController.getConnectionValue(
                    {id:fromIndex[0], type:"Output", index:fromIndex[1]}
                )
                updateWire(fromIndex, fromValue)
                console.log("updating wire ", fromIndex, " with output ", fromValue)
            }
        }
    }

    /**
     * 
     * @param {import("$lib/circuit_types/CircuitController").ConnectionIndex} index
     * @param {GateTypeController} cType
     * @param {[number, number]} gPos
     */
    function connectionPointConstructor(index, cType, gPos) {
        
        const id = index.id
        const gateIdString = idSpace.gateIdString(id)
        let svg = svgHead.querySelector(`#${gateIdString}`)

        //if no svg is found, construct the parent gate that this connection point is "dependant" on
        if (!svg) {
            const g = gateConstructor(id, cType, gPos)
            svg = g
            //however, don't update the gate (action = undefined) because that could trigger an infinite recursion if something goes wrong
            updateItem(gateIdString, undefined, () => { return g })
        }
        
        const pointIdString = idSpace.connectionPointIdString(index)
        const vType = cType.view
        const pointOffset = (index.type === "Input") ? 
            vType.inputOffsets[index.index] : 
            vType.outputOffsets[index.index]

        let pointInner = ""
        if (vType.sizeIn === 0) {
            pointInner = svgInputPoint()
        }
        else if (vType.sizeOut === 0) {
            pointInner = svgOutputPoint()
        }
        else {
            pointInner = svgConnectionPoint()
        }

        const point = rendererParams.showMask?.has(id) ? 
            document.createElementNS("http://www.w3.org/2000/svg","g")
        : //if the point is masked, return an empty element, otherwise fill it out
            svgWrapGroup(
                pointInner, 
                `translate(${pointOffset[0]}, ${pointOffset[1]})`, 
                '' //id is applied in updateItem
            )

        if (rendererParams.showConnectionPoints !== false) svg.appendChild(point)
        return point
    }

    /**
     * @param {import("$lib/circuit_types/CircuitController").ConnectionIndex} index
     * @param {GateTypeController} cType
     * @param {[number, number]} gPos
     * @param {Element} point
     */
    function connectionPointRefresher(index, cType, gPos, point) {
        const value = circuitController.getConnectionValue(index)
        const color = connectionValueToColor(value)

        point.setAttribute('stroke', color)

        updateItem(
            idSpace.connectionPointLabelIdString(index),
            connectionPointLabelRefresher.bind(connectionPointLabelRefresher, index, cType, gPos),
            connectionPointLabelConstructor.bind(connectionPointLabelConstructor, index, cType, gPos)
        )
    }

    /**
     * @param {import("$lib/circuit_types/CircuitController").ConnectionIndex} index
     * @param {GateTypeController} cType
     * @param {[number, number]} gPos
     */
    function connectionPointLabelConstructor(index, cType, gPos) {
        const id = index.id

        if (rendererParams.showConnectionLabels === false || rendererParams.showMask?.has(id)) return svgWrapGroup('')

        const gateIdString = idSpace.gateIdString(id)
        let svg = svgHead.querySelector(`#${gateIdString}`)

        //if no svg is found, construct the parent gate that this connection point is "dependant" on
        if (!svg) {
            const g = gateConstructor(id, cType, gPos)
            svg = g
            //however, don't update the gate (action = undefined) because that could trigger an infinite recursion if something goes wrong
            updateItem(gateIdString, undefined, () => { return g })
        }
        
        const vType = cType.view
        const pointOffset = (index.type === "Input") ? 
            vType.inputOffsets[index.index] : 
            vType.outputOffsets[index.index]
        const labelText = (index.type === "Input") ?
            vType.inputLabels[index.index] :
            vType.outputLabels[index.index]
        const labelInner = svgConnectionPointLabel(labelText, index.type === "Input" ? 'text-anchor="end" x="-4"':'text-anchor="start" x="4"')

        const label = svgWrapGroup(
            labelInner, 
            `translate(${pointOffset[0]}, ${pointOffset[1]})`, 
            '' //id is applied in updateItem
        )

        if (rendererParams.showLabels !== false) svg.appendChild(label)
        return label
    }

    /**
     * @param {import("$lib/circuit_types/CircuitController").ConnectionIndex} index
     * @param {GateTypeController} cType
     * @param {[number, number]} gPos
     * @param {Element} label
     */
    function connectionPointLabelRefresher(index, cType, gPos, label) {
        const value = circuitController.getConnectionValue(index)
        const color = connectionValueToColor(value)

        label.setAttribute('fill', color)
    }

    function wireConstructor() {
        const g = document.createElementNS("http://www.w3.org/2000/svg", 'g')
        wireGroup.appendChild(g)
        return g
    }

    /**
     * @param {[number, number] | undefined} outputOffset
     * @param {[number, number][] | undefined} inputOffsets
     * @param {import("$lib/circuit_types/GateType").ConnectionValue | "last"} value if "last", use whatever value was passed to this wire previously
     * @param {Element} wire
     */
    function wireRefresher(outputOffset, inputOffsets, value, wire) {
        if (!outputOffset || !inputOffsets) {
            wire.innerHTML = ""
            return
        }
        
        const innerWires = inputOffsets.map(v => drawWire(outputOffset, v))
        wire.innerHTML = innerWires.join('\n')

        if (value !== "last") wire.setAttribute('stroke', connectionValueToColor(value))
    }   

    export function drawGates() {
        for (let i = 0; i < circuitController.getGateIdLength(); i++) {
            updateGate(i)
        }
    }
    
    /**
     * @param {number} id
     */
    export function updateGate(id) {

        if (rendererParams.showMask?.has(id)) return

        const cType = circuitController.getGateTypeController(id)
        const gPos = circuitController.getGatePosition(id)

        const idString = idSpace.gateIdString(id)

        if (!cType || !gPos) {
            updateItem(
                idString,
                clearRefresher,
                () => document.createElementNS("http://www.w3.org/2000/svg", 'g')
            )
        }
        else {
            updateItem(
                idString,
                gateRefresher.bind(gateRefresher, id, cType, gPos),
                gateConstructor.bind(gateConstructor, id, cType, gPos)
            )
        }

        console.log("drawing gate:",id)
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
     * @param {import("$lib/circuit_types/GateType").ConnectionValue | "last"} value If "last" is passed as the value, update the wire using whatever value it was last updated with
     */
    export function updateWire(index, value) {

        console.log("redrawing wire ", index, " with value ", value)

        const fCType = circuitController.getGateTypeController(index[0])
        const fGPos = circuitController.getGatePosition(index[0])

        const to = circuitController.getConnectedFrom(index[0], index[1])

        //check that the input and the output array exists, also check that the wire's endpoint isn't being masked out
        if (!fCType || !fGPos || !to || rendererParams.showMask?.has(index[0])) {
            //if any of these conditions pass, bind the refresh loop for this wire with blank args
            updateItem(
                idSpace.wireIdString(index),
                wireRefresher.bind(wireRefresher, undefined, undefined, value),
                wireConstructor.bind(wireConstructor)
            )
            return
        }

        //check that the outputs exist
        /**
         * @type {[(GateTypeController | undefined)[], ([number, number] | undefined)[]]}
         */
        const [tCTypes, tGPoss] = [[], []] //const means nothing in this language lol
        for (const toi of to) {

            const mask = rendererParams.showMask?.has(toi[0])

            const [tCType, tGPos] = [
                mask ? undefined:circuitController.getGateTypeController(toi[0]),
                mask? undefined:circuitController.getGatePosition(toi[0])
            ]

            tCTypes.push(tCType)
            tGPoss.push(tGPos)
        }    
        
        //process the wire data into offsets
        //if a wire endpoint was missing, just replace that endpoint with the starting point of the wire

        //process the gate positions
        const fromGateOffset = circuitController.indexToLocalOffset(fGPos[0], fGPos[1])
        const toGateOffsets = tGPoss.map(v => (v ? circuitController.indexToLocalOffset(v[0], v[1]):fromGateOffset))
        
        //process the connection offsets
        const fromConnectionOffset = fCType.view.outputOffsets[index[1]]
        const toConnectionOffsets = tCTypes.map((v, i) => v?.view.inputOffsets[to[i][1]] || fromConnectionOffset)

        //add them together to get the circuit offsets of the wire endpoints
        /**
         * @type {[number, number]}
         */
        const fromOffset = 
            [fromGateOffset[0] + fromConnectionOffset[0], 
            fromGateOffset[1] + fromConnectionOffset[1]]
        /**
         * @type {[number, number][]}
         */
        const toOffsets = toGateOffsets.map((v, i) => 
            [toGateOffsets[i][0] + toConnectionOffsets[i][0], 
            toGateOffsets[i][1] + toConnectionOffsets[i][1]]
        )

        updateItem(
            idSpace.wireIdString(index),
            wireRefresher.bind(wireRefresher, fromOffset, toOffsets, value),
            wireConstructor.bind(wireConstructor)
        )
    }

    /**
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEvent} evt
     */
    function drawActive(evt) {

        switch (evt.from.type) {
            case "Input":
            case "Output":
                drawActiveWire(evt)
                break
            case "Gate":
                drawActiveGate(evt)
                break
        }
    }

    function activeWireConstructor() {
        const g = document.createElementNS("http://www.w3.org/2000/svg","g")
        activeGroup.appendChild(g)
        return g
    }

    /**
     * @param {[number, number] | undefined} fromOffset
     * @param {[number, number] | undefined} toOffset
     * @param {import("$lib/circuit_types/GateType").ConnectionValue} value
     * @param {boolean} fromAnchored
     * @param {Element} wire
     */
    function activeWireRefresher(fromOffset, toOffset, value, fromAnchored, wire) {
        if (fromOffset && toOffset) {
            const wireInner = drawWire(fromOffset, toOffset, !fromAnchored)
            wire.innerHTML = wireInner
        }
        
        wire.setAttribute('stroke', connectionValueToColor(value))
    }

    /**
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEvent} param0
     */
    function drawActiveWire({from, to}) {
        const id = from.getId()
        const toOffset = to.getLocalOffset()
        const index = from.connectionIndex

        if ((id === undefined) || !toOffset || (index === undefined)) return

        const fCType = circuitController.getGateTypeController(id)
        const fGPos = circuitController.getGatePosition(id)

        if (!fCType || !fGPos) return

        const fromGateOffset = circuitController.indexToLocalOffset(fGPos[0], fGPos[1])
        const fromConnectionOffset = from.type === "Output" ? 
            fCType.view.outputOffsets[index]:
            fCType.view.inputOffsets[index]
        /**
         * @type {[number, number]}
         */
        const fromOffset = [fromGateOffset[0] + fromConnectionOffset[0], fromGateOffset[1] + fromConnectionOffset[1]]

        const idString = "wire-active"
        const [toId, toIndex] = [to.getId(), to.connectionIndex]
        const value = from.type === "Output" ? 
            circuitController.getGateOutputs(id)?.override[index]:
            (toId !== undefined && toIndex !== undefined ? circuitController.getGateOutputs(toId)?.override[toIndex] : undefined)
        
        if (from.type === "Output")
            updateItem(
                idString,
                activeWireRefresher.bind(activeGateRefresher, fromOffset, toOffset, value, true),
                activeWireConstructor
            )
        else
            updateItem(
                idString,
                activeWireRefresher.bind(activeGateRefresher, toOffset, fromOffset, value, false),
                activeWireConstructor
            )

    }

    export function clearActiveWire() {
        const activeWire = activeGroup.querySelector("#wire-active")
        if (activeWire === null) return
        console.log("erasing active wire")
        activeWire.innerHTML = ""
    }

    function activeGateConstructor() {
        const g = document.createElementNS("http://www.w3.org/2000/svg","g")
        activeGroup.appendChild(g)
        return g
    }

     /**
     * @param {boolean} valid
     * @param {import("$lib/circuit_types/Gate").GateState | undefined} state
     * @param {GateTypeController} cType
     * @param {number[]} gPos
     * @param {Element} svg
     */
    function activeGateRefresher(valid, state, cType, gPos, svg) {
        const innerGate = svgGateBody(cType, state)

        const gateTransform = svgGridTransform(gPos[0], gPos[1])

        svg.setAttribute('transform',gateTransform)
        svg.innerHTML = innerGate

        svg.setAttribute('stroke','black')
        if (!valid) {
            svg.setAttribute('stroke','gray')
        }
        const transform = svgGridTransform(gPos[0], gPos[1])
        svg.setAttribute('transform', transform)
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

        const idString = `gate-active`
        let previewResult
        let svg = gateGroup.querySelector(`#${idString}`)
        console.log("previewing ", cType, "with id", id)

        if (id && cType) {
            previewResult = circuitController.previewMoveGateLocal(id, localX, localY)
        } else if (cType) {
            previewResult = circuitController.previewAddGateLocal(cType, localX, localY)
        }
        else return

        const state = id ? circuitController.getGateState(id) : undefined

        updateItem(
            idString,
            activeGateRefresher.bind(
                activeGateRefresher, 
                previewResult.error === "Ok",
                state,
                cType,
                previewResult.at
            ),
            activeGateConstructor
        )
    }

    export function clearActiveGate() {
        const activeGate = activeGroup.querySelector("#gate-active")
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
        const state = (typeof idOrState === "object" ? 
            idOrState : 
            (idOrState === undefined ?  
                cType.generateDefaultState() : 
                (circuitController.getGateState(idOrState) || cType.generateDefaultState())
            )
        )
        const id = typeof idOrState === "number" ? idOrState : undefined

        const inner = cType.view.draw(state)
        if (id !== undefined && rendererParams.showIds) {
            return `${inner}\n<text stroke="none" fill="black" style="font-size:0.25em;" y="${10 * cType.view.gridHeight}">${id}</text>`
        }
        return inner
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

    function svgConnectionPoint(extraParams = '') {
        return `<path d="M -1 -1 l 2 1 l -2 1 Z" stroke-width=".25px" style="pointer-events:none;" fill="var(--main-bg-color)" ${extraParams} />`
    }

    function svgInputPoint(extraParams = '') {
        return `<path d="M -1.5 -1 l 1 0 l 1.5 1 l -1.5 1 l -1 0 Z" stroke-width=".25px" style="pointer-events:none;" fill="var(--main-bg-color)" ${extraParams} />`
    }

    function svgOutputPoint(extraParams = '') {
        return `<rect x="-1" width="2" y="-1" height="2" rx=".25"  stroke-width=".25px" style="pointer-events:none;" fill="var(--main-bg-color)" ${extraParams} />`
    }

    function svgConnectionPointLabel(label = 'bingus', extraParams = '') {
        return `<text style="pointer-events:none; font-size:min(.5vh, .5vw);" stroke="none" ${extraParams}>${label}</text>`
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
        const color = connectionValueToColor(value)
        return `<circle r="2.5" stroke="${color}" stroke-dasharray="1" fill="none" style="pointer-events:none;" />`
    }

    const wireRenderer = new WireRenderer()
    /**
     * @param {[number, number]} from
     * @param {[number, number]} to
     */
    function drawWire(from, to, seedWithTo=true) {
        const seed = seedWithTo ? 
            JSON.stringify(to) : JSON.stringify(from)
        return wireRenderer.drawWireBordered(
            from, to, 
            rendererParams.minStride || 3, circuitController, 
            seed, 2
        )
    }
    
    /**
     * 
     * @param {CircuitControllerQueryResult} q
     * @returns {SVGElement | null}
     */
    function queryToElement(q) {
        switch (q.type) {
            case "Gate":
                const id = q.getId()
                if (id === undefined) return null
                return gateGroup.querySelector(
                    `#${idSpace.gateIdString(id)}-body`
                )
            case "Input":
            case "Output":
                return gateGroup.querySelector(
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
        if (q.type === "Gate" && !rendererParams.showBodyMask?.has(q.getId())) {
            circuitDraggable.setContentsToName(
                q.getGateType()?.name || "?"
            )
        }

        let canHighlight = true
        const drag = circuitDraggable.getQuery()
        if (drag.type !== "" && drag.type !== "Gate") {
            canHighlight = q.type !== "Gate" && q.type !== drag.type
        }
        //console.log("entered", q)
        const svg = queryToElement(q)
        if (canHighlight && svg && ((q.type !== "Gate") || q.getGateType()?.view.moveable)) {
            const existing = svg.getAttribute('transform')
            svg.setAttribute('transform', (existing === null ? '':existing) + highlightTransformEffect )
            console.log("highlighting ", q)
            SFXPlayer.play("hover.wav")
        }   
    }

    /**
     * 
     * @param {CircuitControllerQueryResult} q
     */
    export function onExited(q) {
        if (q.type === "Gate") circuitDraggable.resolveContents()

        //console.log("exited", q)
        const svg = queryToElement(q)
        if (svg) {
            const existing = svg.getAttribute('transform')
            if (existing) {
                const i = existing.indexOf(highlightTransformEffect)
                svg.setAttribute('transform', existing.substring(0, i) + existing.substring(i + highlightTransformEffect.length))
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
            <!--var(--main-bg-color) border forces the size to be more consistent-->
            <rect 
                stroke="var(--main-bg-color)"
                fill="none"
                width="{gridSize[0] * cellOffset}" 
                height="{gridSize[1] * cellOffset}"
                x="0"
                y="0"
            >
        </g>
        {#if rendererParams.showGrid !== false}
            <g 
                bind:this={gridGroup} 
                stroke="var(--main-bg-color)" stroke-width="0.25px" fill="var(--connection-color-x)" 
                pointer-events="none"
            >

            <defs>
                <pattern id="circlePattern" x=0 y=0 width={cellOffset} height={cellOffset} patternUnits="userSpaceOnUse">
                <!-- Single circle in the pattern -->
                <circle cx={0} cy={0} r="0.25" fill="var(--connection-color-x)" />
                <circle cx={cellOffset} cy={0} r="0.25" fill="var(--connection-color-x)" />
                <circle cx={0} cy={cellOffset} r="0.25" fill="var(--connection-color-x)" />
                <circle cx={cellOffset} cy={cellOffset} r="0.25" />
                </pattern>
            </defs>
            
            <!-- Use the pattern to fill the background -->
            <rect width={gridSize[0] * cellOffset} height={gridSize[1] * cellOffset} fill="url(#circlePattern)" />
        </g> {/if}

        <g bind:this={wireGroup} stroke="var(--gate-color)" stroke-width="0.5px" fill="none" ></g>
        <g bind:this={gateGroup} stroke="var(--gate-color)" stroke-width="0.5px" fill="var(--tertiary-bg-color)"></g>
        <g bind:this={activeGroup} stroke="var(--gate-color)" stroke-width="0.5px" fill="none"></g>
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