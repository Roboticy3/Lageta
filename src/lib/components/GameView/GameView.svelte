<!-- simulator containing all the basic elements needed to build, save, and load logical circuits -->

<script>
    import { onMount } from 'svelte';

    import Two from 'two.js';
    import { Gate, GateType, Buf } from "$lib/circuit_types/Gate";

    import GameViewShelfButton from "./GameViewShelfButton.svelte";
    import GameViewCircuitPanel from './GameViewCircuitPanel.svelte';
    import TextFormPopup from './TextFormPopup.svelte';

    import { mainController } from '$lib/circuit_types/CircuitController';
    import { CircuitStore } from '$lib/circuit_types/CircuitStore';

    export let directions = "";

    let gateTypes = [
        Buf,
        new GateType("Not"),
        new GateType("And", 2),
        new GateType("Or", 2),
    ]

    /**
     * @type {CircuitStore}
     */
    let circuitStore

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
        localStorageKeys = getLocalStorageKeys()
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
        localStorageKeys = getLocalStorageKeys()
        return result
    }

    function getLocalStorageKeys() {
        var keys = new Array(localStorage.length)
        for (let i = 0; i < keys.length; i++) {
            keys[i] = localStorage.key(i)
        }
        return keys
    }
    var localStorageKeys = getLocalStorageKeys()
</script>

<div class="game-view" id="game-view">

    <div class="shelf">
        {#each gateTypes as type}
        <GameViewShelfButton gateType={type}/>
        {/each}
    </div>
    <GameViewCircuitPanel bind:this={circuitPanel}/>
    <div class="directions">
        {@html directions}
    </div>

    <div class="control-panel">
        <div class="simulator-player">
            <button>
                play
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
    <div>
        {JSON.stringify(getLocalStorageKeys())}
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

</style>