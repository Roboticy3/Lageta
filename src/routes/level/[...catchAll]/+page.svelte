<!--load a level from all_levels using a name from the PerformanceResourceTiming, defaults to Freeplay-->

<script>
    import { page } from '$app/stores';
    import { Freeplay, getLevel, getLevelParams } from "$lib/dat/Levels/Levels";
    import { browser } from '$app/environment';
    import LevelTemplate from '$lib/components/GameView/LevelTemplate.svelte';
    import { randomLevel } from '$lib/level_types/Level';

    const pathParams = $page.params.catchAll.split('/')
    $: levelName = pathParams[0] || undefined


    /**
     * @type {import("$lib/dat/Levels/Levels").LevelParameters | undefined}
     */
    let level = undefined
    $: if (browser && levelName) {
        level = browser && levelName ? 
            (levelName.startsWith("Random") ? 
                randomLevel(getLevelParams(levelName) || {}, {name:levelName}, 0.5)
                :
                getLevelParams(levelName))
            : 
            undefined
    }
    
    
</script>

<LevelTemplate allParams={{gameParams:level?.params || "?"}} levelName={levelName}/>