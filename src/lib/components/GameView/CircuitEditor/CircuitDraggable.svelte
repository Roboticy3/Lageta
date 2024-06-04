
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { CircuitDragDropController } from "$lib/circuit_types/CircuitDragDropController";
    import { onMount } from 'svelte';
    import { GateType, GateTypeController } from '$lib/circuit_types/GateType';
    import { getGateType, wrapGateTypeViewInSvgHeader } from '$lib/dat/GateTypes/GateTypes';
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";

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

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
     */
    export let editorEventTarget

    let circuitDragDropController = new CircuitDragDropController(circuitController)

    onMount(() => {
        editorEventTarget?.addEventListener("dragstart", onDragStart)
        editorEventTarget?.addEventListener("drag", onDrag)
        editorEventTarget?.addEventListener("drop", onDrop)

        window.addEventListener("mousemove", onMouseMove)
    })

    /**
     * @param {GateTypeController} type
     * @param {HTMLElement | null} element
     */
    export function dragGateType(type, element=null) {
        circuitDragDropController.dragStartGateType(type, element) 
        resolveContents()
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
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEvent} param0
     */
     export function onDragStart({from, to}) {
        circuitDragDropController.dragStart(from)
        resolveContents()
    }

    /**
     * @param {MouseEvent} e
      */
    export function onMouseMove(e) {
        posX = e.pageX
        posY = e.pageY
    }
    
    /**
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEvent} param0
     */
    export function onDrag({from, to}) {
        circuitDragDropController.dragCircuit(to)
    }

    /**
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEvent} param0
     */
     export function onDrop({from, to}) {
        const result = circuitDragDropController.dragEnd(to)
        resolveContents()
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