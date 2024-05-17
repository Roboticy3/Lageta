<script>
    import CircuitEditorComponent from "$lib/components/GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { NotLevel } from "$lib/dat/Levels/Levels";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { browser } from "$app/environment";
    import TutorialIndicator from "$lib/components/GameView/CircuitEditor/TutorialIndicator.svelte";

    let editor

    let params = undefined
    $: params = browser ? NotLevel.params : undefined
    /**
     * @type {CircuitController | undefined}
     */
    let circuitController = undefined
    $: {
        circuitController = params?.initializeGrid()
        circuitController?.setInput([0, 0], true)
    }

</script>

{#if params && circuitController}
    <div class="level-panel" data-sveltekit-noscroll>
        <CircuitEditorComponent
            gameParams={NotLevel.params}
            circuitController={circuitController}
            editorParams={{
                canDragGates:false,
                inputCheckBoxes:false
            }}
            rendererParams={{
                showGrid:false,
                showGates:false,
                showLabels:false
            }}
        >
            <TutorialIndicator 
                circuitController={circuitController}
                position={[1.35, 1.25]}
            />
            
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