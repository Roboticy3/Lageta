<script>
    import CircuitDraggable from './CircuitDraggable.svelte';

    import { GateType, Buf, Gate, all_gates} from '$lib/circuit_types/Gate'
    import { onMount, tick } from 'svelte';

    import { ConnectionSvg, buildSvg, wireSvg, getGateTypeSvg, getGateTypeSvgContents } from '../GateSvgs.svelte';

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

    /**
     * Corrects the svg display of the circuit to be up to date with the state of the circuit
     * This function gets called pretty often, but it's still better than refreshing the svg every tick.
     */
    export function updateSvg() {
        svgGates = gridController.drawGates(getGateTypeSvgContents)
        svgConnectionPoints = gridController.drawConnectionPoints(ConnectionSvg)
        svgWires = gridController.drawWires(wireSvg)
        showSlot = !gridController.isPlaying()
    }

    /**
     * Corrects the viewBox of the circuit such that it won't change size when the window is resized.
     */
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
     * Add all events needed to edit the circuit, name is a hold-over from when the project used the drag and drop api
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
    }

    /**
     * Attaches the onDrag function to the circuitContainer div's mousemove event. 
     * Used by addDragEventListeners such that it will be called whenever a drag starts. 
     * The component will then call onDrag whenever the mouse moves until the drag ends.
     */
    function addMouseMoveListener() {
        if (circuitContainer == null) {
            console.log("circuitContainer not found!!")
            return
        }

        circuitContainer.addEventListener("mousemove", onDrag)
    }

    /**
     * Disconnect onDrag from mousemove
     */
     function removeMouseMoveListener() {
        if (circuitContainer == null) {
            console.log("circuitContainer not found!!")
            return
        }

        circuitContainer.removeEventListener("mousemove", onDrag)
    }
    
    /**
     * Called in onMount, runs addDragEventListeners, updateViewBox, and updateSvg
     * These functions all adjust the input handling and display of the circuit, and can be called again whenever appropriate.
     */
    let mountCircuit = () => {
        addDragEventListeners()
        updateViewBox()
        updateSvg()
    }
    onMount(mountCircuit)

    /**
     * addDragEventListeners should hook this up so it starts when the user selects an object in the circuitContainer div.
     * Outside of that div, other components will be in charge of starting a drag.
     * 
     * @param {MouseEvent} e
     */
    function onDragStart(e) {
        e.preventDefault()

        if (circuitDraggable.isDragging()) return

        const query = gridController.query(e.offsetX, e.offsetY)        
        switch (query.type) {
            case "Input":
                onDragStartInput(e, query)
                break
            case "Output":
                onDragStartOutput(e, query)
                break
            case "Gate":
                onDragStartGate(e, query)
        }
    }

    /**
     * onDragStart calls this when the event passed to it selected an input connection.
     * It also needs a query referencing the id of the gate and the index of the connection to proceed.
     * 
     * Dragging from an empty input should create a new wire, 
     * while dragging from a populated input should appear to reroute the existing connection.
     * 
     * @param {MouseEvent} e
     * @param {CircuitControllerQueryResult} query
     */
    function onDragStartInput(e, query) {
        //check if an input wire is already there
        const index = [query.getId() || 0, query.connectionIndex || 0]
        const connected = gridController.getConnectedTo(
            index[0], index[1]
        )

        console.log("Checking if input is already connected:", connected)

        let q = query
        //if so, "consume" the wire, deleting its connection and starting an active wire from the same output as the original
        if (connected) {

            //we can coerce the onDrag functions to do this by simply switching out the query for one originating from the output
            q = gridController.toQuery(connected[0], "Output", connected[1])   
            console.log(q)
            //then we can delete the old connection
            gridController.removeConnection(
                {id:index[0], type:"Input", index:index[1]}
            )

            //update the svg because a connection has been removed, otherwise it will keep being drawn
            updateSvg()

            //tell onDragStartOutput it's business as usual and pretend we didn't do any of this nonsense behind its back
            onDragStartOutput(e, q)

            return
        }

        //otherwise, just start a drag
        circuitDraggable.drag(e, q, circuitContainer)

        //updates the activeSvgWire without having to wait until the user moves their mouse, so they don't get too confused
        onDragInput(e)

        //draw only the connection points that can be connected to from here
        svgConnectionPoints = gridController.drawConnectionPoints(ConnectionSvg, "Output")
    }

    /**
     * onDragStart calls this when the event passed to it selected an input connection.
     * It also needs a query referencing the id of the gate and the index of the connection to proceed.
     * 
     * @param {MouseEvent} e
     * @param {CircuitControllerQueryResult} query
     */
    function onDragStartOutput(e, query) {
        //draw a new wire from the input, gategraph will handle merging it with any existing connections
        circuitDraggable.drag(e, query, circuitContainer)

        //same as the end of onDragStartInput
        svgConnectionPoints = gridController.drawConnectionPoints(ConnectionSvg, "Input")
        onDragOutput(e)
    }

    /**
     * onDragStart calls this when the event passed to it selected an input connection.
     * It also needs a query referencing the id of the gate and the index of the connection to proceed.
     * 
     * @param {MouseEvent} e
     * @param {CircuitControllerQueryResult} query
     */
    function onDragStartGate(e, query) {
        circuitDraggable.drag(e, query, circuitContainer)
    }

    /**
     * The svg string of a gate, if one is being previewed during a drag
     * 
     */
    let activeSvgGate = ""

    /**
     * Called after the user has started a drag. 
     * Keeps activeSvgGate and activeSvgWire updated to preview the changes to user is trying to make.
     * 
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
     * onDrag calls this whenever the mouse moves and the user is dragging a gate.
     * Handles displaying a gate, invoking different functions for adding a gate versus moving an existing one,
     * since moving a gate won't collide with itself and so shouldn't appear as it does, but adding a new gate will collide with any other.
     * 
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
     * onDrag calls this whenever the mouse moves and the user is dragging a wire from an input.
     * 
     * @param {MouseEvent} e
     */
    function onDragInput(e) {
        const contents = circuitDraggable.getController().getContents()
        activeSvgWire = wireSvg(
            gridController.getConnectionPoint(
                {id:contents.getId() || 0, type:"Input", index:contents.connectionIndex || 0}
            ),
            gridController.unprojectOffset(e.offsetX, e.offsetY)
        )
    }

    /**
     * onDrag calls this whenever the mouse moves and the user is dragging a wire from an output.
     * 
     * @param {MouseEvent} e
     */
    function onDragOutput(e) {
        const contents = circuitDraggable.getController().getContents()
        activeSvgWire = wireSvg(
            gridController.unprojectOffset(e.offsetX, e.offsetY),
            gridController.getConnectionPoint(
                {id:contents.getId() || 0, type:"Output", index:contents.connectionIndex || 0}
            )
        )
    }

    /**
     * Called at the end of a user's drag, calling dropGate or dropConnection depending on the type of the drag contents.
     * 
     * Also calls removeMouseMoveListener, calls updateSvg, and clears the active svg strings. 
     * 
     * @param {MouseEvent} e
     */
    function onDrop(e) {

        const result = circuitDraggable.drop(e)

        const cType = result.type

        switch (cType) {
            case "Gate": 
                dropGate(result, e)
                break
            case "Input":
            case "Output":
                const query = gridController.query(e.offsetX, e.offsetY)
                dropConnection(result, query)
                break
            default: return
        }
        
        removeMouseMoveListener()

        activeSvgGate = ""
        activeSvgWire = ""

        updateSvg()
    }

    /**
     * onDrop calls this when dropping a Gate.
     * 
     * The circuitpanel-overhaul branch should have fully isolated the Gate class from the view, making it a proper model class.
     * While we can technically still reference it here, there's no need. Gates are added via their readonly gateType, and moved/removed via their id.
     * 
     * @param {CircuitControllerQueryResult} result
     * @param {MouseEvent} e
     */
    function dropGate(result, e) {
        const id = result.getId()

        if (!gridController.isOffsetInGrid(e.offsetX, e.offsetY)) {
            if (id !== undefined) {
                gridController.removeGate(id)
            }
            return
        }

        const gType = result.gateType || Buf
        if (id === undefined) {
            console.log(id)
            gridController.addGate(gType, e.offsetX, e.offsetY)
        }
        else {
            gridController.moveGate(id, e.offsetX, e.offsetY)
        }
    }

    /**
     * onDrop calls this when dropping a connection, passing two queries for a start and end.
     * 
     * Only does stuff when the queries have opposite connection types, evading any undefined behavior from connecting two inputs or trying to connect a wire to nothing.
     * 
     * @param {CircuitControllerQueryResult} qa
     * @param {CircuitControllerQueryResult} qb
     */
    function dropConnection(qa, qb) {
        switch (qa.type + qb.type) {
            case "OutputInput":
                console.log("laying connection from ", qa, qb)
                gridController.addConnection(
                    qa.getId() || 0, qa.connectionIndex || 0, 
                    qb.getId() || 0, qb.connectionIndex || 0
                );
                break
            case "InputOutput":
                console.log("laying connection from ", qb, qa)
                gridController.addConnection(
                    qb.getId() || 0, qb.connectionIndex || 0, 
                    qa.getId() || 0, qa.connectionIndex || 0
                );
                break
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
        width:100%;
    }

    .circuit-svg {
        pointer-events: none;
        display: flex;
    }
</style>
