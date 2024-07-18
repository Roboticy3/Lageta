<script>
    import { getToolParams } from "$lib/dat/Tools/Tools";
    import { onMount } from "svelte";
    import TruthTableTutorial from "./TruthTableTutorial.svelte";
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";

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
    function onNext() {
        currentTool = newToolsCopy.pop()
        while (currentTool !== undefined && getToolParams(currentTool) === undefined) {
            currentTool = newToolsCopy.pop()
        }
        currentTool = currentTool
        console.log("set currentTool to ", currentTool)
    }

    onMount(() => {
        onNext()
    })

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
        <div class="to-level-select">
            <HeavyButton 
                on:click={() => {
                    window.location.pathname = "/campaign"
                }}
            >
                See Level Select Screen
            </HeavyButton>
        </div>
    </div>
{:else}
<div class="tool-container">
    {#if currentTool === "TruthTable"}
        <TruthTableTutorial />
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

    .to-level-select {
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