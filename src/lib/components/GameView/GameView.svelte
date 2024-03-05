<!-- simulator containing all the basic elements needed to build, save, and load logical circuits -->

<script>
    import { onMount } from 'svelte';

    import GameViewShelfButton from "./GameViewShelfButton.svelte";
    import GameViewCircuitPanel from './GameViewCircuitPanel.svelte';
    import TextFormPopup from './TextFormPopup.svelte';
    import CompletionPopup from './CompletionPopup.svelte';

    import { CircuitController, mainController } from '$lib/circuit_types/CircuitController';
    
    import { CircuitStore } from '$lib/storage_types/CircuitStorage';
    import { ProgressStorage } from '$lib/storage_types/ProgressStore';
    
    import { CompleteCondition, GameViewParameters } from '$lib/level_types/GameViewParameters';
    import { all_levels } from '$lib/level_types/Level';
    import InputCheckBox from './InputCheckBox.svelte';
    import { SignalSetController } from '$lib/signal_types/SignalSetController';
    import SignalViewer from './SignalViewer.svelte';
    import { SignalSet } from '$lib/signal_types/Signal';
    import CircuitDraggable from './CircuitDraggable.svelte';
    import { GateType } from '$lib/circuit_types/GateType';

    /**
     * @type {GameViewParameters}
     */
    export let params

    /**
     * @type {CircuitStore}
     */
    let circuitStore

    /**
     * @type {ProgressStorage}
    */
    let progressStore

    let circuitController = new CircuitController(params.grid)
    
    /**
     * @type {CircuitDraggable}
     */
    let circuitDraggable

    /**
     * @type {GameViewCircuitPanel}
    */
    let circuitPanel

    /**
     * @type {HTMLDivElement}
     */
    let shelf

    onMount(() => {

        if (mainController === undefined) {
            console.log("there should be a controller here!")
            return
        }

        mainController.onComplete = onComplete

        circuitStore = new CircuitStore(mainController, "")
        updateLocalStorageKeys()

        progressStore = new ProgressStorage()
        if (params.allUnlocks) {
            progressStore.cheat()
        }
        updateUnlockedGates()
    })

    /**
     * @type {CompletionPopup}
     */
    let completionPopup

    function onComplete() {
        const rewards = params.completeRewards
        progressStore.addGate(params.name)
        rewards.map(progressStore.addLevel.bind(progressStore))
        
        completionPopup.show()
    }

    /**
     * @type {TextFormPopup}
     */
    let dialog

    /**
     * @param {string | undefined} s
     */
    function onSubmitSave(s) {
        const result = circuitStore.save(s)
        updateLocalStorageKeys()
        return result
    }

    /**
     * @param {string | undefined} s
     */
    function onSubmitLoad(s) {
        const result = circuitStore.load(s)
        circuitPanel.updateSvg()
        return result
    }

    /**
     * @param {string | undefined} s
     */
    function onSubmitRemove(s) {
        const result = circuitStore.remove(s)
        updateLocalStorageKeys()
        return result
    }

    /**
     * @type {string[]}
     */
    var circuitStorageKeys = []
    function updateLocalStorageKeys() {
        circuitStorageKeys = circuitStore?.keys() || []
        return circuitStorageKeys
    }
    updateLocalStorageKeys()

    /**
     * @type {Array<GateType>}
    */
    var unlockedGates = []
    function updateUnlockedGates() {
        unlockedGates = progressStore?.gates() || []
        return unlockedGates
    }
</script>

<div class="game-view" id="game-view">

    <CircuitDraggable circuitController={circuitController} bind:this={circuitDraggable}/>

    <div class="shelf" bind:this={shelf}>
        {#each unlockedGates as type}
        <GameViewShelfButton circuitDraggable={circuitDraggable} gateType={type}/>
        {/each}
    </div>
    <GameViewCircuitPanel 
        bind:this={circuitPanel} 
        params={params}
        gridController={circuitController}
        circuitDraggable={circuitDraggable}
    > 
    {#if mainController}  
        {#each mainController.getInputIds() as from}
            <InputCheckBox 
                gridController={mainController}
                circuitPanel={circuitPanel}
                from={from}
            />
        {/each}  
    {/if}
    </GameViewCircuitPanel>
    <div class="directions">
        {@html params.directions}
        {#if params.completeCondition instanceof SignalSet}
            <SignalViewer 
                signalSetController={
                    new SignalSetController(params.completeCondition)
                } 
                gridController={mainController || null} 
                updateSvg={circuitPanel?.updateSvg || null}
             />
        {/if}
    </div>

    <div class="control-panel">
        <div class="simulator-player">
            <button on:click={() => {dialog.show("Save", onSubmitSave)}}>
                save
            </button>
            <button on:click={() => {dialog.show("Load", onSubmitLoad)}}>
                load
            </button>
            <button on:click={() => {dialog.show("Remove", onSubmitRemove)}}>
                remove
            </button>
        </div>
    </div>

    <TextFormPopup submitFunction={(s) => {
        return false
    }} name={"Save"} bind:this={dialog}>
    <div class="circuit-list">
        {#each circuitStorageKeys as key} 
        <p>{key} </p>
        {/each}
    </div>
    </TextFormPopup>

    <CompletionPopup bind:this={completionPopup} unlocks={params.completeRewards} />

</div>
    
<style>
    /*
    
    My idea is to layout the assigment page as a set of flexboxes.
    
    I'm not too familiar with css, but I know flexbox is the way to go for panel-style layouts
    
    The biggest challenge with this would probably be rendering the simulation of the logic circuit to the simulator box correctly
    
    We'll just have to see how it goes */
    
    /* board is the whole screen, laid out from top to bottom*/
    .game-view {
        display: grid;
        grid-template-rows: 10% 83% 7%;
        grid-template-columns: 65% 35%;
        gap: 0%;
        
        position: absolute;
        top: 0;
        left: 0;

        width: 100%;
        height: 100%;
        
    }

/* the shelf is where the user picks elements, saves progress, and opens a menu to leave the level */
    .shelf {
        grid-row: 1;
        grid-column: 1 / 3;
        background-color: blue;
        
        display: flex;
        flex-direction: row;
        justify-content: left;
    }

    

    .directions {
        grid-row: 2;
        grid-column: 2 / 3;
        background-color: green;
        padding: 30px 30px
    }

/* simulation control goes on the bottom */
    .control-panel {
        grid-row: 3;
        grid-column: 1 / 3;
        display: flex;
        background-color: red;
        flex-grow: 1.5;
        justify-content: center;
    }

    .simulator-player {
        display: flex;
        margin: 0%;
        height: 50%;
        align-items: center;
        align-self: center;
        background-color: yellow;
    }

    .circuit-list {
        height: 75%;
        overflow-x: hidden;
        overflow-y: auto;
        text-align: center;
    }

</style>