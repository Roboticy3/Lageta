<!-- simulator containing all the basic elements needed to build, save, and load logical circuits -->

<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { ConnectionValueSignalSet, SignalSet } from "$lib/signal_types/Signal";
    import { CircuitSignalSetView, SignalSetView } from "$lib/signal_types/SignalSetView";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import CircuitDiv from "./CircuitDiv.svelte";
    import CircuitDraggable from "$lib/components/GameView/CircuitEditor/CircuitDraggable.svelte";
    import GameViewCircuitPanel from "$lib/components/GameView/CircuitEditor//GameViewCircuitPanel.svelte";
    import GameViewShelfButton from "./CircuitEditor/GameViewShelfButton.svelte";
    import SignalViewer from "./SignalViewer.svelte";
    import CompletionPopup from "./CompletionPopup.svelte";
    import CircuitEditorComponent from "./CircuitEditor/CircuitEditorComponent.svelte";


    /**
     * @type {import("$lib/level_types/GameViewParameters").GameViewParameters}
     */
    export let gameParams
    export let editorParams = {}
    export let rendererParams = {}

    console.log("initializing GameView with params: ",gameParams)
    
    const signalSetView = gameParams.completeCondition ? 
        new CircuitSignalSetView(gameParams.completeCondition) : undefined

    let circuitDraggable

    let progressStorage = new ProgressStorage()

    
    /**
     * @type {CompletionPopup}
     */
    let completionPopup

    function onComplete() {
        const rewards = gameParams.completeRewards
        progressStorage.addGate(gameParams.name)
        rewards.map(progressStorage.addLevel.bind(progressStorage))
        rewards.map(progressStorage.addGate.bind(progressStorage))
        
        completionPopup.show()
    }

    const circuitController = new CircuitController(gameParams.grid, onComplete)

</script>

<div class="base-vertical" data-sveltekit-noscroll>
    <div class="nav" title="Nav">

    </div>
    <div class="sandbox-horizontal" title="Sandbox">
        <div class="circuit-editor" title="Editor">
            <CircuitEditorComponent 
                circuitController={circuitController} 
                gameParams={gameParams} 
                editorParams={editorParams}
                rendererParams={rendererParams}
                shelf={progressStorage.gates()}
            />
        </div>
        <div class="instructions" title="Instructions">
            {@html gameParams.directions}
        </div>
    </div>
    {#if signalSetView}
        <div class="signal" title="Signal Player">
            <SignalViewer circuitController={circuitController} signalSetView={signalSetView} />
        </div>
    {/if}
</div>

<CompletionPopup bind:this={completionPopup} unlocks={gameParams.completeRewards} />

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

        display: flex;
        flex-direction: column;
    }

    .sandbox-horizontal .instructions {
        flex: 3;
        background-color: var(--tertiary-bg-color);

        padding: 3%;
        overflow-y: scroll;
    }

    .base-vertical .signal {
        flex: 3;
        background-color: var(--secondary-bg-color);
        padding:2%;
        width: 96%;
        padding-bottom: 0%;
        max-height: 36%;
    }
</style>