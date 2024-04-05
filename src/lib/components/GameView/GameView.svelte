<!-- simulator containing all the basic elements needed to build, save, and load logical circuits -->

<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { SignalSet } from "$lib/signal_types/Signal";
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
        params.completeCondition instanceof SignalSet ? 
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
            <div class="circuit-editor">
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
            <SignalViewer 
                circuitController={circuitController}
                signalSetView={signalSetView}
            />
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
        flex-grow: 1;
        background-color: var(--secondary-bg-color);
    }

    .base-vertical .sandbox-horizontal {
        flex-grow: 6.5;

        display:flex;
        flex-direction: row;
    }

    .circuit-editor .shelf {
        flex-grow: 2;
        background-color: var(--main-bg-color);
        min-height: 50px;
    }

    .sandbox-horizontal .circuit-editor {
        flex-grow: 8;
        background-color: var(--tertiary-bg-color);

        display: flex;
        flex-direction: column;
    }

    .sandbox-horizontal .instructions {
        flex-grow: 3;
        background-color: var(--tertiary-bg-color);
    }

    .base-vertical .signal {
        flex-grow: 2.5;
        background-color: var(--secondary-bg-color);
    }
</style>