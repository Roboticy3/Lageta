<script>
    import CircuitEditorComponent from "$lib/components/GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { NotLevel } from "$lib/dat/Levels/Levels";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { browser } from "$app/environment";
    import TutorialIndicator from "$lib/components/GameView/CircuitEditor/TutorialIndicator.svelte";
    import { onMount } from "svelte";
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";

    /**
     * @type {CircuitEditorComponent}
     */
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

    /**
     * @type {{
     *  q:CircuitControllerQueryResult, 
     *  eventName:import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEventKey, 
     *  f:() => void}[]}}
     */
    const eventStages = [
        {qs:"#point-output-0-0",eventName:"dragstart",f:() => {console.log("clicked first connection point!")}}
    ]
    let currentEvent = 0

    function prepareNextEvent(idx=currentEvent) {
        const data = eventStages[idx]
        let element = editor?.getElement(data.qs)
        if (element) {
            console.log("found ", data.qs, "! Adding ", data.eventName, " event")
            element.addEventListener(data.eventName, data.f)
        }
    }

    onMount(prepareNextEvent)

</script>

{#if params && circuitController}
    <div class="level-panel" data-sveltekit-noscroll>
        <CircuitEditorComponent
            bind:this={editor}
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