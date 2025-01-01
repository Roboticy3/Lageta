

<script>
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { GateTypeController } from "$lib/circuit_types/GateType";
    import GameViewShelfButton from "$lib/components/GameView/CircuitEditor/Shelf/GameViewShelfGate.svelte";
    import { getGateTypeNoRegister } from "$lib/dat/GateTypes/GateTypes";
    import { ShelfTreeNode } from "$lib/dat/Shelf/ShelfTree";
    import { onMount, tick } from "svelte";
    import GameViewShelfFolder from "./GameViewShelfFolder.svelte";
    import { StickersTool } from "$lib/dat/Tools/Tools";
import { StickerType } from "$lib/circuit_types/sticker/Sticker";    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import GameViewShelfSticker from "./GameViewShelfSticker.svelte";

    /**
     * Currently broken, supposed to make the shelf slide in. Should use css animations instead of this bs
     * @type {any}
     */
    //export let maxSizeState = {}

    /**
     * @type {ProgressStorage | null}
     */
    export let progress = null
    /**
     * @type {Array<StickerType> | undefined}
     */
    $: stickers = progress?.getTool(StickersTool.name)?.data?.stickers

    /**
     * @type {(string | ShelfTreeNode)[]}
     */
    export let items = []
    $: processedItems = items.map((item) => {
        if (item instanceof ShelfTreeNode) return item

        const cType = getGateTypeNoRegister({name:item})
        if (cType) return cType
        
        const sticker = stickers?.find((v) => v.name === item)
        if (sticker) return sticker
    })

    $: console.log("creating shelf with items ", processedItems)

    export let circuitDraggable

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
     */
    export let editorEventTarget

    export let depth = 1

    let growingState = true
    onMount(async() => {
        await tick()

        growingState = false
    })

</script>

<div 
    class="shelf" 
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
                            progress={progress}
                        />
                    {/if}
                {:else}
                    <GameViewShelfFolder
                        items={item.children}
                        name={item.name}
                        circuitDraggable={circuitDraggable}
                        editorEventTarget={editorEventTarget}
                        depth={depth}
                        progress={progress}
                    />
                {/if} 
            {:else if item !== undefined}
                <GameViewShelfSticker
                    circuitDraggable={circuitDraggable}
                    sticker={item}
                    editorEventTarget={editorEventTarget}
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

        max-width: 100%;

        transition:max-height 3s;

        height:100%;
    }
</style>