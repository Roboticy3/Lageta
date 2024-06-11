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

    /**
     * @type {any}
     */
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
     * Add all events needed to edit the circuit, name is a hold-over from when the project used the drag and drop api
     */
    function setInitialEventListeners() {
        if (circuitContainer == null) {
            return
        }

        circuitContainer.addEventListener("mousemove", onMouseMove)

        circuitContainer.addEventListener("mousedown", dragStart)

        circuitContainer.removeEventListener("mousemove", drag)
        window.removeEventListener("mouseup", drop)

    }

    function addDragEventListeners() {
        if (editorEventTarget == null) {
            return
        }
        editorEventTarget.addEventListener("drag", onDrag)
        editorEventTarget.addEventListener("dragstart", onDragStart)
        editorEventTarget.addEventListener("drop", onDrop)
    }

    /**
     * Attaches the onDrag function to the circuitContainer div's mousemove event. 
     * Used by addDragEventListeners such that it will be called whenever a drag starts. 
     * The component will then call onDrag whenever the mouse moves until the drag ends.
     */
    function setDragEventListeners() {
        if (circuitContainer == null) {
            return
        }

        circuitContainer.removeEventListener("mousemove", onMouseMove)

        circuitContainer.removeEventListener("mousedown", dragStart)

        circuitContainer.addEventListener("mousemove", drag)
        window.addEventListener("mouseup", drop)
    }
    
    /**
     * Called in onMount, runs addDragEventListeners, updateViewBox, and updateSvg
     * These functions all adjust the input handling and display of the circuit, and can be called again whenever appropriate.
     */
    let mountCircuit = () => {
        addDragEventListeners()

        setInitialEventListeners()
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
        const id = q.getId()
        return (
            editorParams.canDragGates !== false && 
            id &&
            circuitController.getGateTypeView(id)?.moveable === true
        )
    }

    /**
     * @param {MouseEvent} e
     */
    function dragStart(e) {
        let q = canDragStart(e)

        console.log("trying to start drag from ", q)

        if ( !(q instanceof CircuitControllerQueryResult)) return
        const [id, index] = [q.getId(), q.connectionIndex]

        if (
            id === undefined || !circuitContainer || 
            editorParams.dispatchEvents === false
        ) return

        if (q.type === "Input" || q.type === "Output") { 
            if (index === undefined) return

            if (q.type === "Input") {

                const connected = circuitController.getConnectedTo(id, index)

                if (connected && circuitContainer) {
                    //we can coerce the onDrag functions to do circuitController by simply switching out the query for one originating from the output
                    //SKETCHY: query loses localOffset and pageOffset data
                    q = circuitController.toQuery(
                        connected[0], "Output", connected[1], undefined, undefined, q.timeStamp
                    )   
                    //then we can delete the old connection
                    circuitController.removeConnection(
                        {id:id, type:"Input", index:index}
                    )
                }
            }
        } 
        else if (q.type === "Gate") {
            if (!(q.getGateType()?.view.moveable)) {
                return
            }
        }

        console.log("started drag from ", q)
        

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
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} evt 
     */
    function onDragStart(evt) {
        const to = evt.to

        switch (to.type) {
            case "Output":
                if (editorParams.canDragConnections !== false) onDragStartOutput(to)
                break
            case "Gate":
                if (canDragStartGate(to)) onDragStartGate(to)
        }

        setDragEventListeners()

        onDrag(evt)
    }

    /**
     * onDragStart calls circuitController when the event passed to it selected an input connection.
     * It also needs a query referencing the id of the gate and the index of the connection to proceed.
     * 
     * @param {CircuitControllerQueryResult} query
     */
    function onDragStartOutput(query) {

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

        const from = circuitDraggable.getQuery()

        if (from.type === "") {
            return "Nothing Under Drag"
        }

        return query(e)
    }

    /**
     * @param {MouseEvent} e
     */
    function drag(e) {
        const to = canDrag(e)
        if (
            !(to instanceof CircuitControllerQueryResult) || 
            !circuitContainer || 
            editorParams.dispatchEvents === false
        ) return
        const from = circuitDraggable.getQuery()
        console.log("dragging from ", from, " to ", to)
        editorEventTarget?.dispatchEvent(
            createGameViewCircuitPanelEvent(
                "drag",
                from, to,
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
    function onDragGate({to}) {

    }

    /**
     * onDrag calls circuitController whenever the mouse moves and the user is dragging a wire from an input.
     * 
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function onDragInput({to}) {
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
    function onDragOutput({to}) {
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
        
        let to = query(e)

        //since drop looks for window events, check if the query was over the circuit, and clear the local offset if not
        const svg = getRenderer().getSvgHead()
        if (e.target !== svg) {
            to = new CircuitControllerQueryResult(
                to.gate, to.type, to.connectionIndex, 
                to.gateTypeController, undefined, to.pageOffset,
                e.timeStamp
            )
        }

        if (
            !(to instanceof CircuitControllerQueryResult) || 
            !circuitContainer || 
            editorParams.dispatchEvents === false
        ) return

        const from = circuitDraggable.getQuery()

        //check that the from and to queries weren't too close together in time,
        //this allows the mouse to be clicked once to pick up, and again to drop later

        if (
            to.timeStamp === undefined || 
            from.timeStamp === undefined || 
            (to.timeStamp) - (from.timeStamp) < 250
        ) 
        {
            return
        }

        console.log("dropping drag from ", from, " to ", to)

        editorEventTarget?.dispatchEvent(
            createGameViewCircuitPanelEvent(
                "drop",
                from,
                to,
                e.target || circuitContainer
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

        switch (from.type) {
            case "Gate": 
                dropGate({from, to})
                break
            case "Input":
                dropConnection({from:to, to:from})
                break
            case "Output":
                dropConnection({from, to})
                break
            default: return
        }
        
        setInitialEventListeners()
        
        
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
        const localOffset = to.localOffset
        if (!localOffset) return
        const [localX, localY] = localOffset

        console.log("localOffset found")

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
        const [fId, fC, tId, tC] = [
            from.getId(), from.connectionIndex,
            to.getId(), to.connectionIndex
        ]
        if (fId === undefined || 
            fC === undefined || 
            tId === undefined || 
            tC === undefined || 
            from.type === to.type
        ) return
        console.log("laying connection from ", from, " to ", to)
        circuitController.addConnection(
            fId, fC, tId, tC
        );
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
