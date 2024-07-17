<script>
    import { goto } from "$app/navigation";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { Freeplay } from "$lib/dat/Levels/Levels";
    import { createEventDispatcher, onMount, tick } from "svelte";
    import CircuitDiv from "../GameView/CircuitDiv.svelte";
    import { Level } from "$lib/level_types/Level";
    import HeavyButton from "../Misc/HeavyButton.svelte";

    /**
     * @type {import("$lib/dat/Levels/Levels").LevelParameters}
     */
     export let params

    let level = new Level(params)
    /**
     * @type {CircuitController}
     */
    export let circuitController

    export let isNew = true

    const dispatch = createEventDispatcher()

    /**
     * @type {CircuitDiv}
     */
    let container

    /**
     * @type {HeavyButton}
     */
    let button

    /**
     * @type {number | undefined}
     */
    let gateId = undefined

    onMount(async () => {
        console.log("Mounting level selector for ",level)
        await tick()

        console.log("My name is ", level.name(), " and I am located at ", level.desiredId)
        container.setOffset()
        gateId = level.desiredId
        circuitController.addGateAtCell(level.type, level.x, level.y, level.desiredId)
        if (gateId === undefined) {
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
        button.setUnavailable(!activate)
    }

    async function playLevel() {
        dispatch('selected', level)

        await tick()

        window.location.href = '/level/' + level.name()
    }
</script>

<CircuitDiv 
    circuitController={circuitController} 
    position={[level.x + 0.35, level.y + 0.1]} 
    bob={false}
    smooth={false}
    size={[level.type.model.gridWidth - 1.05, level.type.model.gridHeight - 0.3]}
    flash={isNew}
    bind:this={container}
>
<div style="display:flex; flex-direction:column; justify-content:center; height:100%;">
    <p style="overflow-wrap:break-word;">{level.name()}</p>
    <HeavyButton style="margin:10%; display:inline-flex; align-self:center;" on:click={playLevel} bind:this={button}>Play</HeavyButton>
</div>
    
</CircuitDiv>
