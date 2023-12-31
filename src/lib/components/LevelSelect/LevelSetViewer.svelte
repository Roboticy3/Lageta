<script>
    import { GameViewParameters } from "$lib/level_types/GameViewParameters";
    //@ts-ignore
    import { Freeplay, Level, all_levels } from "$lib/level_types/Level";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import { onMount } from "svelte";

    let progress = new ProgressStorage()
    let levelSet = progress.levels()
    console.log(levelSet, all_levels)
    
    /**
     * @type {Level | null}
    */
    let selectedLevel = null

    /**
     * @type {HTMLElement}
     */
    let panel
    onMount(() => {
        panel.hidden = true
    })

</script>

<div class="level-set">
    {#each levelSet as level}
        <button 
            style="grid-column:{level.x}; grid-row:{level.y};"
            on:click={(e) => {
                selectedLevel = level
                panel.hidden = false
            }}>

            {level.name}

        </button>
    {/each}
    <div class="side-panel" bind:this={panel}>
        {selectedLevel?.name || ""}
        <a href="/level/{selectedLevel?.name || ""}">Play</a>
    </div>
</div>

<style>
    .level-set {
        display: grid;
        grid-template-columns: repeat(9, 10%);
        grid-template-rows: repeat(7, 10%);
    }
    .side-panel {
        grid-column: 8 / 9;
        grid-row: 1 / 7;
    }
</style>