<script>
    import { GateType, Buf, Gate, all_gates, copyGate } from '$lib/circuit_types/Gate'
    import { onMount } from 'svelte';

    import { getGateSvgContents, ConnectionSvg } from '../GateSvgs.svelte';

    import { CircuitController } from '$lib/circuit_types/CircuitController';

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
    let svgGates = []
    let gridController = new CircuitController()

    /**
     * @param {DragEvent} e
     */
    function onDragStart(e) {

        const result = gridController.query(e.offsetX, e.offsetY)
        const object = result.object

        if (object instanceof Gate) {
            dragStartGate(e, object)
            return
        }

        preventDefault(e)

        return
    }

    /**
     * @param {DragEvent} e
     * @param {Gate} gate
     */
    function dragStartGate(e, gate) {
        const dataTransfer = e.dataTransfer
        const gType = gate.type
        const [x, y] = [gate.x || 0, gate.y || 0]

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

        const gateOffset = gridController.indexToOffset(gate.x || 0, gate.y || 0)
        const localOffset = [
            e.offsetX - gateOffset[0],
            e.offsetY - gateOffset[1]
        ]
        dataTransfer.setData('offset', `${localOffset[0]}|${localOffset[1]}`)

        dataTransfer.setData('SourceGate', `${gType.name}-${gate.id}`)     
        
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
                svgGates,
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
                svgGates,
                getGateSvgContents
            )
        }

        
        updateSvg()
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
            gridController.removeGate(source, svgGates);
        }

        updateSvg()
    }

    let svgConnections = ""
    /**
     * listen for click events on the circuit
     * @param {MouseEvent} e
     */
    function clickHandler(e) {
        const result = gridController.query(e.offsetX, e.offsetY)
        console.log(result)
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

    function updateSvg() {
        svgGates = svgGates
        svgConnections = gridController.showConnectionPoints(ConnectionSvg)
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
        {#each svgGates as svg}
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
