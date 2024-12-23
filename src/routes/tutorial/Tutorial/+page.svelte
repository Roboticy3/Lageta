<script>
// @ts-nocheck

    import CircuitEditorComponent from "$lib/components/GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { Tutorial } from "$lib/dat/Levels/Levels";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { onMount, tick } from "svelte";
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
    import TutorialFrame from "$lib/components/GameView/Tutorial/TutorialFrame.svelte";
    import { ShelfTreeNode } from "$lib/dat/Shelf/ShelfTree";
    import { gridSourceToGrid } from "$lib/level_types/GameViewParameters";

    /**
     * @type {CircuitController}
     */
    const circuitController = new CircuitController(gridSourceToGrid(Tutorial.params.params), undefined, Tutorial.completeCondition?.solver)
    circuitController.setInputs([true])

    let progressStorage = null
    $: if (browser) progressStorage = new ProgressStorage()

    /**
     * @type {GameView | null}
     */
    let gameView = null

    let state = {
        currentEvent:0,
        showInputCheckboxes:false,
        circuitController:circuitController,
        input:true,
        output:undefined,
        expectedOutput:undefined,
        showShelf:false,
        signalPlaying:false,
        rendererParams: {
            showGates:false,
            showLabels:false
        },
        isCircuitValid:false
    }

    /**
     * @type {CircuitEditorComponent}
     */
    let editor
    $: state.editor = editor

    const eventStagesController = new TutorialEventSequenceController(
        EventSequenceTutorial(state)
    )
    eventStagesController.eventSequenceTarget.addEventListener('preparenext', ({idxOffset}) => { 
        state.currentEvent += idxOffset
        console.log("prepared", state.currentEvent)
        state = state
    })
    eventStagesController.signalEventTarget.addEventListener('play', () => { 
        state.signalPlaying = true
        state = state
    })
    eventStagesController.signalEventTarget.addEventListener('pause', () => { 
        state.signalPlaying = false
        state = state
    })
    eventStagesController.signalEventTarget.addEventListener('restart', () => { 
        state.isCircuitValid = true
        state.signalPlaying = false
        state = state
    })
    eventStagesController.signalEventTarget.addEventListener('done', () => { 
        state.signalPlaying = false
        state = state
    })
    eventStagesController.signalEventTarget.addEventListener('done', () => { 
        state.signalPlaying = false
        state = state
    })
    eventStagesController.signalEventTarget.addEventListener('step', (evt) => { 
        state.isCircuitValid = gameView?.isCircuitValid()
        state = state
    })

    let size = 100
    $: size = state.currentEvent >= 9 ? 0 : 100

    const slidinParams = {
        navFlex:1,
        shelfMaxHeight:'15%',
        signalMaxHeight:'36%',
        instructionsFlex:3
    }

    /**
     * @param {number | string} flex
     */
    function initialMaxSize(flex) {
        return flex ? 0 : flex
    }

    let maxSizeState = {
        navFlex:initialMaxSize(slidinParams.navFlex),
        shelfMaxHeight:initialMaxSize(slidinParams.shelfMaxHeight),
        instructionsFlex:initialMaxSize(slidinParams.instructionsFlex),
        signalMaxHeight:initialMaxSize(slidinParams.signalMaxHeight)
    }

    let shelf = new ShelfTreeNode("None", [])

    $: {
        if (state.currentEvent === 15 && shelf.children.length === 0) {
            shelf.children.push("Not")
            shelf = shelf
        }
    }

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

    $: editorParams = {
        inputCheckboxes:state.showInputCheckboxes,
        showShelf:state.showShelf,
        signalSpeed:(frame) => 100
    }

</script>

<TutorialFrame
    on:skip={async () => {
        eventStagesController.prepareEvent(state.currentEvent, 26)

        await tick()

        circuitController.onComplete()
    }}
>
    <div style="width:{size}%; height:{size}%;" data-sveltekit-noscroll>
        <CircuitEditorComponent
            bind:this={editor}
            gameParams={Tutorial.params}
            circuitController={circuitController}
            editorParams={editorParams}
            bind:rendererParams={state.rendererParams}
            bind:shelf={shelf}
            editorEventTarget={eventStagesController.editorEventTarget}
            maxSizeState={maxSizeState}
        >
            <CircuitEditorContentsTutorial
                circuitController={circuitController}
                eventStagesController={eventStagesController}
                state={state}
                on:continue={onContinue}
            />
        </CircuitEditorComponent>
    </div>
    
    {#if state.currentEvent >= 9}
        <GameView
            
            gameParams={Tutorial.params}
            circuitController={circuitController}
            editorParams={editorParams}
            existingEditor={editor}
            signalSetViewEventTarget={eventStagesController.signalEventTarget}
            bind:maxSizeState={maxSizeState}
            shelf={shelf}
            bind:this={gameView}
        >
            <GameViewContentsTutorial 
                state={state}
                eventStagesController={eventStagesController}
                on:continue={onContinue}
            />
        </GameView>
        <div use:delayedContinue></div>
    {/if}
</TutorialFrame>
