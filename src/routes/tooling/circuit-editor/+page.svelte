<script>
  import { browser } from "$app/environment";
  import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { GateGrid } from "$lib/circuit_types/GateGrid";
  import GameView from "$lib/components/GameView/GameView.svelte";
  import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";
  import { Freeplay } from "$lib/dat/Levels/Levels";
    import { GameViewParameters } from "$lib/level_types/GameViewParameters";
  import { CircuitStorage } from "$lib/storage_types/CircuitStorage";
    import { tick } from "svelte";

  const circuitName = "Stage 1"

  const circuitStorageKey = "Stage 1"

  /**
     * @type {CircuitController}
     */
  let circuitController

  function onSave() {
    const circuitStorage = new CircuitStorage(circuitName, circuitController, circuitStorageKey)

    const result = circuitStorage.save()

    console.log("Grid saved with code ", result)
  }

  function onLoad() {
    const circuitStorage = new CircuitStorage(circuitName, circuitController, circuitStorageKey)

    const result = circuitStorage.load()

    console.log("Grid loaded with code ", result)
  }

</script>

{#if browser}<GameView gameParams={new GameViewParameters(
  circuitName,
  "",
  {
    size:[20,10]
  },undefined,[],true,{},{}, circuitStorageKey)} 
  bind:circuitController={circuitController}
> 
  <div style="display:flex; ">
    <HeavyButton on:click={onSave}>Save</HeavyButton>
    <HeavyButton on:click={onLoad}>Load</HeavyButton>
  </div>
</GameView> {/if}