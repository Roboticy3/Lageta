<script>
    import CircuitEditorComponent from "$lib/components/GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { NotLevel, Tutorial } from "$lib/dat/Levels/Levels";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { browser } from "$app/environment";
    import TutorialIndicator from "$lib/components/GameView/CircuitEditor/TutorialIndicator.svelte";
    import { onMount } from "svelte";
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { OutputLabelledPrebaked, getGateType } from "$lib/dat/GateTypes/GateTypes";

    /**
     * @type {CircuitEditorComponent}
     */
    let editor

    /**
     * @type {TutorialIndicator}
     */
    let indicator

    let params = undefined
    $: params = browser ? Tutorial.params : undefined
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
     *  index:import("$lib/circuit_types/CircuitController").ConnectionIndex, 
     *  eventName:import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEventKey, 
     *  f:() => void}[]}}
     */
    const eventStages = [
        {
            index:{id:0,type:"Output",index:0},eventName:"dragstart",f:() => {
                if (circuitController) {
                    circuitController.addGateAtCell(getGateType(OutputLabelledPrebaked[1]), 8, 2) 
                    circuitController.setDesiredOutputs([true])
                    indicator.setPosition([7.75, 1.25])
                }
            }
        }
    ]
    let currentEvent = 0

    function prepareNextEvent(idx=currentEvent) {
        const stage = eventStages[idx]
        editor.addEventListener(stage.eventName, (evt) => {
            // @ts-ignore bc types are wild
            const q = evt.to
            if (q?.contentEquals(stage.index)) stage.f()
        })
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
                bind:this={indicator}
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