<script>
  import { browser } from "$app/environment";
  import GameView from "$lib/components/GameView/GameView.svelte";
  import LevelTemplate from "$lib/components/GameView/LevelTemplate.svelte";
  import { And } from "$lib/dat/GateTypes/GateTypes";
  import { getLevelFromParams, AndLevel } from "$lib/dat/Levels/Levels";
  import { ShelfTreeNode } from "$lib/dat/Shelf/ShelfTree";

  $: level = browser ? getLevelFromParams(AndLevel):undefined

</script> 
<LevelTemplate allParams={{gameParams:level?.unpack(), shelf:new ShelfTreeNode("Custom Shelf", [And.name])}} levelName={AndLevel.params?.name}/>