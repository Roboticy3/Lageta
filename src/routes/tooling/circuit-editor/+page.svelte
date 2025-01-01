<script>
  import { browser } from "$app/environment";
  import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { GateGrid } from "$lib/circuit_types/GateGrid";
  import GameView from "$lib/components/GameView/GameView.svelte";
  import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";
    import { AdderNoCarry1, Buf, getGateType, getGateTypeParams, Input, registerGateType } from "$lib/dat/GateTypes/GateTypes";
  import { Freeplay } from "$lib/dat/Levels/Levels";
  import { CircuitStorage } from "$lib/storage_types/CircuitStorage";
    import { onMount, tick } from "svelte";

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

{#if browser}<GameView gameParams={{
  name:circuitName,
  directions:"",
  grid:{
    gateTypes:[getGateType(Input(1)), getGateType(AdderNoCarry1)],
    size:[20,10]
  },
  completeRewards:[],
  allUnlocks:true,
  storageKey:circuitStorageKey}} 
  bind:circuitController={circuitController}
  rendererParams={{showIds:true}}
> 
  <div style="display:flex; ">
    <HeavyButton on:click={onSave}>Save</HeavyButton>
    <HeavyButton on:click={onLoad}>Load</HeavyButton>
  </div>
</GameView> {/if}