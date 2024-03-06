<script>
    import { goto } from "$app/navigation";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { Freeplay } from "$lib/dat/Levels/Levels";
    import { onMount, tick } from "svelte";
    import CircuitDiv from "../GameView/CircuitDiv.svelte";
    import { Level } from "$lib/level_types/Level";

    export let params = Freeplay

    let level = new Level(params)
    /**
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {CircuitDiv}
     */
    let container

    /**
     * @type {number | undefined}
     */
    let gateId = undefined

    onMount(async () => {
        console.log("Mounting level selector for ",level)
        await tick()
        container.setOffset()
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
        updateAvailability()
        window.addEventListener('resize',container.setOffset)
    })

    function updateAvailability() {
        if (gateId === undefined) return
        const value = circuitController.getGateOutputs(gateId)
        if (value === undefined) return

        let activate = true
        for (let i = 0; i < value.length; i++) {
            if( (value[i] || false) !== (level.playCondition[i] || false)) {
                activate = false
                break
            }
        }
        if (activate) container.activate()
        else container.deactivate()
    }

    function playLevel() {
        goto(`/level/${level.name()}`)
    }
</script>

<CircuitDiv 
    circuitController={circuitController} 
    position={[level.x, level.y]} 
    size={[level.type.gridWidth, level.type.gridHeight]}
    bind:this={container}
>
    <p>{level.name()}</p>
    <button on:click={playLevel}>Play</button>
</CircuitDiv>
