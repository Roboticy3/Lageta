

<script>
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { GateType, GateTypeController } from "$lib/circuit_types/GateType";
    import GameViewShelfButton from "$lib/components/GameView/CircuitEditor/Shelf/GameViewShelfGate.svelte";
    import { Buf, getGateType, getGateTypeParams } from "$lib/dat/GateTypes/GateTypes";
    import { ShelfTreeNode } from "$lib/dat/Shelf/ShelfTree";
    import { onMount } from "svelte";
    import GameViewShelfFolder from "./GameViewShelfFolder.svelte";
    import { getToolParams, Sticker } from "$lib/dat/Tools/Tools";

    /**
     * @type {any}
     */
    export let maxSizeState = null

    /**
     * @type {any}
     */
    const sParams = getToolParams("Stickers")

    /**
     * @type {(string | ShelfTreeNode)[]}
     */
    export let items = []
    /**
     * @type {(string | ShelfTreeNode | GateTypeController | Sticker | undefined)[]}
     */
    let processedItems = []
    $: {
        processedItems = items.map((item) => {
            if (typeof item === "string") {
                const gParams = getGateTypeParams(item)
                if (gParams) {
                    return getGateType(gParams)
                }
                else {
                    const stickerList = sParams?.stickers
                    if (stickerList instanceof Array) {
                        const sticker = stickerList.find((v) => v.name === item)
                        if (sticker instanceof Sticker) {
                            return sticker
                        }
                    }
                }
                return item
            }
            else if (item instanceof ShelfTreeNode) {
                return item
            }
            return undefined
        })
    }

    $: console.log("creating shelf with items ", items)

    export let circuitDraggable

    /**
     * @type {GameViewCircuitPanelEventTarget}
     */
    export let editorEventTarget

    export let depth = 1

</script>

<div 
    class="shelf" 
    style="{maxSizeState?.shelfMaxHeight ? `max-height:${maxSizeState.shelfMaxHeight};`:''}" 
    title="Shelf"
>
    {#each processedItems as item}
        <div class="shelf-button-container">
            {#if item instanceof GateTypeController}
                <GameViewShelfButton 
                    circuitDraggable={circuitDraggable} 
                    gateType={item}
                    editorEventTarget={editorEventTarget}
                />
            {:else if item instanceof ShelfTreeNode}
                {#if item.name === "Stickers"}
                    {#if depth === 1} <!--Filter stamps folder out if this isn't the top shelf-->
                        <GameViewShelfFolder
                            items={item.children}
                            name={item.name}
                            circuitDraggable={circuitDraggable}
                            editorEventTarget={editorEventTarget}
                            depth={depth}
                        />
                    {/if}
                {:else}
                    <GameViewShelfFolder
                        items={item.children}
                        name={item.name}
                        circuitDraggable={circuitDraggable}
                        editorEventTarget={editorEventTarget}
                        depth={depth}
                    />
                {/if} 
            {:else if item instanceof Sticker}
                
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