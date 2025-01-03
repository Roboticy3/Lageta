<!--load a level from all_levels using a name from the PerformanceResourceTiming, defaults to Freeplay-->

<script>
    import { page } from '$app/stores';
    import { Freeplay, getLevel } from "$lib/dat/Levels/Levels";
    import { browser } from '$app/environment';
    import LevelTemplate from '$lib/components/GameView/LevelTemplate.svelte';

    const pathParams = $page.params.catchAll.split('/')
    $: levelName = pathParams[0] || undefined
    $: level = browser && levelName ? getLevel(levelName) : undefined
    
</script>

<LevelTemplate allParams={{gameParams:level?.unpack()}} levelName={levelName}/>