<!--load a level from all_levels using a name from the PerformanceResourceTiming, defaults to Freeplay-->

<script>
    import { page } from '$app/stores';
    import GameView from '$lib/components/GameView/GameView.svelte'
    import { Freeplay, all_levels } from '$lib/level_types/Level';
    import { ProgressStorage } from '$lib/storage_types/ProgressStore';

    const levelName = $page.params.levelName
    const level = all_levels.get(levelName)

    const progress = new ProgressStorage()
    console.log(progress.findLevel(levelName))
</script>

{#if level !== undefined}
<GameView params={(level || Freeplay).unpack()}/>
{:else}
Level not found!
{/if}
