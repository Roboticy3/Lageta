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
     * @type {CircuitRenderer}
    */
    let circuitRenderer

    export function getRenderer() {
        return circuitRenderer
    }
    
    /**
     * 
     * @param {number} offsetX 
     * @param {number} offsetY 
     * @param {CircuitController} controller
     * @returns {CircuitControllerQueryResult} A CircuitControllerQueryResult that may contain a gate, as well as a connection.
     */
    export function query(
        offsetX,
        offsetY,
        controller = circuitController
    )
    {
        const [localX, localY] = controller.unprojectOffset(offsetX, offsetY)
        
        const [x, y] = controller.gateGrid.offsetToIndex(localX, localY)
        const gate = controller.gateGrid.get(x, y)
        if (gate === undefined) {
            return new CircuitControllerQueryResult()
        }
        const [gridOffsetX, gridOffsetY] = [gate.x * 10, gate.y * 10]
        const gType = gate.type
        const cType = all_gates.get(gType.name)
        if (cType === undefined) {
            return new CircuitControllerQueryResult()
        }
        const vType = cType.view

        const inputOffsets = vType.inputOffsets
        let i = 0;
        for (; i < gType.sizeIn; i++) {
            const offset = [inputOffsets[i][0] + gridOffsetX, inputOffsets[i][1] + gridOffsetY]
            const dX = localX - offset[0]
            const dY = localY - offset[1]

            const d = circuitController.gridEuclidDistance(dX, dY)
            if (d < 5) {
                break
            }
        }

        if (i != gType.sizeIn) {
            return new CircuitControllerQueryResult(
                gate,
                "Input",
                i,
                cType
            ) 
        }

        const outputOffsets = vType.outputOffsets
        i = 0
        for (; i < gType.sizeOut; i++) {
            const offset = [outputOffsets[i][0] + gridOffsetX, outputOffsets[i][1] + gridOffsetY]
            const dX = localX - offset[0]
            const dY = localY - offset[1]

            const d = circuitController.gridEuclidDistance(dX, dY)
            if (d < 5) {
                break
            }
        }

        if (i != gType.sizeOut) {
            return new CircuitControllerQueryResult(
                gate,
                "Output",
                i,
                cType
            ) 
        }

        return new CircuitControllerQueryResult(
            gate,
            "Gate",
            undefined,
            cType
        ) 
    }

    /**
     * @param {number | undefined} id
     * @param {"" | "Gate" | "Input" | "Output" | undefined} type
     * @param {number | undefined} connectionIndex
     * @param {CircuitController} controller
     */
     export function toQuery(id, type, connectionIndex, controller) {
        const gate = controller.gateGrid.gates[id || 0]
        return new CircuitControllerQueryResult(
            gate, type || "", connectionIndex, controller.getGateTypeController(id || 0)
        )
    }

    /**
     * Add all events needed to edit the circuit, name is a hold-over from when the project used the drag and drop api
     */
    async function addDragEventListeners() {
        if (circuitContainer == null) {
            return
        }

        circuitContainer.addEventListener("mousedown", onDragStart)
        circuitContainer.addEventListener("mouseup", onDrop)
        circuitContainer.addEventListener("mousemove", onMouseMove)

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
            return
        }

        circuitContainer.addEventListener("mousemove", onDrag)
        window.addEventListener("mousemove", moveDraggable)
    }

    /**
     * Disconnect onDrag from mousemove
     */
     function removeMouseMoveListener() {
        if (circuitContainer == null) {
            return
        }

        circuitContainer.removeEventListener("mousemove", onDrag)
        window.removeEventListener("mousemove", moveDraggable)
    }

    /**
     * @param {MouseEvent} e
     */
    function moveDraggable(e) {
        circuitDraggable.onMouseMove(e, query(e.offsetX, e.offsetY))
    }
    
    /**
     * Called in onMount, runs addDragEventListeners, updateViewBox, and updateSvg
     * These functions all adjust the input handling and display of the circuit, and can be called again whenever appropriate.
     */
    let mountCircuit = () => {
        addDragEventListeners()
        circuitController.giveRenderer(circuitRenderer)
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

        const q = query(e.offsetX, e.offsetY)     

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
     * addDragEventListeners should hook circuitController up so it starts when the user selects an object in the circuitContainer div.
     * Outside of that div, other components will be in charge of starting a drag.
     * 
     * @param {MouseEvent} e
     */
    function onDragStart(e) {
        e.preventDefault()

        const check = canDragStart(e)
        if (!(check instanceof CircuitControllerQueryResult)) return

        switch (check.type) {
            case "Input":
                if (editorParams.canDragConnections !== false) onDragStartInput(e, check)
                break
            case "Output":
                if (editorParams.canDragConnections !== false) onDragStartOutput(e, check)
                break
            case "Gate":
                if (canDragStartGate(check)) onDragStartGate(e, check)
        }
    }

    /**
     * onDragStart calls circuitController when the event passed to it selected an input connection.
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
        const connected = circuitController.getConnectedTo(
            index[0], index[1]
        )

        console.log("Checking if input is already connected:", connected)

        let q = query
        //if so, "consume" the wire, deleting its connection and starting an active wire from the same output as the original
        if (connected) {

            //we can coerce the onDrag functions to do circuitController by simply switching out the query for one originating from the output
            q = toQuery(connected[0], "Output", connected[1], circuitController)   
            console.log(q)
            //then we can delete the old connection
            circuitController.removeConnection(
                {id:index[0], type:"Input", index:index[1]}
            )

            //tell onDragStartOutput it's business as usual and pretend we didn't do any of circuitController nonsense behind its back
            onDragStartOutput(e, q)

            return
        }

        //otherwise, just start a drag
        circuitDraggable.drag(e, q, circuitContainer)

        //updates the activeSvgWire without having to wait until the user moves their mouse, so they don't get too confused
        onDragInput(e)

        //draw only the connection points that can be connected to from here
        //svgConnectionPoints = gridController.drawConnectionPoints(ConnectionSvg, "Output")
    }

    /**
     * onDragStart calls circuitController when the event passed to it selected an input connection.
     * It also needs a query referencing the id of the gate and the index of the connection to proceed.
     * 
     * @param {MouseEvent} e
     * @param {CircuitControllerQueryResult} query
     */
    function onDragStartOutput(e, query) {
        //draw a new wire from the input, gategraph will handle merging it with any existing connections
        circuitDraggable.drag(e, query, circuitContainer)

        //same as the end of onDragStartInput
        //svgConnectionPoints = gridController.drawConnectionPoints(ConnectionSvg, "Input")
        onDragOutput(e)
    }

    /**
     * onDragStart calls circuitController when the event passed to it selected an input connection.
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
            activeSvgGate = ""
            return "Out of Bounds"
        }

        const controller = circuitDraggable.getController()
        const dragType = controller.getContentType()

        if (dragType === "") {
            return "Nothing Under Mouse"
        }

        return dragType
    }

    /**
     * Called after the user has started a drag. 
     * Keeps activeSvgGate and activeSvgWire updated to preview the changes to user is trying to make.
     * 
     * @param {MouseEvent} e
     */
    function onDrag(e) {
        
        switch(canDrag(e)) {
            case "Gate":
                onDragGate(e)
                break
            case "Input":
                onDragInput(e)
                break
            case "Output":
                onDragOutput(e)
                break
            case "Nothing Under Mouse":
                onDrop(e)
                break
            default: return
        }
        
        
        console.log("Dragging...")
    }

    /**
     * @returns {"No GateType" | [GateTypeController, number | undefined]}
     */
    function getDraggedGateData() {
        const controller = circuitDraggable.getController()
        const cType = controller.getGateType()
        if (cType === undefined) return "No GateType"

        const id = controller.getId()

        return [cType, id]
    }

    /**
     * onDrag calls circuitController whenever the mouse moves and the user is dragging a gate.
     * Handles displaying a gate, invoking different functions for adding a gate versus moving an existing one,
     * since moving a gate won't collide with itself and so shouldn't appear as it does, but adding a new gate will collide with any other.
     * 
     * @param {MouseEvent} e
     */
    function onDragGate(e) {
        const check = getDraggedGateData()

        if (check === "No GateType") return
        const [cType, id] = check;
        
        const result = id ? 
            circuitController.previewMoveGate(
                id,
                e.offsetX,
                e.offsetY
            ) :
            circuitController.previewAddGate(
                cType,
                e.offsetX,
                e.offsetY
            )

        activeSvgGate = `<g ${circuitController.getGateSvgTransform(
            {type:cType.model, x:result.at[0], y:result.at[1]}
        )}>${cType.view.draw()}</g>`
    }

    /**
     * onDrag calls circuitController whenever the mouse moves and the user is dragging a wire from an input.
     * 
     * @param {MouseEvent} e
     */
    function onDragInput(e) {
        const contents = circuitDraggable.getController().getContents()
        
    }

    /**
     * onDrag calls circuitController whenever the mouse moves and the user is dragging a wire from an output.
     * 
     * @param {MouseEvent} e
     */
    function onDragOutput(e) {
        const contents = circuitDraggable.getController().getContents()
        
    }

    /**
     * Called at the end of a user's drag, calling dropGate or dropConnection depending on the type of the drag contents.
     * 
     * Also calls removeMouseMoveListener, calls updateSvg, and clears the active svg strings. 
     * 
     * @param {MouseEvent} e
     */
    function onDrop(e) {

        const q = query(e.offsetX, e.offsetY)
        const result = circuitDraggable.drop(e, q)

        const cType = result.type

        switch (cType) {
            case "Gate": 
                dropGate(result, e)
                break
            case "Input":
            case "Output":
                console.log(q)
                dropConnection(result, q)
                break
            default: return
        }
        
        removeMouseMoveListener()
    }

    /**
     * onDrop calls circuitController when dropping a Gate.
     * 
     * The circuitpanel-overhaul branch should have fully isolated the Gate class from the view, making it a proper model class.
     * While we can technically still reference it here, there's no need. Gates are added via their readonly gateType, and moved/removed via their id.
     * 
     * @param {CircuitControllerQueryResult} result
     * @param {MouseEvent} e
     */
    function dropGate(result, e) {
        const id = result.getId()

        if (!circuitController.isOffsetInGrid(e.offsetX, e.offsetY)) {
            if (id !== undefined) {
                circuitController.removeGate(id)
            }
            return
        }

        const cType = result.gateTypeController || getGateType(Buf)
        if (id === undefined) {
            circuitController.addGate(cType, e.offsetX, e.offsetY)
        }
        else {
            circuitController.moveGate(id, e.offsetX, e.offsetY)
        }
    }

    /**
     * onDrop calls circuitController when dropping a connection, passing two queries for a start and end.
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
                circuitController.addConnection(
                    qa.getId() || 0, qa.connectionIndex || 0, 
                    qb.getId() || 0, qb.connectionIndex || 0
                );
                break
            case "InputOutput":
                console.log("laying connection from ", qb, qa)
                circuitController.addConnection(
                    qb.getId() || 0, qb.connectionIndex || 0, 
                    qa.getId() || 0, qa.connectionIndex || 0
                );
                break
        }

    }


    let currentQuery = new CircuitControllerQueryResult()
    /**
     * @param {MouseEvent} e
     */
    function onMouseMove(e) {
        const newQ = query(e.offsetX, e.offsetY)
        let good = true
        switch (newQ.type) {
            case "Gate": good = canDragStartGate(newQ)
        }
        if (good) {
            checkEntered(newQ)
            currentQuery = newQ
        }
    }

    /**
     * @param {CircuitControllerQueryResult} q
     */
    function checkEntered(q) {     
        if (!currentQuery.contentEquals(q)) {
            circuitRenderer.onEntered(q)
            circuitRenderer.onExited(currentQuery)
        }
    }

</script>

<div
    class="circuit-container" 
    role="application"
    bind:this={circuitContainer}
    >

    <CircuitRenderer 
        bind:this={circuitRenderer}
        circuitController={circuitController} 
        circuitDraggable={circuitDraggable} 
        rendererParams={rendererParams}
    >
    </CircuitRenderer>

    {#if editorParams.inputCheckBoxes !== false}
        {#each circuitController.getInputIds() as id}
            <InputCheckBox gridController={circuitController} from={id}/>
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
