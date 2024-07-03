
<script>
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { GateTypeController } from "$lib/circuit_types/GateType";
    import GameViewShelf from "./GameViewShelf.svelte";


    /**
     * @type {GateTypeController[]}
     */
    export let gateTypes

    export let circuitDraggable

    /**
     * @type {GameViewCircuitPanelEventTarget}
     */
    export let editorEventTarget

    export let maxSizeState

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
                gateTypes={gateTypes}
                circuitDraggable={circuitDraggable}
                editorEventTarget={editorEventTarget}
                maxSizeState={maxSizeState}
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
        transform-origin: 0% 0%;
        rotate:90deg;
        translate:25% 0%;
        width:25vh;
        padding:20%;
    }
    
    .dropdown-button {
        width:100%;
        height:100%;
    }
</style>