<script>
    import { GameViewParameters } from "$lib/menu_types/GameViewParameters";
    import { ProgressStore } from "$lib/progress_types/ProgressStore";

    let progress = new ProgressStore()
    let levelSet = progress.levels()
    console.log(levelSet)
    
</script>

<div class="level-set">
    {#each levelSet as level}
        <button style="grid-column:{level.x}; grid-row:{level.y};">
            {level.name}
        </button>
    {/each}
</div>

<style>
    .level-set {
        display: grid;
        grid-template-columns: repeat(9, 10%);
        grid-template-rows: repeat(7, 10%);
    }
</style>