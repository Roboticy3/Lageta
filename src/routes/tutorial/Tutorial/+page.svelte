<script>
    import CircuitEditorComponent from "$lib/components/GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { NotLevel, Tutorial } from "$lib/dat/Levels/Levels";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { browser } from "$app/environment";
    import TutorialIndicator from "$lib/components/GameView/Tutorial/TutorialIndicator.svelte";
    import { onMount } from "svelte";
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { OutputLabelledPrebaked, getGateType } from "$lib/dat/GateTypes/GateTypes";
    import TutorialText from "$lib/components/GameView/Tutorial/TutorialText.svelte";

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
     *  eventName:import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEventKey, 
     *  f:(evt:any) => void}[]}}
     */
    const eventStages = [
        {
            eventName:"dragstart",f:(evt) => {
                if (
                    evt.to.contentEquals({id:0,type:"Output",index:0}) && 
                    circuitController
                ) {
                    
                    circuitController.addGateAtCell(getGateType(OutputLabelledPrebaked[1]), 8, 2) 
                    circuitController.setDesiredOutputs([true])
                    indicator.setPosition([7.75, 1.25])
                    prepareNextEvent()
                }
            }
        },
        {
            eventName:"drop",f:(evt) => {
                if (
                    circuitController && 
                    circuitController.getOutputs()[0] === true
                ) {
                    state.showInputCheckboxes = true
                    state = state
                    prepareNextEvent()
                }
            }
        }
    ]

    let state = {
        currentEvent:0,
        showInputCheckboxes:false,
    }

    function prepareNextEvent(idx=state.currentEvent) {
        const last = eventStages[idx - 1]
        if (last) {
            editor.removeEventListener(last.eventName, last.f)
        }
        const stage = eventStages[idx]
        if (stage) {
            editor.addEventListener(stage.eventName, stage.f)
        }
        state.currentEvent++
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
                inputCheckBoxes:state.showInputCheckboxes
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

    {#if state.currentEvent === 3}
        <TutorialText position={[50, 80]}>
            <p>Voltage!</p>
        </TutorialText>
    {:else if state.currentEvent === 4}
    {/if}
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