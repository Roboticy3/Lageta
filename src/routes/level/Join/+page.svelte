<script>
  import { browser } from "$app/environment";
  import GameView from "$lib/components/GameView/GameView.svelte";
  import LevelTemplate from "$lib/components/GameView/LevelTemplate.svelte";
  import { Or } from "$lib/dat/GateTypes/GateTypes";
  import { getLevelFromParams, OrLevel } from "$lib/dat/Levels/Levels";
  import { ShelfTreeNode } from "$lib/dat/Shelf/ShelfTree";

  $: level = browser ? getLevelFromParams(OrLevel):undefined

</script> 
<LevelTemplate allParams={{gameParams:level?.unpack(), shelf:new ShelfTreeNode("Custom Shelf", [Or.name])}} levelName={OrLevel.params?.name}/>