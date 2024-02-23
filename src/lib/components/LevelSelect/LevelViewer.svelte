<script>
    import { goto } from "$app/navigation";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { Freeplay, Level } from "$lib/level_types/Level";
    import { onMount, tick } from "svelte";

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

        end = circuitController.projectOffset(
            localEnd[0] - 8,
            localEnd[1] - 8
        )
    }

    onMount(async () => {
        await tick()
        setOffset()
    })
    
    window.addEventListener('resize',setOffset)

    function playLevel() {
        goto(`/level/${level.name()}`)
    }
</script>

<div class="level" bind:this={element} style="left:{start[0]}px; top:{start[1]}px; width:{end[0] - start[0]}px; height:{end[1] - start[1]}px;">
    <p>{level.name()}</p>
    <button on:click={playLevel}>Play</button>
</div>

<style>
    .level {
        position:absolute;
        background:whitesmoke;
        border-radius: 10%;
        border: 4px ridge black;
        text-align:center;
        font-size: max(1.5vh, 1.5vw);
    }
</style>