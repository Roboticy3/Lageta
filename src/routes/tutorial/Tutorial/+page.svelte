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
    import CircuitDiv from "$lib/components/GameView/CircuitDiv.svelte";

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
     * Events can either be of a type that can listen to GameViewCircuitPanel (i.e. GameViewCircuitPanelEventKey),
     * or of an additional custom type to listen for things outside of the circuit (i.e. clicking the continue button on tutorial text)
     * @type {{ 
     *  eventName:import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEventKey | "continue", 
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
                    indicator.hide()
                    state.showInputCheckboxes = true
                    state = state
                    prepareNextEvent()
                }
            }
        },
        {
            eventName:"continue",f:(evt) => {

            }
        }
    ]

    let state = {
        currentEvent:0,
        showInputCheckboxes:false,
    }

    function prepareNextEvent(idx=state.currentEvent) {
        unstageEvent(idx - 1)
        stageEvent(idx)
        state.currentEvent++
    }

    /**
     * @param {number} idx
     */
    function stageEvent(idx) {
        const stage = eventStages[idx]
        if (stage) switch (stage.eventName) {
            case "continue": break;
            default: editor.addEventListener(stage.eventName, stage.f)
        }
    }

    /**
     * @param {number} idx
     */
    function unstageEvent(idx) {
        const stage = eventStages[idx]
        if (stage) switch (stage.eventName) {
            case "continue": break;
            default: editor.removeEventListener(stage.eventName, stage.f)
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

            {#if state.currentEvent === 3}
                <CircuitDiv
                    circuitController={circuitController}
                    position={[0.65, 1.25]}
                    size={[0.75, 0.25]}
                    active={true}
                    smooth={true}
                >
                    <p style="font-size:small">what's this?</p>
                </CircuitDiv>
                <TutorialText position={[50, 55]} style={"color:black; transform:scale(2);"}>
                    <p>Voltage!</p>
                </TutorialText>
            {:else if state.currentEvent === 4}
            {/if}
            
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