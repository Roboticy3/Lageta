<script>
    import { goto } from "$app/navigation";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { Freeplay } from "$lib/dat/Levels/Levels";
    import { createEventDispatcher, onMount, tick } from "svelte";
    import CircuitDiv from "../GameView/CircuitDiv.svelte";
    import { Level } from "$lib/level_types/Level";
    import HeavyButton from "../Misc/HeavyButton.svelte";
    import { GateTypeController } from "$lib/circuit_types/GateType";

    /**
     * @type {import("$lib/dat/Levels/Levels").LevelParameters}
     */
    export let params
    $: level = new Level(params)

    /**
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {any}
     */
    export let levelProgress

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
     * @type {[number, number] | undefined}
     */
    let gPos = [0, 0]
    /**
     * @type {GateTypeController | undefined}
     */
    let gType = undefined
    $: if (level.desiredId) gPos = circuitController.getGatePosition(level.desiredId)
    $: if (level.desiredId) gType = circuitController.getGateTypeController(level.desiredId)

    onMount(async () => {
        console.log("Mounting level selector for ",level)
        await tick()

        container.setOffsetNoArgs()

        const id = level.desiredId
        
        if (id === undefined) {
            console.log("Unable to set gateId of ", level, "!")
            return
        }

        circuitController.addGraphListener("update", ({id}) => {
            if (id === id) {
                updateAvailability()
            }
        })

        level.playCondition.forEach((v, i) => {
            circuitController.setDesiredValue({id:id, type:"Output", index:i}, v)
        })
        updateAvailability()
    })

    function updateAvailability() {
        const id = level.desiredId
        if (id === undefined) return
        const value = circuitController.getGateOutputs(id)?.override
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
    position={gPos ? [gPos[0] + 0.2, gPos[1] + 0.1] : [0, 0]} 
    bob={false}
    smooth={false}
    size={gType ? [gType.view.gridWidth - 0.4, gType.view.gridHeight - 0.2] : [1, 1]}
    flash={levelProgress.new || false}
    border={true}
    bind:this={container}
>
<div style="display:flex; flex-direction:column; justify-content:center; height:100%;">
    <p style="overflow-wrap:break-word;">{level.name()}</p>
    {#if levelProgress.complete}
        <div>⭐</div>
    {/if}
    <HeavyButton style="margin:10%; display:inline-flex; align-self:center;" on:click={playLevel} bind:this={button}>Play</HeavyButton>
</div>
    
</CircuitDiv>
