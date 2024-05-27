<script>
// @ts-nocheck

    import CircuitEditorComponent from "$lib/components/GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { Tutorial } from "$lib/dat/Levels/Levels";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { onMount } from "svelte";
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { TutorialEventSequenceController } from "$lib/tutorial_types/TutorialEventSequence";
    import { createGameViewCircuitPanelEvent } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { createCustomEvent } from "$lib/misc_types/CustomEventSystem";
    import { EventSequenceTutorial } from "$lib/dat/Tutorials/TutorialEventSequences"
    import CircuitEditorContentsTutorial from "$lib/dat/Tutorials/TutorialCircuitEditorContents/CircuitEditorContentsTutorialPart1.svelte";
    import GameView from "$lib/components/GameView/GameView.svelte";

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

    let eventStagesController = new TutorialEventSequenceController(
        EventSequenceTutorial(state)
    )
    eventStagesController.eventSequenceTarget.addEventListener('preparenext', () => { 
        state.currentEvent++
        console.log("prepared", state.currentEvent)
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
    })    

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
        {#if state.currentEvent < 9}
            <CircuitEditorContentsTutorial 
                circuitController={circuitController}
                state={state}
                on:continue={onContinue}
            />
        {/if}
    </CircuitEditorComponent>
</div>

{#if state.currentEvent >= 9}
    <GameView
        gameParams={Tutorial.params}
        circuitController={circuitController}
        editorParams={{
            canDragGates:false,
            inputCheckBoxes:state.showInputCheckboxes
        }}
        existingEditor={editor}
    >
    </GameView>
{/if}

<style>
    .level-panel {
        width:100%;
        height:100%;
    }
</style>