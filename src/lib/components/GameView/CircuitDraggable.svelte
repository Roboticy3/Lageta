
<script>
    import GameViewCircuitPanel from './GameViewCircuitPanel.svelte';

    import { CircuitController, CircuitControllerQueryResult } from "$lib/circuit_types/CircuitController";
    import { CircuitDragDropController } from "$lib/circuit_types/CircuitDragDropController";
    import { GateType } from "$lib/circuit_types/Gate";
    import { getGateTypeSvgContents, getGateTypeSvg } from "../GateSvgs.svelte";
    import { onMount } from 'svelte';

    let contents = ""

    onMount(() => {
        window.addEventListener("mousemove", onMouseMove)
    })

    /**
     * @type {CircuitController}
     */
    export let circuitController

    let circuitDragDropController = new CircuitDragDropController(circuitController)

    /**
     * @param {MouseEvent} e
     * @param {GateType} type
     * @param {HTMLElement | null} element
     */
    export function dragGateType(e, type, element=null) {
        circuitDragDropController.dragStartGateType(type, e, element) 
        resolveContents()
        onMouseMove(e)
    }

    function resolveContents() {
        const item = circuitDragDropController.getGateType()
        if (item !== undefined) {
            contents = getGateTypeSvg(item)
            return
        }
        contents = ""
    }

    let posX = 0
    let posY = 0

    /**
     * @param {MouseEvent} e
     * @param {CircuitControllerQueryResult} query
     * @param {HTMLElement | null} element
     */
     export function drag(e, query, element=null) {
        circuitDragDropController.dragStart(query, e, element)
        resolveContents()
        onMouseMove(e)
    }

    /**
     * @param {MouseEvent} e
     */
    function onMouseMove(e) {
        posX = e.pageX
        posY = e.pageY
        if (isDragging()) {
            circuitDragDropController.dragCircuit(e)
        }
    }

    /**
     * 
     * @param {MouseEvent} e
     */
    export function drop(e) {
        const result = circuitDragDropController.dragEnd(e)
        resolveContents()
        return result
    }

    export function getController() {
        return circuitDragDropController
    }

    export function isDragging() {
        return circuitDragDropController.hasContents()
    }
</script>

<div class="contents" style="top:{posY}px; left:{posX}px;">{@html contents}</div>

<style>
    .contents {
        pointer-events: none;
        position: absolute;
        width: 30px;
    }
</style>