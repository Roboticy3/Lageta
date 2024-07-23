

<script>
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { GateTypeController } from "$lib/circuit_types/GateType";
    import GameViewShelfButton from "$lib/components/GameView/CircuitEditor/Shelf/GameViewShelfButton.svelte";
    import { Buf, getGateType, getGateTypeParams } from "$lib/dat/GateTypes/GateTypes";
    import { ShelfTreeNode } from "$lib/shelf_types/ShelfTree";
    import { onMount } from "svelte";
    import GameViewShelfFolder from "./GameViewShelfFolder.svelte";

    /**
     * @type {any}
     */
    export let maxSizeState = null

    /**
     * @type {(string | ShelfTreeNode)[]}
     */
    export let items = []

    $: console.log("creating shelf with items ", items)

    export let circuitDraggable

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
     */
    export let editorEventTarget

    export let depth = 1

</script>

<div 
    class="shelf" 
    style="{maxSizeState?.shelfMaxHeight ? `max-height:${maxSizeState.shelfMaxHeight};`:''}" 
    title="Shelf"
>
    {#each items as item}
        <div class="shelf-button-container">
            {#if typeof item === "string"}
                <GameViewShelfButton 
                    circuitDraggable={circuitDraggable} 
                    gateType={getGateType(getGateTypeParams(item) || Buf)}
                    editorEventTarget={editorEventTarget}
                />
            {:else}
                <GameViewShelfFolder
                    items={item.children}
                    name={item.name}
                    circuitDraggable={circuitDraggable}
                    editorEventTarget={editorEventTarget}
                    depth={depth + 1}
                />
            {/if}

        </div>
        
    {/each}
    
</div>

<style>
    .shelf-button-container {
        margin:0.5em;
        height:80%;
    }

    .shelf {

        position:relative;

        flex:1;

        background-color: var(--tertiary-bg-color);

        display: flex;
        flex-direction: row;

        transition:max-height 3s;

        height:100%;
    }
</style>