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
    import { SFXPlayer } from '$lib/misc_types/SFXPlayer';
    import { CircuitSignalSetViewEventTarget } from '$lib/signal_types/SignalSetViewEvent';

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
    export let editorEventTarget = null
    $: {if (editorEventTarget) {
        editorEventTarget.addEventListener("addgate", onAddGate)
        editorEventTarget.addEventListener("movegate", onMoveGate)
        editorEventTarget.addEventListener("removegate", onRemoveGate)
        editorEventTarget.addEventListener("addwire", onAddWire)
        editorEventTarget.addEventListener("removewire", onRemoveWire)
    }}

    /**
     * optional event target to track when the signal is playing, since inputcheckboxes cannot be used then
     * @type {CircuitSignalSetViewEventTarget | null}
     */
    export let signalSetViewEventTarget 
    let signalPlaying = false

    $: { if (signalSetViewEventTarget) {
        signalSetViewEventTarget.addEventListener("play", () => {signalPlaying = true})
        signalSetViewEventTarget.addEventListener("pause", () => {signalPlaying = false})
    }}

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
        if (circuitContainer === null || editorEventTarget === null) {
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

    function loadAudio() {
        SFXPlayer.loadAudio([
            "inputgrab.wav",
            "outputgrab.wav",
            "wiredrop.wav",
            "gategrab.wav",
            "gatedrop.wav",
            "gatefail.wav",
        ])
        console.log("loaded audio ", SFXPlayer)
    }
    
    /**
     * Called in onMount, runs addDragEventListeners, updateViewBox, and updateSvg
     * These functions all adjust the input handling and display of the circuit, and can be called again whenever appropriate.
     */
    let mountCircuit = () => {
        if (!editorEventTarget) editorEventTarget = new GameViewCircuitPanelEventTarget()

        addDragEventListeners()

        setInitialEventListeners()

        loadAudio()
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
            (editorParams.canDragGates !== false) && 
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
                    const newQ = circuitController.toQuery(
                        connected[0], "Output", connected[1], undefined, undefined, q.timeStamp
                    )   
                    //then we can delete the old connection
                    editorEventTarget?.dispatchEvent(
                        createGameViewCircuitPanelEvent("removewire", newQ, q, circuitContainer)
                    )
                    //we can coerce the onDrag functions to do circuitController by simply switching out the query for one originating from the output
                    //SKETCHY: query loses localOffset and pageOffset data
                    q = newQ
                }
            }
        } 
        else if (q.type === "Gate") {
            if (!canDragStartGate(q)) {
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
            case "Input":
                if (editorParams.canDragConnections !== false) onDragStartInput(to)
                break
            case "Gate":
                onDragStartGate(to)
                break
        }

        setDragEventListeners()

        onDrag(evt)
    }

    /**
     * @param {CircuitControllerQueryResult} query
     */
    function onDragStartOutput(query) {
        SFXPlayer.play("outputgrab.wav")
    }

    /**
     * @param {CircuitControllerQueryResult} query
     */
    function onDragStartInput(query) {
        SFXPlayer.play("inputgrab.wav")
    }

    /**
     * @param {CircuitControllerQueryResult} query
     */
    function onDragStartGate(query) {
        SFXPlayer.play("gategrab.wav")
    }

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
    }

    /**
     * 
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function onDragGate({from, to}) {
        
    }

    /**
     * onDrag calls circuitController whenever the mouse moves and the user is dragging a wire from an input.
     * 
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function onDragInput({to}) {
        if (to.type === "Output" || to.type === "Gate") {
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
        if (to.type === "Input" || to.type === "Gate") {
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
                dropConnection({to, from})
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

        if (!circuitContainer) return

        const id = from.getId()
        if (id === undefined) {
            editorEventTarget?.dispatchEvent(
                createGameViewCircuitPanelEvent("addgate", from, to, circuitContainer)
            )
        }
        else {
            editorEventTarget?.dispatchEvent(
                createGameViewCircuitPanelEvent("movegate", from, to, circuitContainer)
            )
        }
    }

    /**
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function onAddGate({from, to}) {
        console.log("adding gate from ", from, " to ", to)

        const localOffset = to.localOffset
        if (!localOffset) return
        const [localX, localY] = localOffset
        const cType = from.gateTypeController
        if (!cType) return
        
        const result = circuitController.addGateLocal(cType, localX, localY)

        if (result === "Ok") {
            SFXPlayer.play("gatedrop.wav")
        }
        else {
            SFXPlayer.play("gatefail.wav")
        }
    }

    /**
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function onMoveGate({from, to}) {
        console.log("moving gate from ", from, " to ", to)

        const localOffset = to.localOffset
        if (!localOffset) return
        const [localX, localY] = localOffset
        const id = from.getId()
        if (!id) return
        
        const result = circuitController.moveGateLocal(id, localX, localY)

        if (result === "Ok") {
            SFXPlayer.play("gatedrop.wav")
        }
        else {
            if (circuitContainer) editorEventTarget?.dispatchEvent(
                createGameViewCircuitPanelEvent("removegate", from, to, circuitContainer)
            )
            SFXPlayer.play("gatefail.wav")
        }
    }

    /**
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function onRemoveGate({from}) {
        const id = from.getId()
        if (!id) return 
        
        circuitController.removeGate(id)
    }

    /**
     * onDrop calls circuitController when dropping a connection, passing two queries for a start and end.
     * 
     * Only does stuff when the queries have opposite connection types, evading any undefined behavior from connecting two inputs or trying to connect a wire to nothing.
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function dropConnection({from, to}) {
        if (circuitContainer) {
            editorEventTarget?.dispatchEvent(
                createGameViewCircuitPanelEvent("addwire", from, to, circuitContainer)
            )
        }
    }

    /**
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function onAddWire({from, to}) { 
        //detect if the user is placing input-to-output or output-to-input to decide what sound to play later
        const flipped = to.type === "Output"
        if (flipped) {
            const temp = from
            from = to
            to = temp
        }

        //define a connection
        const [fId, fC, tId, tC] = [
            from.getId(), from.connectionIndex,
            to.getId(), to.connectionIndex
        ]
        if (fId === undefined || 
            fC === undefined || 
            tId === undefined || 
            tC === undefined || 
            from.type === to.type
        ) {
            //play a sound to drop the wire if either endpoint is undefined
            SFXPlayer.play("wiredrop.wav")
            return
        }
        console.log("laying connection from ", [fId, fC], " to ", [tId, tC])
        
        //try to lay a connection
        const result = circuitController.addConnection(
            fId, fC, tId, tC
        );

        //play a sound
        if (result.error === "") {
            SFXPlayer.play(flipped ? "outputgrab.wav":"inputgrab.wav")
        }
        else {
            SFXPlayer.play("wiredrop.wav")
        }
    }

    /**
     * @param {import('$lib/circuit_types/GameViewCircuitPanelEvent').GameViewCircuitPanelEvent} param0
     */
    function onRemoveWire({to}) {
        const [id, index] = [to.getId(), to.connectionIndex]
        if (id === undefined || index === undefined || to.type === "Gate") return
        circuitController.removeConnection(
            {id:id, type:to.type, index:index}
        )
    }


    let currentQuery = new CircuitControllerQueryResult()
    /**
     * @param {MouseEvent} e
     */
    function onMouseMove(e) {
        const newQ = query(e)
        if (e.target === circuitRenderer.getSvgHead()) {checkEntered(newQ)}
    }

    /**
     * @param {CircuitControllerQueryResult} q
     */
    function checkEntered(q) {     
        if (!currentQuery.contentEquals(q)) {
            circuitRenderer.onExited(currentQuery)
            circuitRenderer.onEntered(q)
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

    {#if editorEventTarget}
        <CircuitRenderer 
            bind:this={circuitRenderer}
            circuitController={circuitController} 
            circuitDraggable={circuitDraggable} 
            rendererParams={rendererParams}
            editorEventTarget={editorEventTarget}
        >
        </CircuitRenderer>

        {#if editorParams.inputCheckboxes !== false && !signalPlaying}
            {#each circuitController.getInputIds() as id}
                <InputCheckBox 
                    gridController={circuitController} 
                    from={id} 
                    editorEventTarget={editorEventTarget} 
                />
            {/each} 
        {/if}
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
