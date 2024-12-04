<script>
    import { getToolParams } from "$lib/dat/Tools/Tools";
    import { createEventDispatcher, onMount } from "svelte";
    import TruthTableTutorial from "./TruthTableTutorial.svelte";
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";
    import StickerTutorial from "./StickerTutorial.svelte";

    const dispatch = createEventDispatcher()

    /**
     * @type {string[]}
     */
    export let newGates

    /**
     * @type {string[]}
     */
    export let newLevels

    /**
     * @type {string[]}
     */
    export let newTools
    $: newToolsCopy = Array.from(newTools)

    /**
     * @type {string | undefined}
     */
    let currentTool = undefined
    onMount(onNext)
    function onNext() {
        currentTool = newToolsCopy.pop()
        while (currentTool !== undefined && getToolParams(currentTool) === undefined) {
            currentTool = newToolsCopy.pop()
        }
        currentTool = currentTool
        console.log("set currentTool to ", currentTool)
    }

</script>

{#if !currentTool}
    <div class="end-container">
        <div class="title-container">
            <div class="title">
                You Win!
            </div>
            <h2>
                You unlocked:
            </h2>
        </div>
        <div class="rewards-container">
            <div>
                <h2>New Gates:</h2>
                {#each newGates as gate}
                    <div>{gate}</div>
                {/each}
            </div>
            <div>
                <h2>New Levels:</h2>
                {#each newLevels as level}
                    <div>{level}</div>
                {/each}
            </div>
        </div>
        <div style="display:flex; flex-direction:column;">
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
        justify-content:space-between;
        flex-direction:row;

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