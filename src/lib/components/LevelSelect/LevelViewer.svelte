<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { Freeplay, Level } from "$lib/level_types/Level";
    import { onMount } from "svelte";

    /**
     * @type {Level}
     */
    export let level = Freeplay

    /**
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {HTMLDivElement}
     */
    let element

    let start = [0, 0]
    let end = [0, 0]

    function setOffset() {
        const parentRect = element?.parentElement?.getBoundingClientRect()
        if (parentRect === undefined) {
            return
        }
        start[0] = parentRect.x
        start[1] = parentRect.y

        const gridStart = [level.x, level.y]
        const localStart = circuitController.indexToOffset(level.x, level.y)

        const panelStart = circuitController.projectOffset(
            localStart[0],
            localStart[1]
        )

        start[0] += localStart[0]
        start[1] += localStart[1]

        const type = level.type
        const gridEnd = [level.x + type.gridWidth, level.y + type.gridHeight]
        const localEnd = circuitController.indexToOffset(gridEnd[0], gridEnd[1])

        console.log(gridStart, gridEnd)
        console.log(localStart, localEnd)

        end = circuitController.projectOffset(
            localEnd[0],
            localEnd[1]
        )
    }

    onMount(setOffset)
    
    window.addEventListener('resize',setOffset)
</script>

<div class="level" bind:this={element} style="left:{start[0]}px; top:{start[1]}px; width:{end[0] - start[0]}px; height:{end[1] - start[1]}px;">
    <p>epic</p>
</div>

<style>
    .level {
        position:absolute;
        background:blue;
        margin:0px;
    }
</style>