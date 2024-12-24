
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { getCircuitDivRect } from "$lib/circuit_types/CircuitDiv";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { Sticker, StickerType } from "$lib/circuit_types/sticker/Sticker";
    import { onMount, tick } from "svelte";

    /**
     * @type {[number, number]}
     */
    export let position

    /**
     * @type {[number, number]}
     */
    export let size
    $: gridRect = {
        left:position[0],
        top:position[1],
        width:size[0],
        height:size[1]
    }

    /**
     * Used as a source for queries to modify into sticker queries,
     * and for positioning on the circuit as an argument to getCircuitDivRect
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
     */
    export let editorEventTarget = null
    $: editorEventTarget?.addEventListener("removesticker", onRemoveSticker)

    /**
     * @type {Sticker}
     */
    export let sticker

    /**
     * @type {HTMLDivElement}
     */
    let container

    export function getContainer() {
        return container
    }

    let rect = {
        top:0,
        left:0,
        width:0,
        height:0
    }

    export function setOffset() {
        const newRect = getCircuitDivRect(gridRect, circuitController)
        if (newRect) rect = newRect
    }

    let resizeObserver = null
    $: {
        if (container?.parentElement) {
            resizeObserver = new ResizeObserver(setOffset)
            resizeObserver.observe(container.parentElement)
        }

        setOffset()
    }

    export function getPosition() {
        return position
    }

    /**
     * @param {[number, number]} newPosition
     */
    export function setPosition(newPosition) {
        position = newPosition
        setOffset()
    }

    /**
     * @param {MouseEvent} e
     */
    function removeSticker(e) {
        const q = circuitController.query(e, {})
        const modQ = new CircuitControllerQueryResult({
            gate:q.gate,
            type:"Sticker",
            connectionIndex:q.connectionIndex,
            gateTypeController:q.gateTypeController,
            sticker:sticker,
            stickerType:sticker.type,
            localOffset:q.localOffset,
            pageOffset:q.pageOffset,
            timeStamp:q.timeStamp
        })

        editorEventTarget?.dispatchEvent({
            type:"removesticker", 
            timeStamp:e.timeStamp, 
            target:e.target,
            from:modQ,
            to:modQ
        })
    }

    /**
     * @param {{from:CircuitControllerQueryResult, to:CircuitControllerQueryResult, target:EventTarget | null}} param0 
     */
    function onRemoveSticker({from, to, target}) {
        if (target === container) {
            container.parentElement?.removeChild(container)
        }
    }
</script>

<div 
    class="container" style="left:{rect.left}px; top:{rect.top}px; width:{rect.width}px; height:{rect.height}px;" 
    on:click={removeSticker}
    bind:this={container}
>
    <slot name="sticker"/>
</div>

<style>
    .container {
        position: absolute;
        pointer-events: all;
    }
</style>