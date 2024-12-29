<script>
    import { getToolParams } from "$lib/dat/Tools/Tools";
    import { createEventDispatcher, onMount, tick } from "svelte";
    import TruthTableTutorial from "./TruthTableTutorial.svelte";
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";
    import StickerTutorial from "./StickerTutorial.svelte";
    import CircuitEditorComponent from "../CircuitEditor/CircuitEditorComponent.svelte";
    import { getGateType, getGateTypeParams, Input } from "$lib/dat/GateTypes/GateTypes";
    import CircuitDiv from "../CircuitDiv.svelte";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { ShelfTreeNode } from "$lib/dat/Shelf/ShelfTree";
    import { GateTypeController } from "$lib/circuit_types/GateType";
    import { gridSourceToGrid } from "$lib/level_types/GameViewParameters";

    let dispatch = createEventDispatcher()

    /**
     * @type {string[] | undefined}
     */
    export let newGates

    /**
     * @type {string[] | undefined}
     */
    export let newLevels

    /**
     * @type {string[] | undefined}
     */
    export let newTools
    /**
     * @type {string[] | undefined}
     */
    let newToolsCopy = undefined
    $: if (newTools) newToolsCopy = Array.from(newTools)

    /**
     * @type {boolean | undefined}
     */
    export let hintToken = false

    /**
     * @type {boolean | undefined}
     */
    export let alreadyCompleted = false

    /**
     * @type {string | undefined}
     */
    let currentTool = undefined
    onMount(onNext)
    function onNext() {
        if (!newToolsCopy) return
        currentTool = newToolsCopy.pop()
        while (currentTool !== undefined && getToolParams(currentTool) === undefined) {
            currentTool = newToolsCopy.pop()
        }
        currentTool = currentTool
        console.log("set currentTool to ", currentTool)
    }

    //set up a circuit editor component
    export let rewardTestInputSize = 6
    $: gridWidth = Math.ceil(rewardTestInputSize / 9 * 16)
    $: gridHeight = rewardTestInputSize
    $: rendererParams = {}

    $: newGateTypeControllers = getNewGateTypeControllers(newGates || [])

    /**
     * @param {string[]} newGateTypeNames
     */
    function getNewGateTypeControllers(newGateTypeNames) {
        /**
         * @type {GateTypeController[]}
         */
        let out = []
        newGateTypeNames.forEach((s) => {
            const p = getGateTypeParams(s)
            if (p) out.push(getGateType(p))
        })

        return out
    }

    /**
     * @type {import("$lib/level_types/GameViewParameters").GameViewParameters | null}
     */
    let gameParams = null
    $: if (newGates && newGates.length > 0) gameParams = {
        name:"LevelSelect", directions:"", 
        grid: {
            size:[gridWidth, gridHeight],
            gateTypes:[getGateType(Input(rewardTestInputSize))],
            gates:[
                {type:`Input${rewardTestInputSize}`,x:0,y:0,id:0}
            ]
        }, 
        completeCondition:undefined, 
        completeRewards:[], 
        allUnlocks:false
    }
    $: console.log("updated completion display gameParams to ", gameParams)

    /**
     * @type {CircuitController | null}
     */
    let circuitController = null
    $: if (gameParams) circuitController = new CircuitController(gridSourceToGrid(gameParams.grid), () => {}, undefined)

    $: editorParams = {showShelf:newGates ? newGates.length > 0:false}
    $: shelf = new ShelfTreeNode("Rewards", newGates || [], 0)

</script>

{#if !currentTool}
<div style="display:flex; height:100%; justify-content:space-evenly;" >
    <div class="end-container">
        <div class="title-container">
            <div class="title">
                You Win!
            </div>
        </div>
        {#if !alreadyCompleted} <div class="rewards-container">
            {#if newGates && newGates.length > 0} <div>
                <h2>New Gates:</h2>
                {#each newGates as gate}
                    <div>{gate}</div>
                {/each}
            </div> {/if}
            {#if newLevels && newLevels.length > 0}<div>
                <h2>New Levels:</h2>
                {#each newLevels as level}
                    <div>{level}</div>
                {/each}
            </div> {/if}

            {#if hintToken} <div>
                <h2>1 Hint Token!</h2>
                <p>Spend hint tokens by clicking the button beneath the instructions on some levels.</p>
            </div> {/if}
        </div> {:else} <div>
            You already beat this level.
        </div> {/if}
    </div>
    {#if gameParams && !alreadyCompleted}
        <div style="display:flex; flex-direction:column; width:100%;">
            <div>Try out new gates here!</div>
            <div style="width:100%; height:100%; padding:3%; box-sizing:border-box;">
                <CircuitEditorComponent
                    editorParams={editorParams}
                    rendererParams={rendererParams}
                    circuitController={circuitController}
                    shelf={shelf}
                />
            </div>
        </div>
    {/if}
    
    <div style="display:flex; flex-direction:column; justify-content:space-evenly;">
        <div class="center">
            <HeavyButton 
                on:click={() => {window.location.pathname = "/campaign"}}
            >
                See Level Select Screen
            </HeavyButton>
        </div>
        <div class="center">
            <HeavyButton on:click={dispatch.bind(dispatch, "close")}>Stick Around</HeavyButton>
        </div>
    </div>
</div>
{:else}
<div class="tool-container">
    {#if currentTool === "TruthTable"}
        <TruthTableTutorial />
    {:else if currentTool === "Stickers"}
        <StickerTutorial />
    {/if}
    <HeavyButton on:click={onNext}>Next</HeavyButton>
</div>
{/if}


<style>

    .end-container {

        display:flex;
        flex-direction: column;
        justify-content:space-between;
        padding-bottom: 10vh;
    }

    .title-container {
        align-items: center;

        display:flex;
        flex-direction: column;
    }

    .title {
        margin: 1em;
        font-size: min(5vw, 5vh);
        color:var(--text-color);
        text-shadow: 0.06em 0.06em var(--connection-color-on), -0.06em -0.06em var(--connection-color-off);
    }

    .rewards-container {
        display:flex;
        justify-content:space-evenly;
        flex-direction:column;

        text-align: center;
    }

    .center {
        display: inline-flex;
        align-self: center;
    }

    .tool-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;

        height:100%;
    }
</style>