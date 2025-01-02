<script>
    import { browser } from "$app/environment";
    import GameView from "$lib/components/GameView/GameView.svelte";
    import { And } from "$lib/dat/GateTypes/GateTypes";


    import { getLevelFromParams, AndLevel } from "$lib/dat/Levels/Levels";
    import { ShelfTreeNode } from "$lib/dat/Shelf/ShelfTree";

  $: level = browser ? getLevelFromParams(AndLevel):undefined

</script>
{#if level}
<GameView gameParams={level.unpack()} shelf={new ShelfTreeNode("Custom Shelf", [And.name])}/>
{:else if !browser}
<h1 class="fullscreen-message">
  Loading
</h1>
{/if}