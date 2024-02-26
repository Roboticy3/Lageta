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

    let position = [level.x, level.y]

    export let margin = 0.5

    let start = [0, 0]
    let end = [0, 0]

    function setOffset() {
        const parentRect = element?.parentElement?.getBoundingClientRect()
        if (parentRect === undefined) {
            return
        }
        start[0] = parentRect.x
        start[1] = parentRect.y

        const cell = circuitController.getGridCellOffset()
        const localStart = circuitController.indexToOffset(position[0], position[1])

        start = circuitController.projectOffset(
            localStart[0] + margin * cell,
            localStart[1] + margin * cell
        )

        const type = level.type
        const gridEnd = [position[0] + type.gridWidth, position[1] + type.gridHeight]
        const localEnd = circuitController.indexToOffset(gridEnd[0], gridEnd[1])

        end = circuitController.projectOffset(
            localEnd[0] - margin * cell,
            localEnd[1] - margin * cell
        )
    }

    /**
     * @type {number | undefined}
     */
    let gateId = undefined
    let gateValue = undefined

    onMount(async () => {
        await tick()
        setOffset()
        gateId = circuitController.getNumGates()
        circuitController.addGateAtCell(level.type, level.x, level.y)
        if (circuitController.getNumGates() !== gateId + 1) {
            gateId = undefined
            console.log("Unable to set gateId of ", level, "!")
            return
        }
        circuitController.addConnectionListener((id) => {
            if (id === gateId) {
                updateAvailability()
            }
        })
    })

    let active = false

    function updateAvailability() {
        if (gateId === undefined) return
        const value = circuitController.getGateOutputs(gateId)
        if (value === undefined) return

        active = true
        for (let i = 0; active && i < value.length; i++) {
            active = (value[i] || false) === (level.playCondition[i] || false)
        }
    }
    
    window.addEventListener('resize',setOffset)

    function playLevel() {
        goto(`/level/${level.name()}`)
    }
</script>

<div class="level {active ? '':'unavailable'}" bind:this={element} style="left:{start[0]}px; top:{start[1]}px; width:{end[0] - start[0]}px; height:{end[1] - start[1]}px;">
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
        font-size: max(1vh, 1vw);
    }

    .unavailable {
        filter:blur(2px) brightness(50%);
        pointer-events: none;
    }
</style>