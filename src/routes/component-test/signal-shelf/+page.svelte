<script>
    import { browser } from "$app/environment";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { GateGrid } from "$lib/circuit_types/GateGrid";


    import SignalShelf from "$lib/components/GameView/Signal/SignalShelf.svelte";
    import SignalViewer from "$lib/components/GameView/Signal/SignalViewer.svelte";
    import { FourBitAdder, getLevel } from "$lib/dat/Levels/Levels";
    import { gridSourceToGrid } from "$lib/level_types/GameViewParameters";
    import { CircuitSignalSetView } from "$lib/signal_types/SignalSetView";
    import { CircuitSignalSetViewEventTarget } from "$lib/signal_types/SignalSetViewEvent";
    import { CircuitStorage } from "$lib/storage_types/CircuitStorage";

    $: level = browser ? getLevel(FourBitAdder.params.name) : undefined
    $: gameParams = level?.unpack()

    function loadGrid() {
        if (!gameParams) return undefined

        const circuitStorage = new CircuitStorage(gameParams.name || "?")
        const gridResult = circuitStorage.loadNew()

        if (gridResult instanceof GateGrid) {
            return gridResult
        }
        return gridSourceToGrid(gameParams.grid)
    }

    $: circuitController = gameParams ? new CircuitController(loadGrid(), undefined, gameParams.completeCondition?.solver):undefined

    $: signalSetView = gameParams && gameParams.completeCondition ? 
        new CircuitSignalSetView(gameParams.completeCondition) : undefined
    
     /**
     * @type {CircuitSignalSetViewEventTarget | null}
     */
     export let signalSetViewEventTarget = null
    $: {console.log("signal set view event target: ", signalSetViewEventTarget)}

    $: console.log("bruh ", circuitController, gameParams, signalSetView)

</script>

{#if gameParams && circuitController && signalSetView}
<div class="signal" style="height:100%;">
  <SignalShelf 
      circuitController={circuitController} 
      signalSetView={signalSetView} 
      editorParams={{}}
      bind:signalSetViewEventTarget={signalSetViewEventTarget}
  >
      <g fill="none">
          <SignalViewer 
              signalSetView={signalSetView}
              channels={new Array(signalSetView.getInputSize()).fill("").map((_v, i) => {return {idx:i, type:"Given"}})}
          />
      </g>
      <g fill="none" transform="translate(0, {signalSetView.getDesiredChannelHeight(signalSetView.getInputSize())})">
          <SignalViewer 
              signalSetView={signalSetView}
              channels={new Array(signalSetView.channelCount() - signalSetView.getInputSize()).fill("").map((_v, i) => {return {idx:signalSetView.getInputSize() + i, type:"Expected"}})}
          />
      </g>
      <g fill="none" transform="translate(0, {signalSetView.getDesiredChannelHeight(signalSetView.getInputSize())})">
          <SignalViewer 
              bind:eventTarget={signalSetViewEventTarget}
              signalSetView={signalSetView}
              circuitController={circuitController}
              liveOnly={true}
              channels={new Array(signalSetView.channelCount() - signalSetView.getInputSize()).fill("").map((_v, i) => {return {idx:i, type:"Live"}})}
          />
      </g>
  </SignalShelf>
</div>
{:else}
Couldn't find test level {FourBitAdder.params.name}.. oh well
{/if}
