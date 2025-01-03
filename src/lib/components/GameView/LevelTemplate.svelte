<script>
  import { browser } from "$app/environment";
  import { Level } from "$lib/level_types/Level";
  import GameView from "./GameView.svelte";

  /**
   * @type {string | undefined}
   */
  export let levelName

  export let allParams

</script>
{#if allParams.gameParams !== undefined}
<GameView {...allParams}/>
{:else if !browser}
<h1 class="fullscreen-message">
    Loading
</h1>
{:else}
<h1 class="fullscreen-message">
    Failed to load {levelName || "level"}! Please return to homescreen.
</h1>
{/if}