<script>
    import { GateType, Buf, Gate, all_gates, copyGate } from '$lib/circuit_types/Gate'
    import { onMount } from 'svelte';

    import { getGateSvgContents, ConnectionSvg } from '../GateSvgs.svelte';
    import { GateGrid } from '$lib/circuit_types/GateGrid';

    import { CircuitController } from '$lib/circuit_types/CircuitController';
    import { GateGraph } from '$lib/circuit_types/GateGraph';

    /**
     * @type {SVGElement} circuit
     */
    let circuit;

    /**
     * @type {HTMLDivElement | null}
     */
    let circuitContainer;

    /**
     * 
     * @param {DragEvent} e
     */
     let preventDefault = (e) => {
        e.preventDefault()
    }

    let left = 0;
    let top = 0;
    
    let mountCircuit = () => {
        addDragEventListeners()
        updateViewBox()
    }
    onMount(mountCircuit)

    function updateViewBox() {
        if (circuitContainer === null) {
            return
        }

        let offsetX = circuitContainer.offsetWidth;
        let offsetY = circuitContainer.offsetHeight;
        circuit.setAttribute('viewBox', `${left} ${top} ${offsetX - left} ${offsetY - top}`)
        circuit.setAttribute('width', `${offsetX}`)
    }

    window.addEventListener('resize', (e) => {
        updateViewBox()
    })

    /**
     * @type {Array<String>}
     */
    let svgContents = []
    let gateGraph = new GateGraph()
    let gateGrid = new GateGrid(gateGraph)
    let gridController = new CircuitController(gateGrid)

    /**
     * @param {DragEvent} e
     */
    function onDragStart(e) {

        let [x, y] = gateGrid.offsetToIndex(e.offsetX, e.offsetY)
        const gate = gateGrid.get(x, y)
        const dataTransfer = e.dataTransfer

        if (gate === undefined) {
            preventDefault(e)
            console.log("gate not found at ", x, y, "!")
            return
        }
        const gType = gate.type

        if (dataTransfer === null) {
            console.log("datatransfer not found!")
            return
        }

        const target_id = `gateshelf.${gType.name}`
        let svg = document.getElementById(target_id)

        if (!svg) {
            console.log("shelf button ", target_id, " not found!")
            return
        }

        dataTransfer.setData('ShelfButtonId', target_id)
        dataTransfer.setData('GateName', gType.name)

        const gateOffset = gateGrid.indexToOffset(gate.x || 0, gate.y || 0)
        const localOffset = [
            e.offsetX - gateOffset[0],
            e.offsetY - gateOffset[1]
        ]
        dataTransfer.setData('offset', `${localOffset[0]}|${localOffset[1]}`)

        const gateId = gateGrid.indexToId(x, y)
        if (gateId !== undefined) {
            dataTransfer.setData('SourceGate', `${gType.name}-${gateId}`)
        }        
        
        dataTransfer.setDragImage(svg, localOffset[0], localOffset[1])

        window.addEventListener("drop", windowDropEV)
        window.addEventListener("dragover", preventDefault)
    }

    /**
     * Add evs for dragging related to the circuit
     */
    function addDragEventListeners() {
        if (circuit == null) {
            console.log(" not found!!")
            return
        }

        circuit.addEventListener("dragover", preventDefault)
        circuit.addEventListener("dragenter", preventDefault)
        circuit.addEventListener("dragleave", preventDefault)

        circuit.addEventListener("drop", circuitDropEV)
    }

    /**
     * Event for dropping a gate in the circuit
     * @param {DragEvent} e
     */
    function circuitDropEV(e) {

        const d = e.dataTransfer
        if (d === null) {
            return
        }

        preventDefault(e)

        const id = d.getData('ShelfButtonId')
        const name = d.getData('GateName')
        if (id === '' || name === '') {
            return
        }

        let gType = all_gates.get(name) || new GateType()

        const offsetString = d.getData('offset')
        if (offsetString === "") {
            return
        }
        const offset = offsetString.split('|')
        const gateOffset = [
            left + e.offsetX - Number(offset[0]) * .5,
            top + e.offsetY - Number(offset[1]) * .5
        ]

        const source = d.getData('SourceGate')
        if (source !== "") {
            gridController.moveGate(
                source, 
                gateOffset[0],
                gateOffset[1],
                svgContents,
                getGateSvgContents
            )
        }
        else {
            const offset = offsetString.split('|')
            const gate2 = copyGate(gType)
            gridController.addGate(
                gate2, 
                gateOffset[0],
                gateOffset[1],
                svgContents,
                getGateSvgContents
            )
        }

        
        svgContents = svgContents
    }

    /**
     * watch for drops outside of the panel to remove gates
     * @param {DragEvent} e
     */
    function windowDropEV(e) {
        window.removeEventListener("drop", windowDropEV)
        window.removeEventListener("dragover", preventDefault)
        
        preventDefault(e)

        const dataTransfer = e.dataTransfer
        if (!dataTransfer) {
            return
        }

        const source = dataTransfer.getData('SourceGate')

        if (source != "" && !inCircuitPanel(e.pageX, e.pageY)) {
            gridController.removeGate(source, svgContents);
        }

        svgContents = svgContents
    }

    let svgConnections = ""
    /**
     * listen for click events on the circuit
     * @param {MouseEvent} e
     */
    function clickHandler(e) {
        const result = gridController.query(e.offsetX, e.offsetY)
        console.log(result)

        svgConnections = gridController.showConnectionPoints(
            0, ConnectionSvg
        )
        console.log(svgConnections)
    }

    /**
     * Check if the offset is in the circuit panel,
     * more reliable than getting targets from events
     * @param {number} offsetX
     * @param {number} offsetY
     */
    function inCircuitPanel(offsetX, offsetY) {
        if (circuitContainer === null) {
            return false
        }

        if (offsetX >= circuitContainer.offsetLeft && 
            offsetX < circuitContainer.offsetLeft + circuitContainer.offsetWidth &&
            offsetY >= circuitContainer.offsetTop && 
            offsetY < circuitContainer.offsetTop + circuitContainer.offsetHeight) 
        {
            return true
        }

        return false
    }

</script>

<div 
    draggable="true" 
    class="circuit-container" 
    id="circuitContainer" 
    role="application"
    bind:this={circuitContainer}
    on:dragstart={onDragStart}
    on:mouseup={clickHandler}>
    <svg stroke="black" stroke-width=".5pt" fill="none" bind:this={circuit}>
        {#each gridController.gridCellsSvg() as svg}
        {@html svg}
        {/each}
        {#each svgContents as svg}
        {@html svg}
        {/each}
        {@html svgConnections}
    </svg>
</div>

<style>
    .circuit-container {
        grid-row: 2;
        grid-column: 1 / 2;
        background-color: white;  
        padding: 0%;
    }
</style>
