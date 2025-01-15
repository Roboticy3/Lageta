<script>
  import { browser } from "$app/environment";
  import GameView from "$lib/components/GameView/GameView.svelte";
  import LevelTemplate from "$lib/components/GameView/LevelTemplate.svelte";
  import { randomLevel } from "$lib/dat/Levels/Levels";

  const level = randomLevel({}, {name:"Random", inputs:Math.ceil(Math.random() * 8), outputs:Math.ceil(Math.random() * 8)}, 0.5)
</script>
<LevelTemplate allParams={{gameParams:level.params}} levelName={"Random"}/>