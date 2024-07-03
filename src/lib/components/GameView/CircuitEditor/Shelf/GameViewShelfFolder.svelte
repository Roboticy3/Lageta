
<script>
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { GateTypeController } from "$lib/circuit_types/GateType";
    import { ShelfTreeNode } from "$lib/shelf_types/ShelfTree";
    import GameViewShelf from "./GameViewShelf.svelte";


    /**
     * @type {(string | ShelfTreeNode)[]}
     */
    export let items

    export let circuitDraggable

    /**
     * @type {GameViewCircuitPanelEventTarget}
     */
    export let editorEventTarget

    export let depth

    export let name
</script>

<div class="dropdown">
    <button class="dropdown-button">
        {name}
    </button>
    {#if depth < 5}
        <div class="dropdown-content">
            <GameViewShelf 
                items={items}
                circuitDraggable={circuitDraggable}
                editorEventTarget={editorEventTarget}
                depth={depth}
            />
        </div>
    {/if}
</div>

<style>
    .dropdown {
        position:relative;
        height:100%;
    }

    .dropdown-button {
        overflow: hidden;
    }

    .dropdown:hover > .dropdown-content {
        display:block;
    }

    .dropdown-content {
        display:none;
        position:absolute;
        background:var(--main-bg-color);
        width:fit-content;
        height:10vh;
        top:100%;
    }
    
    .dropdown-button {
        width:100%;
        height:100%;
    }
</style>