
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { getCircuitDivRect } from "$lib/circuit_types/CircuitDiv";
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
     * @type {CircuitController}
     */
    export let circuitController

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
</script>

<div 
    style="position:absolute; left:{rect.left}px; top:{rect.top}px; width:{rect.width}px; height:{rect.height}px;" 
    bind:this={container}
>
    <slot name="sticker"/>
</div>