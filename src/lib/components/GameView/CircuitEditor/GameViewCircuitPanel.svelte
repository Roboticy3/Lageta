<script>
    import CircuitDraggable from './CircuitDraggable.svelte';

    import { onMount, tick } from 'svelte';

    import CircuitRenderer from './CircuitRenderer.svelte';
    
    import { CircuitController } from '$lib/circuit_types/CircuitController';
import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { GameViewParameters } from '$lib/level_types/GameViewParameters';
    import { Buf, Input, all_gates, getGateType } from '$lib/dat/GateTypes/GateTypes';
    import InputCheckBox from './InputCheckBox.svelte';
    import { GateTypeController } from '$lib/circuit_types/GateType';
    import { GameViewCircuitPanelEventTarget, createGameViewCircuitPanelEvent } from '$lib/circuit_types/GameViewCircuitPanelEvent';

    /**
     * @type {GameViewParameters}
    */
    export let gameParams

    export let rendererParams

    /**
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {CircuitDraggable}
     */
    export let circuitDraggable 

    /**
     * @type {HTMLDivElement | null}
     */
    let circuitContainer = null;

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
     */
    export let editorEventTarget

    /**
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEventKey} type
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEventListener} listener
     */
    export function addEventListener(type, listener) {
        editorEventTarget?.addEventListener(type, listener)
    }

    /**
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEventKey} type
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEventListener} listener
     */
    export function removeEventListener(type, listener) {
        editorEventTarget?.removeEventListener(type, listener)
    }

    /**
     * @type {CircuitRenderer}
    */
    let circuitRenderer

    export function getRenderer() {
        return circuitRenderer
    }

    $: {
        if (circuitRenderer) {
            circuitController.giveRenderer(circuitRenderer)
            circuitController.addGraphListener("update", ({id}) => {
                circuitRenderer.updateGate(id)
            })
        }
    }

    /**
     * @param {string} qs
     */
    export function getElement(qs) {
        return getRenderer()?.getElement(qs) || null
    }
    
    /**
     * 
     * @param {MouseEvent} e
     * @param {CircuitController} controller
     * @returns {CircuitControllerQueryResult} A CircuitControllerQueryResult that may contain a gate, as well as a connection.
     */
    export function query(
        e,
        controller = circuitController
    )
    {
        return controller.query(e)
    }

    /**
     * @param {number | undefined} id
     * @param {"" | "Gate" | "Input" | "Output" | undefined} type
     * @param {number | undefined} connectionIndex
     * @param {CircuitController} controller
     * @return {CircuitControllerQueryResult}
     */
     export function toQuery(id, type, connectionIndex, controller) {
        return controller.toQuery(id, type, connectionIndex)
    }

    /**
     * Add all events needed to edit the circuit, name is a hold-over from when the project used the drag and drop api
     */
    async function addDragEventListeners() {
        if (circuitContainer == null || editorEventTarget == null) {
            return
        }

        circuitContainer.addEventListener("mousedown", dragStart)
        editorEventTarget.addEventListener("dragstart", onDragStart)

        circuitContainer.addEventListener("mousemove", onMouseMove)
        circuitContainer.addEventListener("mousemove", drag)
        editorEventTarget.addEventListener("drag", onDrag)

        circuitContainer.addEventListener("mouseup", drop)
        editorEventTarget.addEventListener("drop", onDrop)

        await tick()
    }

    /**
     * Attaches the onDrag function to the circuitContainer div's mousemove event. 
     * Used by addDragEventListeners such that it will be called whenever a drag starts. 
     * The component will then call onDrag whenever the mouse moves until the drag ends.
     */
    function addMouseMoveListener() {
        if (circuitContainer == null) {
            return
        }

        circuitContainer.removeEventListener("mousemove", onMouseMove)
        circuitContainer.addEventListener("mousemove", drag)
        window.addEventListener("mousemove", moveDraggable)
    }

    /**
     * Disconnect onDrag from mousemove
     */
     function removeMouseMoveListener() {
        if (circuitContainer == null) {
            return
        }

        circuitContainer.removeEventListener("mousemove", drag)
        window.removeEventListener("mousemove", moveDraggable)
        circuitContainer.addEventListener("mousemove", onMouseMove)
    }

    /**
     * @param {MouseEvent} e
     */
    function moveDraggable(e) {
        //circuitDraggable.onMouseMove(e)
    }
    
    /**
     * Called in onMount, runs addDragEventListeners, updateViewBox, and updateSvg
     * These functions all adjust the input handling and display of the circuit, and can be called again whenever appropriate.
     */
    let mountCircuit = () => {
        addDragEventListeners()
    }
    onMount(mountCircuit)

    /**
     * @type {any}
     */
    export let editorParams = {}

    /**
     * 
     * @param {MouseEvent} e
     * @returns {"Already Dragging" | "Nothing Under Mouse" | CircuitControllerQueryResult}
     */
    function canDragStart(e) {
        if (circuitDraggable.isDragging()) return "Already Dragging"

        const q = query(e)     

        if (q.type === "") {
            return "Nothing Under Mouse"
        }

        return q
        
    }

    /**
     * @param {CircuitControllerQueryResult} q
     */
    function canDragStartGate(q) {
        return editorParams.canDragGates !== false && circuitController.getGateTypeView(q.getId() || -1)?.moveable === true
    }

    /**
     * @param {MouseEvent} e
     */
    function dragStart(e) {
        const q = canDragStart(e)
        if (
            !(q instanceof CircuitControllerQueryResult) || 
            !circuitContainer || 
            editorParams.dispatchEvents === false
        ) return
        editorEventTarget?.dispatchEvent(
            createGameViewCircuitPanelEvent(
                "dragstart", q, q, circuitContainer
            )
        )
    }

    /**
     * addDragEventListeners should hook circuitController up so it starts when the user selects an object in the circuitContainer div.
     * Outside of that div, other components will be in charge of starting a drag.
     * 
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0 
     */
    function onDragStart({from}) {

        switch (from.type) {
            case "Input":
                if (editorParams.canDragConnections !== false) onDragStartInput(from)
                break
            case "Output":
                if (editorParams.canDragConnections !== false) onDragStartOutput(from)
                break
            case "Gate":
                console.log(canDragStartGate(from))
                if (canDragStartGate(from)) onDragStartGate(from)
        }
    }

    /**
     * onDragStart calls circuitController when the event passed to it selected an input connection.
     * It also needs a query referencing the id of the gate and the index of the connection to proceed.
     * 
     * Dragging from an empty input should create a new wire, 
     * while dragging from a populated input should appear to reroute the existing connection.
     * 
     * @param {CircuitControllerQueryResult} query
     */
    function onDragStartInput(query) {
        //check if an input wire is already there
        const index = [query.getId() || 0, query.connectionIndex || 0]
        const connected = circuitController.getConnectedTo(
            index[0], index[1]
        )

        console.log("Checking if input is already connected:", connected)

        let q = query
        //if so, "consume" the wire, deleting its connection and starting an active wire from the same output as the original
        if (connected && circuitContainer) {

            //we can coerce the onDrag functions to do circuitController by simply switching out the query for one originating from the output
            //SKETCHY: query loses localOffset and pageOffset data
            q = toQuery(connected[0], "Output", connected[1], circuitController)   
            //then we can delete the old connection
            circuitController.removeConnection(
                {id:index[0], type:"Input", index:index[1]}
            )

            //tell onDragStartOutput it's business as usual and pretend we didn't do any of circuitController nonsense behind its back
            onDragStartOutput(q)

            return
        }

        //otherwise, just start a drag
        //circuitDraggable.drag(q, circuitContainer)

        //updates the activeSvgWire without having to wait until the user moves their mouse, so they don't get too confused
        onDragInput({from:q, to:q})

        //draw only the connection points that can be connected to from here
        //svgConnectionPoints = gridController.drawConnectionPoints(ConnectionSvg, "Output")
    }

    /**
     * onDragStart calls circuitController when the event passed to it selected an input connection.
     * It also needs a query referencing the id of the gate and the index of the connection to proceed.
     * 
     * @param {CircuitControllerQueryResult} query
     */
    function onDragStartOutput(query) {
        //draw a new wire from the input, gategraph will handle merging it with any existing connections
        //circuitDraggable.drag(query, circuitContainer)

        //same as the end of onDragStartInput
        //svgConnectionPoints = gridController.drawConnectionPoints(ConnectionSvg, "Input")
        onDragOutput({from:query, to:query})
    }

    /**
     * onDragStart calls circuitController when the event passed to it selected an input connection.
     * It also needs a query referencing the id of the gate and the index of the connection to proceed.
     * 
     * @param {CircuitControllerQueryResult} query
     */
    function onDragStartGate(query) {
        //circuitDraggable.drag(query, circuitContainer)
    }

    export let forceDragOnCircuitContainerOnly = true

    /**
     * Check if a gate can be dragged, return a code depending on what goes wrong.
     * 
     * This works beautifully with the string codes from circuitDraggable.getController().getContentType(),
     * creating a union of the error codes and the drag type codes.
     * @param {MouseEvent} e
     */
    export function canDrag(e) {
        if (e.target !== circuitRenderer.getSvgHead()) {
            return "Bad Target"
        }

        if (!circuitController.isOffsetInGrid(e.offsetX, e.offsetY)) {
            return "Out of Bounds"
        }

        const controller = circuitDraggable.getController()
        const dragType = controller.getContentType()
        const q = query(e)

        if (q.type === "") {
            return "Nothing Under Mouse"
        }

        if (dragType === "") {
            return "Nothing Under Drag"
        }

        return q
    }

    /**
     * @param {MouseEvent} e
     */
    function drag(e) {
        const q = canDrag(e)
        if (
            !(q instanceof CircuitControllerQueryResult) || 
            !circuitContainer || 
            editorParams.dispatchEvents === false
        ) return
        editorEventTarget?.dispatchEvent(
            createGameViewCircuitPanelEvent(
                "drag",
                circuitDraggable.getController().getContents(),
                q,
                circuitContainer
            )
        )
    }

    /**
     * Called after the user has started a drag. 
     * 
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function onDrag({from, to}) {
        
        switch(from.type) {
            case "Gate":
                onDragGate({from, to})
                break
            case "Input":
                onDragInput({from, to})
                break
            case "Output":
                onDragOutput({from, to})
                break
        }

        console.log("Dragging...")
    }

    /**
     * 
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function onDragGate({from, to}) {

        const [cType, id, localOffset] = [from.gateTypeController, from.getId(), to.getLocalOffset()];

        if (!cType || !localOffset) return
    }

    /**
     * onDrag calls circuitController whenever the mouse moves and the user is dragging a wire from an input.
     * 
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function onDragInput({from, to}) {
        if (to.type === "Output") {
            checkEntered(to)
        }
        else {
            checkEntered(new CircuitControllerQueryResult())
        }
    }

    /**
     * onDrag calls circuitController whenever the mouse moves and the user is dragging a wire from an output.
     * 
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function onDragOutput({from, to}) {
        if (to.type === "Input") {
            checkEntered(to)
        }
        else {
            checkEntered(new CircuitControllerQueryResult())
        }
    }

    /**
     * @param {MouseEvent} e
     */
    function drop(e) {
        const to = query(e)
        if (
            !(to instanceof CircuitControllerQueryResult) || 
            !circuitContainer || 
            editorParams.dispatchEvents === false
        ) return
        editorEventTarget?.dispatchEvent(
            createGameViewCircuitPanelEvent(
                "drop",
                circuitDraggable.getController().getContents(),
                to,
                circuitContainer
            )
        )
    }

    /**
     * Called at the end of a user's drag, calling dropGate or dropConnection depending on the type of the drag contents.
     * 
     * Also calls removeMouseMoveListener, calls updateSvg, and clears the active svg strings. 
     * 
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function onDrop({from, to}) {

        const source = circuitDraggable.getController().getContents()
        //const result = circuitDraggable.drop(to)

        switch (to.type) {
            case "Gate": 
                dropGate({from, to})
                break
            case "Input":
            case "Output":
                console.log(to)
                dropConnection({from, to})
                break
            default: return
        }
        
        removeMouseMoveListener()
        
        currentQuery = new CircuitControllerQueryResult()
        checkEntered(to)
    }

    /**
     * onDrop calls circuitController when dropping a Gate.
     * 
     * The circuitpanel-overhaul branch should have fully isolated the Gate class from the view, making it a proper model class.
     * While we can technically still reference it here, there's no need. Gates are added via their readonly gateType, and moved/removed via their id.
     * 
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function dropGate({from, to}) {
        if (!to.localOffset) return
        const [localX, localY] = to.localOffset

        const id = from.getId()
        
        const cType = from.gateTypeController || getGateType(Buf)
        let controllerResult = "Ok"
        if (id === undefined) {
            controllerResult = circuitController.addGateLocal(cType, localX, localY)
        }
        else {
            controllerResult = circuitController.moveGateLocal(id, localX, localY)
        }

        console.log("dropped gate with code ", controllerResult)

        if (controllerResult !== "Ok") {
            if (id !== undefined) {
                circuitController.removeGate(id)
            }
            return
        }
    }

    /**
     * onDrop calls circuitController when dropping a connection, passing two queries for a start and end.
     * 
     * Only does stuff when the queries have opposite connection types, evading any undefined behavior from connecting two inputs or trying to connect a wire to nothing.
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function dropConnection({from, to}) {
        switch (from.type + to.type) {
            case "OutputInput":
                console.log("laying connection from ", from, " to ", to)
                circuitController.addConnection(
                    from.getId() || 0, from.connectionIndex || 0, 
                    to.getId() || 0, to.connectionIndex || 0
                );
                break
            case "InputOutput":
                console.log("laying connection from ", from, " to ", to)
                circuitController.addConnection(
                    from.getId() || 0, from.connectionIndex || 0, 
                    to.getId() || 0, to.connectionIndex || 0
                );
                break
        }
    }


    let currentQuery = new CircuitControllerQueryResult()
    /**
     * @param {MouseEvent} e
     */
    function onMouseMove(e) {
        const newQ = query(e)
        checkEntered(newQ)
    }

    /**
     * @param {CircuitControllerQueryResult} q
     */
    function checkEntered(q) {     
        if (!currentQuery.contentEquals(q)) {
            circuitRenderer.onEntered(q)
            circuitRenderer.onExited(currentQuery)
        }
        currentQuery = q
    }
 
</script>

<div
    class="circuit-container" 
    role="application"
    id="circuit-container"
    bind:this={circuitContainer}
    >

    <CircuitRenderer 
        bind:this={circuitRenderer}
        circuitController={circuitController} 
        circuitDraggable={circuitDraggable} 
        rendererParams={rendererParams}
        editorEventTarget={editorEventTarget}
    >
    </CircuitRenderer>

    {#if editorParams.inputCheckBoxes !== false}
        {#each circuitController.getInputIds() as id}
            <InputCheckBox gridController={circuitController} from={id} editorEventTarget={editorEventTarget}/>
        {/each} 
    {/if}

    <slot />
</div>

<style>
    .circuit-container {
        height:100%;
        overflow: hidden;
        position:relative;
    }
</style>
