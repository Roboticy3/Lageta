<script>
    import CircuitDraggable from './CircuitDraggable.svelte';

    import { GateType, Buf, Gate, all_gates} from '$lib/circuit_types/Gate'
    import { onMount } from 'svelte';

    import { getGateSvgContents, ConnectionSvg, buildSvg, wireSvg, getGateSvg } from '../GateSvgs.svelte';

    //@ts-ignore
    import { CircuitController } from '$lib/circuit_types/CircuitController';
    
    //@ts-ignore
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
    function addDragEventListeners() {
        if (circuitContainer == null) {
            console.log(" not found!!")
            return
        }

        circuitContainer.addEventListener("mousedown", onDragStart)
        circuitContainer.addEventListener("mousemove", onDrag)
        circuitContainer.addEventListener("mouseup", onDrop)
    }

    /**
     * @param {MouseEvent} e
     */
    function onDragStart(e) {
        const query = gridController.query(e.offsetX, e.offsetY)
        console.log("Picked up ", query)
    }

    /**
     * @param {MouseEvent} e
     */
    function onDrag(e) {
        console.log("Dragging...")
    }

    /**
     * @param {MouseEvent} e
     */
    function onDrop(e) {

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
