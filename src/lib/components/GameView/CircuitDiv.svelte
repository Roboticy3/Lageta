
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { onMount, tick } from "svelte";

    export let active = false

    export let position = [0, 0]

    export let size = [1, 1]

    export let margin = 0.5

    /**
     * @type {CircuitController}
     */
    export let circuitController

    let start = [0, 0]
    let end = [0, 0]

    export function setOffset() {
        console.log("circuitdiv: movin")

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

    onMount(() => {
        console.log("circuitdiv: mount")
        window.addEventListener('load',setOffset)
        window.addEventListener('resize',setOffset)
    })

    export function activate() {
        active = true
    }
    export function deactivate() {
        active = false
    }

    export function isActive() {
        return active
    }
</script>

<div 
    class="circuit-div {active ? '':'unavailable'}" 
    style="left:{start[0]}px; top:{start[1]}px; width:{end[0] - start[0]}px; height:{end[1] - start[1]}px;" 
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
        color:black;
    }

    .unavailable {
        filter:blur(2px) brightness(50%);
        pointer-events: none;
    }
</style>