
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
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
     * @type {GameViewCircuitPanelEventTarget | null}
     */
    export let editorEventTarget

    let dragging = false

    let query = new CircuitControllerQueryResult()

    onMount(() => {
        editorEventTarget?.addEventListener("dragstart", onDragStart)
        editorEventTarget?.addEventListener("drop", onDrop)

        window.addEventListener("mousemove", onMouseMove)
    })


    export function resolveContents() {
        const vType = query.gateTypeController?.view
        if (vType !== undefined) {
            contents = wrapGateTypeViewInSvgHeader(vType.gridWidth, vType.gridHeight, vType.draw())
            return
        }
        contents = ""
    }

    /**
     * @param {string} name
     */
     export function setContentsToName(name) {
        contents = `<div style="background:white; width:fit-content;"><p>${name || "?"}</p></div>`
    }

    let posX = 0
    let posY = 0

    /**
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEvent} param0
     */
     export function onDragStart({from, to}) {
        query = from
        dragging = true
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
     export function onDrop({from, to}) {
        query = new CircuitControllerQueryResult()
        dragging = false
        resolveContents()
    }

    export function isDragging() {
        return dragging
    }

    export function getQuery() {
        return query
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