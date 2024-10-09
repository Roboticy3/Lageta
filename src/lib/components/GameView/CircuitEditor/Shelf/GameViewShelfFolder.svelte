
<script>
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { GateTypeController } from "$lib/circuit_types/GateType";
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";
    import { ShelfTreeNode } from "$lib/dat/Shelf/ShelfTree";
import { StickerType } from "$lib/circuit_types/sticker/Sticker";    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import GameViewShelf from "./GameViewShelf.svelte";


    /**
     * @type {(string | ShelfTreeNode)[]}
     */
    export let items

    export let circuitDraggable

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
     */
    export let editorEventTarget

    export let depth

    export let name

    /**
     * @type {ProgressStorage | null}
     */
    export let progress = null

    const dropdownButtonStyle = 
`
    width:100%;
    height:100%;
`
</script>

<div class="dropdown">
    <HeavyButton 
        style={dropdownButtonStyle}
    >
        {name}
    </HeavyButton>
    {#if depth < 5}
        <div class="dropdown-content">
            <GameViewShelf 
                items={items}
                circuitDraggable={circuitDraggable}
                editorEventTarget={editorEventTarget}
                depth={depth + 1}
                progress={progress}
            />
        </div>
    {/if}
</div>

<style>
    .dropdown {
        position:relative;
        height:100%;
    }

    .dropdown:hover > .dropdown-content {
        display:block;
    }

    .dropdown-content {
        display:none;
        position:absolute;
        background:var(--main-bg-color);
        height:10vh;
        top:100%;
    }
</style>