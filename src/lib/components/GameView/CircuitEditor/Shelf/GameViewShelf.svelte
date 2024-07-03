

<script>
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { GateTypeController } from "$lib/circuit_types/GateType";
    import GameViewShelfButton from "$lib/components/GameView/CircuitEditor/Shelf/GameViewShelfButton.svelte";
    import { Buf, getGateType, getGateTypeParams } from "$lib/dat/GateTypes/GateTypes";
    import { ShelfTreeNode } from "$lib/shelf_types/ShelfTree";
    import { onMount } from "svelte";
    import GameViewShelfFolder from "./GameViewShelfFolder.svelte";

    export let maxSizeState

    /**
     * @type {(string | ShelfTreeNode)[]}
     */
    export let items

    export let circuitDraggable

    /**
     * @type {GameViewCircuitPanelEventTarget}
     */
    export let editorEventTarget

    export let depth = 1

</script>

<div 
    class="shelf" 
    style="max-height:{maxSizeState.shelfMaxHeight};" 
    title="Shelf"
>
    {#each items as item}
        {#if typeof item === "string"}
            <div class="shelf-button-container">
                <GameViewShelfButton 
                    circuitDraggable={circuitDraggable} 
                    gateType={getGateType(getGateTypeParams(item) || Buf)}
                    editorEventTarget={editorEventTarget}
                />
            </div>
        {:else}
            <div class="shelf-button-container">
                <GameViewShelfFolder
                    items={item.children}
                    name={item.name}
                    circuitDraggable={circuitDraggable}
                    editorEventTarget={editorEventTarget}
                    depth={depth + 1}
                    maxSizeState={maxSizeState}
                />
            </div>
        {/if}
        
        
    {/each}
    
</div>

<style>
    .shelf-button-container {
        margin-left:3%;
        height:80%;
    }

    .shelf {

        position:relative;

        flex:1;

        background-color: var(--tertiary-bg-color);

        display: flex;
        flex-direction: row;

        transition:max-height 3s;
    }
</style>