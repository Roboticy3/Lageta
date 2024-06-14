<script>
    import { goto } from "$app/navigation";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { Freeplay } from "$lib/dat/Levels/Levels";
    import { onMount, tick } from "svelte";
    import CircuitDiv from "../GameView/CircuitDiv.svelte";
    import { Level } from "$lib/level_types/Level";

    export let params

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
     * @type {HTMLButtonElement}
     */
    let button

    /**
     * @type {number | undefined}
     */
    let gateId = undefined

    onMount(async () => {
        console.log("Mounting level selector for ",level)
        await tick()
        container.setOffset()
        gateId = circuitController.getGateIdLength()
        circuitController.addGateAtCell(level.type, level.x, level.y)
        if (gateId === undefined || circuitController.getNumGates() !== gateId + 1) {
            console.log("Unable to set gateId of ", level, "!")
            return
        }
        circuitController.addGraphListener("update", ({id}) => {
            if (id === gateId) {
                updateAvailability()
            }
        })
        const id = gateId
        level.playCondition.forEach((v, i) => {
            circuitController.setDesiredValue({id:id, type:"Output", index:i}, v)
        })
        updateAvailability()
    })

    function updateAvailability() {
        if (gateId === undefined) return
        const value = circuitController.getGateOutputs(gateId)?.override
        if (value === undefined) return

        let activate = true
        for (let i = 0; i < value.length; i++) {
            if( (value[i]) !== (level.playCondition[i])) {
                activate = false
                break
            }
        }
        if (activate) container.activate()
        else container.deactivate()
        button.disabled = !activate
    }

    function playLevel() {
        window.location.href = '/level/' + level.name()
    }
</script>

<CircuitDiv 
    circuitController={circuitController} 
    position={[level.x + 0.35, level.y + 0.25]} 
    size={[level.type.model.gridWidth - 1.05, level.type.model.gridHeight - 0.75]}
    bind:this={container}
>
    <p style="overflow-wrap:break-word;">{level.name()}</p>
    <button on:click={playLevel} bind:this={button}>Play</button>
</CircuitDiv>
