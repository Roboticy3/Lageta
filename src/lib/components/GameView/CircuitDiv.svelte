
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { onMount, tick } from "svelte";

    export let active = true

    export let position = [0, 0]

    export let size = [1, 1]

    export let margin = 0.5

    /**
     * @type {string}
     */
    export let title

    /**
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {HTMLDivElement}
     */
    let container

    let start = [0, 0]
    let end = [0, 0]

    export function setOffset() {
        const localStart = circuitController.indexToOffset(position[0], position[1])
        const transform = circuitController.getMatrix()
        if (!transform) return

        start = circuitController.projectOffset(
            localStart[0] + margin * 10,
            localStart[1] + margin * 10
        )

        const gridEnd = [position[0] + size[0], position[1] + size[1]]
        const localEnd = circuitController.indexToOffset(gridEnd[0], gridEnd[1])

        end = circuitController.projectOffset(
            localEnd[0] - margin * 10,
            localEnd[1] - margin * 10
        )
    }

    onMount(async () => {
        await tick()
        setOffset()
        window.addEventListener('resize',setOffset)
    })

    export function activate() {
        active = true
        container?.querySelectorAll("input").forEach((n) => n.setAttribute('disabled', 'disabled'))
    }
    export function deactivate() {
        active = false
        container?.querySelectorAll("input").forEach((n) => n.removeAttribute('disabled'))
    }

    export function isActive() {
        return active
    }
</script>

<div 
    title={title}
    class="circuit-div {active ? '':'unavailable'}" 
    style="left:{start[0]}px; top:{start[1]}px; width:{end[0] - start[0]}px; height:{end[1] - start[1]}px;" 
    bind:this={container}
>
    <slot/>
</div>

<style>
    .circuit-div {
        position:absolute;
        background-color: var(--main-bg-color);
        border-radius: 10%;
        border: 4px ridge black;
        text-align:center;
    }

    .unavailable {
        filter:blur(2px) brightness(50%);
    }
</style>