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
     * @type {boolean | undefined}
     */
    let active = undefined

    /**
     * @type {HeavyButton}
     */
    let button

    /**
     * @type {[number, number] | undefined}
     */
    export let gPos = undefined
    
    /**
     * @type {GateTypeController | undefined}
     */
    let gType = undefined

    export let gridMargin = 0.15
    export let gridMin = 1
    //compute the size to give a margin between adjacent levels, but also clamp it to a minimum of 1x1 so levels still look good
    /**
     * @type {[number, number]}
     */
    $: size = gType ? [Math.max(gType.view.gridWidth - 3 * gridMargin, gridMin), Math.max(gType.view.gridHeight - 3 * gridMargin, gridMin)] : [gridMin, gridMin]
    $: isGridMin = [size[0] == gridMin, size[1] == gridMin]
    $: positionMargin = [isGridMin[0] ? 0:gridMargin, isGridMin[1] ? 0:gridMargin]
    $: console.log("positionMargin: ", positionMargin)

    $: if (level.desiredId) gPos = circuitController.getGatePosition(level.desiredId)
    $: if (level.desiredId) gType = circuitController.getGateTypeController(level.desiredId)
    $: if (level.desiredId !== undefined) circuitController.addGraphListener("update", onGraphUpdate)
    

    onMount(async () => {
        console.log("Mounting level selector for ",level)
        await tick()

        container.setOffsetNoArgs()

        level.playCondition.forEach((v, i) => {
            if (level.desiredId !== undefined) circuitController.setDesiredValue({id:level.desiredId, type:"Output", index:i}, v)
        })

        updateAvailability()
    })

    /**
     * 
     * @param {{id:number}} param0
     */
    function onGraphUpdate({id}) {
        console.log("checking availability: recieved update from id ", id)
        if (id === level.desiredId) {
            updateAvailability()
        }
    }

    function updateAvailability() {
        //if there is no gate under this level, it shouldn't deactivate because of anything to do with the circuit
        const id = level.desiredId
        const value = id ? circuitController.getGateOutputs(id)?.override : undefined
        if ((id === undefined) || (value === undefined)) {
            container.activate()
            button.setUnavailable(false)
            active = false
            return
        }

        let shouldActivate = true
        for (let i = 0; i < value.length; i++) {
            if( (value[i]) !== (level.playCondition[i])) {
                shouldActivate = false
                break
            }
        }

        if (shouldActivate) container.activate()
        else container.deactivate()
        button.setUnavailable(!shouldActivate)
        active = shouldActivate
    }

    async function playLevel() {
        dispatch('selected', level)

        await tick()

        window.location.href = '/level/' + level.name()
    }

    $: flash = (levelProgress.new && active) || false
    $: console.log("should flash ", levelProgress, active)
    export let flashTime = 5000
    /**
     * @type {string | number | NodeJS.Timeout | undefined}
     */
    let flashInterval = undefined

    $: if (flash) {
        if (flashInterval) clearTimeout(flashInterval)
        flashInterval = setInterval(() => {
            flash = true;
            // Reset the animation after it's finished
            setTimeout(() => {
            flash = false;
            }, flashTime - 500); // Match the animation duration
        }, flashTime); // Match the interval
    }
</script>

<CircuitDiv 
    circuitController={circuitController} 
    position={gPos ? [gPos[0] + positionMargin[0], gPos[1] + positionMargin[1]] : [0, 0]} 
    bob={false}
    smooth={false}
    size={size}
    flash={flash}
    border={true}
    extraStyle={"pointer-events:none;"}
    bind:this={container}
>
<div style="display:flex; flex-direction:column; justify-content:center; height:100%;">
    <p style="overflow-wrap:break-word;">{level.name()}</p>
    {#if levelProgress.complete}
        <div>⭐</div>
    {/if}
    <HeavyButton style="margin:10%; display:inline-flex; align-self:center; pointer-events:all;" on:click={playLevel} bind:this={button}>Play</HeavyButton>
</div>
    
</CircuitDiv>
