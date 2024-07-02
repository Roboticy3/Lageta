

<script>
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { GateTypeController } from "$lib/circuit_types/GateType";
    import GameViewShelfButton from "$lib/components/GameView/CircuitEditor/Shelf/GameViewShelfButton.svelte";
    import GameViewShelfFolder from "./GameViewShelfFolder.svelte";

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

    export let depth = 1

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

    <GameViewShelfFolder 
        gateTypes={gateTypes.slice(0, 4)}
        circuitDraggable={circuitDraggable}
        editorEventTarget={editorEventTarget}
        depth={depth+1}
        name={"Simple"}
    />
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