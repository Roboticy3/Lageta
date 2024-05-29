<!-- simulator containing all the basic elements needed to build, save, and load logical circuits -->

<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { CircuitSignalSetView, SignalSetView } from "$lib/signal_types/SignalSetView";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import SignalViewer from "./SignalViewer.svelte";
    import CompletionPopup from "./CompletionPopup.svelte";
    import CircuitEditorComponent from "./CircuitEditor/CircuitEditorComponent.svelte";
    import { onMount, tick } from "svelte";

    /**
     * @type {import("$lib/level_types/GameViewParameters").GameViewParameters}
     */
    export let gameParams
    /**
     * @type {any}
     */
    export let editorParams = {}
    export let rendererParams = {}

    export let slidinParams = {
        navFlex:1,
        signalMaxHeight:'36%',
        shelfFlex:1,
        instructionsFlex:3
    }

    const circuitController = new CircuitController(gameParams.grid, onComplete)

    /**
     * Passing an existing editor should induce GameView to "steal" the editor
     * 
     * Since the CircuitEditorComponent's job is to take up whatever space is left on screen after the rest of the UI,
     * It should be sufficient to just not construct the usual editor once one of these is passed and just position the exisitngEditor with some extra code
     * 
     * @type {CircuitEditorComponent | null}
     */
    export let existingEditor = null

    console.log("initializing GameView with params: ",gameParams)
    
    const signalSetView = gameParams.completeCondition ? 
        new CircuitSignalSetView(gameParams.completeCondition) : undefined

    let progressStorage = new ProgressStorage()

    
    /**
     * @type {CompletionPopup}
     */
    let completionPopup

    /**
     * @type {HTMLDivElement}
     */
    let editorContainer
    let editorContainerResizeObserver

    function onComplete() {
        const rewards = gameParams.completeRewards
        progressStorage.addGate(gameParams.name)
        rewards.map(progressStorage.addLevel.bind(progressStorage))
        rewards.map(progressStorage.addGate.bind(progressStorage))
        
        completionPopup.show()
    }

    function placeExistingEditor() {
        if (!existingEditor) return

        existingEditor.pickup()
        editorContainerResizeObserver = new ResizeObserver(moveExistingEditor)
        editorContainerResizeObserver.observe(editorContainer)
        moveExistingEditor()
    }

    function moveExistingEditor() {
        if (!existingEditor) return

        const bbox = editorContainer.getBoundingClientRect()
        existingEditor.move(bbox.left, bbox.top)
        existingEditor.scale(bbox.width, bbox.height)
    }

    /**
     * @param {number | string} flex
     */
    function initialMaxSize(flex) {
        return flex ? 0 : flex
    }

    let maxSizeState = {
        navFlex:initialMaxSize(slidinParams.navFlex),
        shelfFlex:initialMaxSize(slidinParams.shelfFlex),
        instructionsFlex:initialMaxSize(slidinParams.instructionsFlex),
        signalMaxHeight:initialMaxSize(slidinParams.signalMaxHeight)
    }

    function slideIn() {
        maxSizeState.navFlex = slidinParams.navFlex
        maxSizeState.shelfFlex = slidinParams.shelfFlex
        maxSizeState.instructionsFlex = slidinParams.instructionsFlex
        maxSizeState.signalMaxHeight = slidinParams.signalMaxHeight
        maxSizeState = maxSizeState
    }

    onMount(async () => {
        placeExistingEditor()

        await tick()
        
        setTimeout(slideIn, 200)
    })

    

</script>

<div class="base-vertical" data-sveltekit-noscroll>
    <div class="nav {slidinParams ? 'slidein':''}" title="Nav" style="flex:{maxSizeState.navFlex};">
        
    </div>
    <div class="sandbox-horizontal" title="Sandbox">
        <div class="circuit-editor" title="Editor" bind:this={editorContainer}>
            {#if !existingEditor}
                <CircuitEditorComponent 
                    circuitController={circuitController} 
                    gameParams={gameParams} 
                    editorParams={editorParams}
                    rendererParams={rendererParams}
                    shelf={progressStorage.gates()}
                />
            {/if}
        </div>
        <div class="instructions {slidinParams ? 'slidein':''}" title="Instructions" style="flex:{maxSizeState.instructionsFlex};">
            {@html gameParams.directions}
        </div>
    </div>
    {#if signalSetView}
        <div class="signal {slidinParams ? 'slidein':''}" title="Signal Player" style="max-height:{maxSizeState.signalMaxHeight};">
            <SignalViewer circuitController={circuitController} signalSetView={signalSetView} />
        </div>
    {/if}
</div>

<CompletionPopup bind:this={completionPopup} unlocks={gameParams.completeRewards} />

<style>
    
    .base-vertical {
        display:flex;
        flex-direction: column;
        height:100%;
    }

    .base-vertical .nav {
        background-color: var(--secondary-bg-color);
    }

    .base-vertical .sandbox-horizontal {
        flex: 7;
        
        display:flex;
        flex-direction: row;
        height:70%;
    }

    .sandbox-horizontal .circuit-editor {
        flex: 9;

        display: flex;
        flex-direction: column;
    }

    .sandbox-horizontal .instructions {
        background-color: var(--tertiary-bg-color);

        padding: 3%;
        overflow-y: scroll;
    }

    .base-vertical .signal {
        flex:3;

        background-color: var(--secondary-bg-color);
        padding:2%;
        width: 96%;
        padding-bottom: 0%;
    }

    .slidein {
        transition: max-height 3s, max-width 3s, flex 3s;
    }
</style>