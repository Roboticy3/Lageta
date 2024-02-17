<script>
    import CircuitDraggable from './CircuitDraggable.svelte';

    import { GateType, Buf, Gate, all_gates} from '$lib/circuit_types/Gate'
    import { onMount, tick } from 'svelte';

    import { getGateSvgContents, ConnectionSvg, buildSvg, wireSvg, getGateSvg, getGateTypeSvg, getGateTypeSvgContents } from '../GateSvgs.svelte';

    import { CircuitController, CircuitControllerQueryResult } from '$lib/circuit_types/CircuitController';
    import { GameViewParameters } from '$lib/level_types/GameViewParameters';

    /**
     * @type {GameViewParameters}
    */
    export let params

    /**
     * @type {CircuitController}
     */
    export let gridController

    /**
     * @type {CircuitDraggable}
     */
    export let circuitDraggable

    /**
     * @type {SVGElement} circuit
     */
    let circuit;

    /**
     * @type {HTMLDivElement | null}
     */
    let circuitContainer;

    /**
     * @type {Array<String>}
     */
    let svgGates = []
    /**
     * @type {Array<String>}
     */
    let svgWires = []
    
    //the svg string of the current connection, previews the connection being made
    let activeSvgWire=""
    //the svg string of all the visible connection points
    let svgConnectionPoints = ""

    let showSlot = true

    //update the svg, try to call whenever the grid changes
    export function updateSvg() {
        svgGates = gridController.drawGates(getGateSvgContents)
        svgConnectionPoints = gridController.drawConnectionPoints(ConnectionSvg)
        svgWires = gridController.drawWires(wireSvg)
        clearActiveSvgConnection()
        showSlot = !gridController.isPlaying()
    }

    function clearActiveSvgConnection() {
        activeSvgWire = ""
    }
    
    let mountCircuit = () => {
        addDragEventListeners()
        updateViewBox()
        updateSvg()
    }
    onMount(mountCircuit)

    function updateViewBox() {
        if (circuitContainer === null) {
            return
        }

        let offsetX = circuitContainer.offsetWidth;
        let offsetY = circuitContainer.offsetHeight;
        circuit.setAttribute('viewBox', `0 0 ${offsetX} ${offsetY}`)
        circuit.setAttribute('width', `${offsetX}`)
    }

    window.addEventListener('resize', (e) => {
        updateViewBox()
    })


    /**
     * Add evs for dragging related to the circuit
     */
    async function addDragEventListeners() {
        if (circuitContainer == null) {
            console.log("circuitContainer not found!!")
            return
        }

        circuitContainer.addEventListener("mousedown", onDragStart)
        circuitContainer.addEventListener("mouseup", onDrop)

        await tick()

        circuitDraggable.getController().dragStartHandler = addMouseMoveListener
        console.log(circuitDraggable)
    }

    function addMouseMoveListener() {
        if (circuitContainer == null) {
            console.log("circuitContainer not found!!")
            return
        }

        circuitContainer.addEventListener("mousemove", onDrag)
    }

    /**
     * @param {MouseEvent} e
     */
    function onDragStart(e) {
        e.preventDefault()

        const query = gridController.query(e.offsetX, e.offsetY)
        if (!circuitDraggable.isDragging()) {
            circuitDraggable.drag(e, query, circuitContainer)
        }
        
    }

    let activeSvgGate = ""

    /**
     * @param {MouseEvent} e
     */
    function onDrag(e) {

        if (!gridController.isOffsetInGrid(e.offsetX, e.offsetY)) {
            activeSvgGate = ""
            return
        }

        const controller = circuitDraggable.getController()
        const cType = controller.getContentType()

        if (cType === "") {
            onDrop(e)
            return
        }
        
        switch(cType) {
            case "Gate":
                onDragGate(e)
                break
            case "Input":
                onDragInput(e)
                break
            case "Output":
                onDragOutput(e)
                break

            default: return
        }
        
        
        console.log("Dragging...")
    }

    /**
     * @param {MouseEvent} e
     */
    function onDragGate(e) {
        const controller = circuitDraggable.getController()
        const gType = controller.getGateType()
        if (gType === undefined) return
        
        const id = controller.getId()
        const result = id ? 
            gridController.previewMoveGate(
                id,
                e.offsetX,
                e.offsetY
            ) :
            gridController.previewAddGate(
                gType,
                e.offsetX,
                e.offsetY
            )
        

        if (result !== undefined) {
            activeSvgGate = `<g ${gridController.getGateSvgTransform(
                {type:gType, x:result[0], y:result[1]}
            )}>${getGateTypeSvgContents(gType)}</g>`
        }
    }

    /**
     * @param {MouseEvent} e
     */
    function onDragInput(e) {
        //check if an input is already there
        //if so, "consume" it, deleting it and starting an active wire from the same output in the draggable
        //else, draw a new wire from the input
    }

    /**
     * @param {MouseEvent} e
     */
    function onDragOutput(e) {
        //draw a new wire from the input, gategraph will handle merging it with any existing connections
    }

    function removeMouseMoveListener() {
        if (circuitContainer == null) {
            console.log("circuitContainer not found!!")
            return
        }

        circuitContainer.removeEventListener("mousemove", onDrag)
    }

    /**
     * @param {MouseEvent} e
     */
    function onDrop(e) {

        const controller = circuitDraggable.getController()

        const cType = controller.getContentType()

        switch (cType) {
            case "Gate": 
                const gType = controller.getGateType() || Buf
                dropGate(gType, e)
                break
            case "Input":
            case "Output":
                const query = gridController.query(e.offsetX, e.offsetY)
                dropConnection(controller.getContents(), query)
                break
            default: return
        }
        
        removeMouseMoveListener()

        activeSvgGate = ""

        circuitDraggable.drop(e)
    }

    /**
     * @param {GateType} gType
     * @param {MouseEvent} e
     */
    function dropGate(gType, e) {
        const content = circuitDraggable.getController().getContents()

        const id = content.getId()
        if (id === undefined) {
            console.log(id)
            gridController.addGate(gType, e.offsetX, e.offsetY)
        }
        else {
            if (gridController.isOffsetInGrid(e.offsetX, e.offsetY)) {
                gridController.moveGate(id, e.offsetX, e.offsetY)
            }
            else {
                gridController.removeGate(id, svgGates)
            }
        }
        
        updateSvg()
    }

    /**
     * @param {CircuitControllerQueryResult} qa
     * @param {CircuitControllerQueryResult} qb
     */
    function dropConnection(qa, qb) {
        switch ([qa.type, qb.type]) {
            case ["Input", "Ouput"]:
                break;
            case ["Output", "Input"]:
                break;
        }


    }

</script>

<div
    class="circuit-container" 
    id="circuitContainer" 
    role="application"
    bind:this={circuitContainer}
    >

    <svg 
        stroke="black" 
        stroke-width=".5pt" 
        fill="none" 
        bind:this={circuit}
        class="circuit-svg">
        <g transform={gridController.getMatrixSvg()}>

            {#each svgWires as wire}
                {@html wire}
            {/each}

            {#each gridController.gridCellsSvg() as svg}
            {@html svg}
            {/each}

            {#each svgGates as svg}
            {@html svg}
            {/each}

            {@html svgConnectionPoints}
            {@html activeSvgWire}
            {@html activeSvgGate}
        </g>
    </svg>

    {#if showSlot}
        <slot />
    {/if}
</div>

<style>
    .circuit-container {
        grid-row: 2;
        grid-column: 1 / 2;
        background-color: white;  
        padding: 0%;
    }

    .circuit-svg {
        pointer-events: none;
        display: flex;
    }
</style>
