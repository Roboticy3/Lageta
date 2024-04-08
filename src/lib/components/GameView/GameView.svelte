<!-- simulator containing all the basic elements needed to build, save, and load logical circuits -->

<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { ConnectionValueSignalSet, SignalSet } from "$lib/signal_types/Signal";
    import { CircuitSignalSetView, SignalSetView } from "$lib/signal_types/SignalSetView";
    import CircuitDiv from "./CircuitDiv.svelte";
    import CircuitDraggable from "./CircuitDraggable.svelte";
    import GameViewCircuitPanel from "./GameViewCircuitPanel.svelte";
    import SignalViewer from "./SignalViewer.svelte";


    /**
     * @type {import("$lib/level_types/GameViewParameters").GameViewParameters}
     */
    export let params

    console.log("initializing GameView with params: ",params)

    const circuitController = new CircuitController(params.grid)

    const signalSetView = 
        params.completeCondition instanceof ConnectionValueSignalSet ? 
        new CircuitSignalSetView(params.completeCondition) : undefined

    let circuitDraggable

</script>

<div class="base-vertical">
    <CircuitDraggable 
        circuitController={circuitController} 
        bind:this={circuitDraggable}
    />
    <div class="nav">

    </div>
    <div class="sandbox-horizontal">
        <div class="circuit-editor">
            <div class="shelf">
                
            </div>
            <div class="circuit-panel">
                <GameViewCircuitPanel 
                    params={params}
                    gridController={circuitController}
                    circuitDraggable={circuitDraggable}
                >

                </GameViewCircuitPanel>
            </div>
        </div>
        <div class="instructions">

        </div>
    </div>
    {#if signalSetView}
        <div class="signal">
            <SignalViewer circuitController={circuitController} signalSetView={signalSetView} />
        </div>
    {/if}
</div>

<style>
    
    .base-vertical {
        display:flex;
        flex-direction: column;
        height:100%;
    }

    .base-vertical .nav {
        flex: 1;
        background-color: var(--secondary-bg-color);
    }

    .base-vertical .sandbox-horizontal {
        flex: 7;
        
        display:flex;
        flex-direction: row;
        height:70%;
    }

    .sandbox-horizontal .circuit-editor {
        flex: 9;

        background-color: var(--tertiary-bg-color);

        display: flex;
        flex-direction: column;
    }

    .circuit-editor .shelf {
        flex: 1;
        background-color: var(--main-bg-color);
    }

    .circuit-editor .circuit-panel {
        flex: 7;
        min-height: 0;
    }

    .sandbox-horizontal .instructions {
        flex: 3;
        background-color: var(--tertiary-bg-color);
    }

    .base-vertical .signal {
        flex: 2;
        background-color: var(--secondary-bg-color);
        padding:5vh;
        width: 100%;
        height: 20%;
    }
</style>