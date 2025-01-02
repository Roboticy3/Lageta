<!--load a level from all_levels using a name from the PerformanceResourceTiming, defaults to Freeplay-->

<script>
    import { page } from '$app/stores';
    import GameView from '$lib/components/GameView/GameView.svelte'
    import { Level, all_levels } from '$lib/level_types/Level';
    import { Freeplay, getLevel } from "$lib/dat/Levels/Levels";
    import { ProgressStorage } from '$lib/storage_types/ProgressStore';
    import { browser } from '$app/environment';

    const pathParams = $page.params.catchAll.split('/')
    $: levelName = pathParams[0] || undefined
    $: level = browser && levelName ? getLevel(levelName) : undefined
    
</script>

{#if level !== undefined}
<GameView gameParams={level.unpack()}/>
{:else if !browser}
<h1 class="fullscreen-message">
    Loading
</h1>
{:else}
<h1 class="fullscreen-message">
    Failed to load {levelName || "level"}! Please return to homescreen.
</h1>
{/if}