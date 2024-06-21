

<script>
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { GateTypeController } from "$lib/circuit_types/GateType";
    import GameViewShelfButton from "./GameViewShelfButton.svelte";

    export let maxSizeState

    /**
     * @type {GateTypeController[]}
     */
    export let gateTypes

    export let circuitDraggable

    /**
     * @type {GameViewCircuitPanelEventTarget}
     */
    export let editorEventTarget
</script>

<div 
    class="shelf" 
    style="max-height:{maxSizeState.shelfMaxHeight};" 
    title="Shelf"
>
    {#each gateTypes as gateTypeController}
        <GameViewShelfButton 
            circuitDraggable={circuitDraggable} 
            gateType={gateTypeController}
            editorEventTarget={editorEventTarget}
        />
    {/each}
</div>

<style>
    .shelf {

        flex:1;

        background-color: var(--tertiary-bg-color);

        display: flex;
        flex-direction: row;

        transition:max-height 3s;
    }
</style>