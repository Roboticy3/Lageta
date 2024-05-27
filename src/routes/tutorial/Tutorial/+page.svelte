<script>
// @ts-nocheck

    import CircuitEditorComponent from "$lib/components/GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { Tutorial } from "$lib/dat/Levels/Levels";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { browser } from "$app/environment";
    import TutorialIndicator from "$lib/components/GameView/Tutorial/TutorialIndicator.svelte";
    import { onMount } from "svelte";
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import TutorialText from "$lib/components/GameView/Tutorial/TutorialText.svelte";
    import CircuitDiv from "$lib/components/GameView/CircuitDiv.svelte";
    import { TutorialEventSequenceController } from "$lib/tutorial_types/TutorialEventSequence";
    import { createGameViewCircuitPanelEvent } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { createCustomEvent } from "$lib/misc_types/CustomEventSystem";
    import { TutorialEvents } from "$lib/dat/Tutorials/Tutorials"
    import TutorialConnectionLabel from "$lib/components/GameView/Tutorial/TutorialConnectionLabel.svelte";

    /**
     * @type {CircuitEditorComponent}
     */
    let editor

    /**
     * @type {CircuitController}
     */
    let circuitController = Tutorial.params.initializeGrid()
    circuitController.setInputs([true])

    let state = {
        currentEvent:0,
        showInputCheckboxes:false,
        circuitController:circuitController,
        input:true,
        output:undefined
    }

    /**
     * @type {TutorialIndicator | undefined}
     */
    let indicator = undefined
    $: state.indicator = indicator

    let eventStagesController = new TutorialEventSequenceController(
        TutorialEvents(state)
    )
    eventStagesController.eventSequenceTarget.addEventListener('preparenext', () => { 
        console.log("preparing", eventStagesController.getCurrentEvent())
        state.currentEvent++
        state = state
    })

    /**
     * @param {any} e
     */
    function onContinue(e) {
        eventStagesController.tutorialEventTarget.dispatchEvent(createCustomEvent({}, "continue", editor))
    }

    onMount(() => {
        eventStagesController.prepareNextEvent(createGameViewCircuitPanelEvent("changed", new CircuitControllerQueryResult(), new CircuitControllerQueryResult(), editor))
        editor.addEventListener("changed", setConnectionValues)
    })

    function setConnectionValues() {
        state.input = circuitController.getInputs()[0]
        state.output = circuitController.getOutputs()[0]
        state = state
    }

</script>


<div class="level-panel" data-sveltekit-noscroll>
    <CircuitEditorComponent
        bind:this={editor}
        gameParams={Tutorial.params}
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
        editorEventTarget={eventStagesController.editorEventTarget}
    >
        <TutorialIndicator 
            bind:this={indicator}
            circuitController={circuitController}
            position={[1.35, 1.25]}
        />

        {#if state.currentEvent === 8} 
            <TutorialText 
                position={[50, 10]} 
                showButton={false}
                on:continue={onContinue}
            >
                <p style="color:black; font-size:x-large;">
                    Are you ready to solve some puzzles?
                </p>
                <p>
                    (Reconnect the points to continue)
                </p>
            </TutorialText>
        {/if}

        {#if state.currentEvent === 7} 
            <TutorialText 
                position={[50, 10]} 
                showButton={false}
                on:continue={onContinue}
            >
                <p style="color:black; font-size:x-large;">
                    Click on any blank space to delete a wire.
                </p>
            </TutorialText>
        {/if}

        {#if state.currentEvent >= 6 && state.currentEvent <= 7}
            <TutorialText 
                position={[50, 70]} 
                on:continue={onContinue}
                showButton={false}
            >
                <p style="color:black; font-size:x-large;">
                    When points are not connected to anything, they have
                    <span style="color:var(--connection-color-x)">neither</span>
                    high or low voltage.
                </p>
            </TutorialText>
        {/if}

        {#if state.currentEvent === 5}
            <TutorialText 
                position={[50, 70]} 
                showButton={true}
                on:continue={onContinue}
            >
                <p style="color:black; font-size:x-large;">At any connection point, voltage can be
                    <span style="color:var(--connection-color-on)">high</span>,
                    <span style="color:var(--connection-color-off)">low</span>,
                    or <span style="color:var(--connection-color-x)">neither</span>.
                </p>
            </TutorialText>
            <TutorialConnectionLabel
                circuitController={circuitController}
                index={{id:0, type:"Output", index:0}}
                adjust={[-0.5,0.25]}
            />
            <TutorialConnectionLabel
                circuitController={circuitController}
                index={{id:1, type:"Input", index:0}}
            />
        {/if}

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
                availableButton={state.output === true}
                on:continue={onContinue}
            >
                <p style="font-size:xx-large; color:black;">Voltage!</p>
            </TutorialText>
        {/if}
        
    </CircuitEditorComponent>
</div>

<style>
    .level-panel {
        width:100%;
        height:100%;
        transition: stroke 1s;
    }
</style>