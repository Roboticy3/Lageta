<script>
  import { browser } from "$app/environment";
  import GameView from "$lib/components/GameView/GameView.svelte";
    import LevelTemplate from "$lib/components/GameView/LevelTemplate.svelte";
  import { randomLevel } from "$lib/level_types/Level";

  const level = randomLevel({}, {name:"Random", inputs:4, outputs:4}, 0.5)
</script>
<LevelTemplate allParams={{gameParams:level.params}} levelName={"Random"}/>