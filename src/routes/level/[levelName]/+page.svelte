<!--load the simulator with minimal changes for a sort of freeplay-->

<script>
    import { page } from '$app/stores';
    import GameView from '$lib/components/GameView/GameView.svelte'
    import { Freeplay, all_levels } from '$lib/level_types/Level';

    let levelName = $page.params.levelName
</script>

<GameView params={(all_levels.get(levelName) || Freeplay).unpack()}/>