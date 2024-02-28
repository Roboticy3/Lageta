
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
        const cell = circuitController.getGridCellOffset()
        const localStart = circuitController.indexToOffset(position[0], position[1])

        start = circuitController.projectOffset(
            localStart[0] + margin * cell,
            localStart[1] + margin * cell
        )

        const gridEnd = [position[0] + size[0], position[1] + size[1]]
        const localEnd = circuitController.indexToOffset(gridEnd[0], gridEnd[1])

        end = circuitController.projectOffset(
            localEnd[0] - margin * cell,
            localEnd[1] - margin * cell
        )
    }

    onMount(async () => {
        await tick()
        setOffset()
    })

    export function activate() {
        active = true
    }
    export function deactivate() {
        active = false
    }
</script>

<div 
    class="{active ? '':'unavailable'}" 
    style="left:{start[0]}px; top:{start[1]}px; width:{end[0] - start[0]}px; height:{end[1] - start[1]}px;" 
>
    <slot/>
</div>

<style>
    div {
        position:absolute;
        background:whitesmoke;
        border-radius: 10%;
        border: 4px ridge black;
        text-align:center;
        font-size: max(1vh, 1vw);
    }

    .unavailable {
        filter:blur(2px) brightness(50%);
        pointer-events: none;
    }
</style>