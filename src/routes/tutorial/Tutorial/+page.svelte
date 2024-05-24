<script>
    import CircuitEditorComponent from "$lib/components/GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { NotLevel, Tutorial } from "$lib/dat/Levels/Levels";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { browser } from "$app/environment";
    import TutorialIndicator from "$lib/components/GameView/Tutorial/TutorialIndicator.svelte";
    import { createEventDispatcher, onMount } from "svelte";
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { OutputLabelledPrebaked, getGateType } from "$lib/dat/GateTypes/GateTypes";
    import TutorialText from "$lib/components/GameView/Tutorial/TutorialText.svelte";
    import CircuitDiv from "$lib/components/GameView/CircuitDiv.svelte";
    import { TutorialEventTarget } from "$lib/tutorial_types/TutorialEvent";

    /**
     * @type {CircuitEditorComponent}
     */
    let editor

    /**
     * @type {(TutorialIndicator | undefined)[]}
     */
    let indicators = new Array(2)

    const tutorialEventTarget = new TutorialEventTarget()

    /**
     * @param {import("$lib/tutorial_types/TutorialEvent").TutorialEventKey} type
     * @param {import("$lib/tutorial_types/TutorialEvent").TutorialEventListener} listener
     */
    function addTutorialEventListener(type, listener) {
        tutorialEventTarget.addEventListener(type, listener)
    }

    /**
     * @param {import("$lib/tutorial_types/TutorialEvent").TutorialEventKey} type
     * @param {import("$lib/tutorial_types/TutorialEvent").TutorialEventListener} listener
     */
     function removeTutorialEventListener(type, listener) {
        tutorialEventTarget.removeEventListener(type, listener)
    }

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
                    indicators[0]?.setPosition([7.75, 1.25])
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
                    indicators[0]?.hide()
                    state.showInputCheckboxes = true
                    prepareNextEvent()
                }
            }
        },
        {
            eventName:"continue",f:(evt) => {
                if (
                    circuitController
                ) {
                    circuitController.setDesiredOutputs([false])
                    indicators[0]?.show()
                    indicators[0]?.setPosition([0.65, 0.75])
                    prepareNextEvent()
                }
            }
        },
        {
            eventName:"setinput",f:(evt) => {
                if (
                    circuitController &&
                    circuitController.getOutputs()[0] === false
                ) {
                    circuitController.setDesiredConnectionValues()
                    prepareNextEvent()
                } 
            }
        },
    ]

    let state = {
        currentEvent:0,
        showInputCheckboxes:false,
    }

    function prepareNextEvent() {
        state.currentEvent++
        unstageEvent(state.currentEvent - 2)
        stageEvent(state.currentEvent - 1)
        state = state
    }

    /**
     * @param {number} idx
     */
    function stageEvent(idx) {
        const stage = eventStages[idx]
        if (stage) switch (stage.eventName) {
            case "continue":
                addTutorialEventListener("continue", stage.f)
                break;
            default: editor.addEventListener(stage.eventName, stage.f)
        }
    }

    /**
     * @param {number} idx
     */
    function unstageEvent(idx) {
        const stage = eventStages[idx]
        if (stage) switch (stage.eventName) {
            case "continue": 
                removeTutorialEventListener("continue", stage.f)
                break;
            default: editor.removeEventListener(stage.eventName, stage.f)
        }
    }

    /**
     * @param {any} e
     */
    function onContinue(e) {
        tutorialEventTarget.dispatchEvent(e)
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
                bind:this={indicators[0]}
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
                    <p style="scale:0.75">what's this?</p>
                </CircuitDiv>
                <!--Gross multi-binds, let's see if this works!-->
                <TutorialText 
                    position={[50, 55]} 
                    on:continue={onContinue}
                >
                    <p style="font-size:xx-large; color:black;">Voltage!</p>
                </TutorialText>
            {:else if state.currentEvent === 5}
                <TutorialText 
                    position={[50, 70]} 
                >
                    <p style="color:black; font-size:x-large;">At any connection point, voltage can be
                        <span style="color:var(--connection-color-on)">high</span>,
                        <span style="color:var(--connection-color-off)">low</span>,
                        or <span style="color:var(--connection-color-x)">neither</span>.
                    </p>
                </TutorialText>
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