<script>
  import { browser } from "$app/environment";
  import GameView from "$lib/components/GameView/GameView.svelte";
  import { randomLevel } from "$lib/level_types/Level";

  const level = randomLevel({}, {name:"Random", inputs:4, outputs:4}, 0.5)
</script>
{#if browser}
<GameView gameParams={level.unpack()} />
{/if}