<script>

    import GameView from "$lib/components/GameView/GameView.svelte";
    import GameViewCircuitPanel from "$lib/components/GameView/CircuitEditor/GameViewCircuitPanel.svelte";
    import { GameViewParameters } from "$lib/level_types/GameViewParameters";
    import CircuitEditorComponent from "$lib/components/GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { NotLevel } from "$lib/dat/Levels/Levels";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";

    let editor

    let params = undefined
    $: params = browser ? NotLevel.params : undefined
    $: circuitController = params?.initializeGrid()

</script>

{#if params && circuitController}
    <div class="level-panel" data-sveltekit-noscroll>
        <CircuitEditorComponent
            gameParams={NotLevel.params}
            circuitController={circuitController}
            editorParams={{
                canDragGates:false,
                inputCheckboxes:false
            }}  
            rendererParams={{
                showGrid:false,
                showGates:false,
                showLabels:false
            }}
        >
        </CircuitEditorComponent>
    </div>
{:else if browser}
<h1 class="fullscreen-message">
    Loading
</h1>
{/if}

<style>
    .level-panel {
        width:100%;
        height:100%;
    }
</style>