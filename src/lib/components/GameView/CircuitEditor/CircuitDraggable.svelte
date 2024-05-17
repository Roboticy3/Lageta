
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { CircuitDragDropController } from "$lib/circuit_types/CircuitDragDropController";
    import { onMount } from 'svelte';
    import { GateType, GateTypeController } from '$lib/circuit_types/GateType';
    import { getGateType, wrapGateTypeViewInSvgHeader } from '$lib/dat/GateTypes/GateTypes';

    let contents = ""

    /*
    //Since GameViewCircuitPanel is now responsible for queries, it will call onMouseMove and feed it query data remotely
    onMount(() => {
        window.addEventListener("mousemove", onMouseMove)
    })
    */

    /**
     * @type {CircuitController}
     */
    export let circuitController

    let circuitDragDropController = new CircuitDragDropController(circuitController)

    /**
     * @param {MouseEvent} e
     * @param {GateTypeController} type
     * @param {HTMLElement | null} element
     */
    export function dragGateType(e, type, element=null) {
        circuitDragDropController.dragStartGateType(type, e, element) 
        resolveContents()
        onMouseMove(e, circuitDragDropController.getContents())
    }

    function resolveContents() {
        const vType = circuitDragDropController.getGateType()?.view
        if (vType !== undefined) {
            contents = wrapGateTypeViewInSvgHeader(vType.gridWidth, vType.gridHeight, vType.draw())
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
        onMouseMove(e, query)
    }

    /**
     * @param {MouseEvent} e
     * @param {CircuitControllerQueryResult} q
      */
    export function onMouseMove(e, q) {
        posX = e.pageX
        posY = e.pageY
        const controller = getController()
        if (isDragging()) {
            const type = controller.getContentType()
            controller.dragCircuit(e, q)
        }
    }

    /**
     * @param {MouseEvent} e
     * @param {CircuitControllerQueryResult} q
     */
     export function drop(e, q) {
        const result = circuitDragDropController.dragEnd(e, q)
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