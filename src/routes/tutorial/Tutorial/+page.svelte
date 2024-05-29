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
    import CircuitEditorContentsTutorial from "$lib/dat/Tutorials/TutorialCircuitEditorContents/CircuitEditorContentsTutorial.svelte";
    import GameView from "$lib/components/GameView/GameView.svelte";
    import GameViewContentsTutorial from "$lib/dat/Tutorials/TutorialGameViewContents/GameViewContentsTutorial.svelte";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import { browser } from "$app/environment";

    /**
     * @type {CircuitController}
     */
    const circuitController = Tutorial.params.initializeGrid()
    circuitController.setInputs([true])

    let progressStorage = null
    $: if (browser) progressStorage = new ProgressStorage()

    let state = {
        currentEvent:0,
        showInputCheckboxes:false,
        circuitController:circuitController,
        input:true,
        output:undefined,
        showShelf:false
    }

    /**
     * @type {CircuitEditorComponent}
     */
    let editor
    $: state.editor = editor

    let eventStagesController = new TutorialEventSequenceController(
        EventSequenceTutorial(state)
    )
    eventStagesController.eventSequenceTarget.addEventListener('preparenext', () => { 
        state.currentEvent++
        console.log("prepared", state.currentEvent)
        state = state
    })

    let size = 100
    $: size = state.currentEvent >= 9 ? 0 : 100

    function onContinue() {
        eventStagesController.tutorialEventTarget.dispatchEvent(createCustomEvent({}, "continue", editor))
    }

    async function delayedContinue() {
        const delay = () => {return new Promise((resolve) => {setTimeout(resolve, 3500)})}
        await delay()
        onContinue(null)
    }

    onMount(() => {
        eventStagesController.prepareNextEvent(createGameViewCircuitPanelEvent("changed", new CircuitControllerQueryResult(), new CircuitControllerQueryResult(), editor))
    })    

</script>


<div style="width:{size}%; height:{size}%;" data-sveltekit-noscroll>
    <CircuitEditorComponent
        bind:this={editor}
        gameParams={Tutorial.params}
        circuitController={circuitController}
        editorParams={{
            canDragGates:false,
            inputCheckBoxes:state.showInputCheckboxes,
            showShelf:state.showShelf
        }}
        rendererParams={{
            showGrid:false,
            showGates:false,
            showLabels:false
        }}
        editorEventTarget={eventStagesController.editorEventTarget}
        shelf={progressStorage?.gates()}
    >
        <CircuitEditorContentsTutorial
            circuitController={circuitController}
            state={state}
            on:continue={onContinue}
        />
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
        <GameViewContentsTutorial 
            state={state}
            on:continue={onContinue}
        />
    </GameView>
    <div use:delayedContinue></div>
{/if}