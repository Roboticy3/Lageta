<!-- simulator containing all the basic elements needed to build, save, and load logical circuits -->

<script>
    import { onMount } from 'svelte';

    // @ts-ignore
    import { GateType, all_gates } from "$lib/circuit_types/Gate";

    import GameViewShelfButton from "./GameViewShelfButton.svelte";
    import GameViewCircuitPanel from './GameViewCircuitPanel.svelte';
    import TextFormPopup from './TextFormPopup.svelte';

    import { CircuitController, mainController } from '$lib/circuit_types/CircuitController';
    
    import { CircuitStore } from '$lib/storage_types/CircuitStorage';
    import { ProgressStorage } from '$lib/storage_types/ProgressStore';
    
    //@ts-ignore
    import { CompleteCondition, GameViewParameters } from '$lib/level_types/GameViewParameters';
    import { all_levels } from '$lib/level_types/Level';
    import TruthTableView from './TruthTableView.svelte';
    import { TruthTable } from '$lib/circuit_types/TruthTable';

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

    /**
     * @type {GameViewCircuitPanel}
    */
   let circuitPanel

    onMount(() => {

        if (mainController === undefined) {
            console.log("there should be a controller here!")
            return
        }

        circuitStore = new CircuitStore(mainController, "")
        updateLocalStorageKeys()

        progressStore = new ProgressStorage()
        if (params.allUnlocks) {
            progressStore.cheat()
        }
        updateUnlockedGates()
    })

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
        console.log(s)
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

    /**
     * test by resolving values of all of the outputs on the board
     */
    function onTest() {
        const result = mainController?.resolve()
        if (result === undefined) {
            console.log("No CircuitController found")
        }
        circuitPanel.updateSvg()

    }

</script>

<div class="game-view" id="game-view">

    <div class="shelf">
        {#each unlockedGates as type}
        <GameViewShelfButton gateType={type}/>
        {/each}
    </div>
    <GameViewCircuitPanel bind:this={circuitPanel} params={params}/>
    <div class="directions">
        {@html params.directions}
        {#if params.completeCondition !== undefined}
            <TruthTableView table={new TruthTable(params.completeCondition)}/>
        {/if}
    </div>

    <div class="control-panel">
        <div class="simulator-player">
            <button on:click={onTest}>
                test
            </button>
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