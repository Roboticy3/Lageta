<!-- simulator containing all the basic elements needed to build, save, and load logical circuits -->

<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { CircuitSignalSetView, SignalSetView } from "$lib/signal_types/SignalSetView";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import SignalShelf from "./Signal/SignalShelf.svelte";
    import CompletionDisplay from "$lib/components/GameView/Dialogs/CompletionDisplay.svelte";
    import CircuitEditorComponent from "./CircuitEditor/CircuitEditorComponent.svelte";
    import { onMount, tick } from "svelte";
    import { CircuitSignalSetViewEventTarget, SignalSetViewEventTarget } from "$lib/signal_types/SignalSetViewEvent";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { getGateTypeNoRegister, FullAdder, getGateType, getGateTypeParams } from "$lib/dat/GateTypes/GateTypes";
    import { getLevelParams } from "$lib/dat/Levels/Levels";
    import SignalViewer from "./Signal/SignalViewer.svelte";
    import { filterShelfTreeWithUnlocks, GameViewShelfTree, ShelfTreeNode } from "$lib/dat/Shelf/ShelfTree";
    import TruthTableView from "./TruthTableView.svelte";
    import { TruthTable } from "$lib/circuit_types/TruthTable";
    import { getToolParams, Sticker } from "$lib/dat/Tools/Tools";
    import GameViewDialog from "$lib/components/GameView/Dialogs/GameViewDialog.svelte";
    import { SFXPlayer } from "$lib/misc_types/SFXPlayer";
    import { browser } from "$app/environment";


    /**
     * @type {import("$lib/level_types/GameViewParameters").GameViewParameters}
     */
    export let gameParams
    $: gateRewards = gameParams.completeRewards.filter(v => getGateTypeParams(v) !== undefined)
    $: levelRewards = gameParams.completeRewards.filter(v => getLevelParams(v) !== undefined)
    $: toolRewards = gameParams.completeRewards.filter(v => getToolParams(v) !== undefined)
    $: solver = gameParams.completeCondition?.solver
    console.log("set to unlock", gateRewards, levelRewards, JSON.stringify(toolRewards))

    /**
     * @type {any}
     */
    export let editorParams = gameParams.editorParams
    /**
     * @type {any}
     */
    export let rendererParams = gameParams.rendererParams

    const slidinParams = {
        navFlex:1,
        shelfMaxHeight:'15%',
        signalMaxHeight:'36%',
        instructionsFlex:3
    }

    export let circuitController = new CircuitController(gameParams.grid, onComplete, gameParams.completeCondition?.solver)

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
    export let shelf = new ShelfTreeNode("None", [])
    
    function readProgress() {
        console.log("reading progress...")

        //if there are fewer than 7 gates, don't run to algorithm that splits things into folders
        if (progressStorage.gateNames().length < 7) {
            let newShelf = new ShelfTreeNode(
                "Shelf", progressStorage.gateNames()
            )

            //add stickers into their own folder
            appendStickersToShelf(newShelf)

            shelf = newShelf
        }
        //otherwise, do, packing as many gates as possible into easily legible folders
        else {
            const unlocks = progressStorage.gateNames()
            //pack the tree into folders
            let newShelf = filterShelfTreeWithUnlocks(
                unlocks, GameViewShelfTree
            )
            //add stickers into their own folder
            appendStickersToShelf(newShelf)
            
            //update the shelf
            shelf = newShelf
        }

        //remove the current level as a "new" level, so it doesn't direct the player's attention anymore on the level select screen
        progressStorage.removeNewLevel(gameParams.name)

        console.log("gameview loaded shelf ", shelf, " and unmarked ", gameParams.name, " as new!")

        //check if the level has existing progress
    }

    /**
     * GameView checks shouldSave every 10 seconds. If true, the circuit is saved under the current level name, then shouldSave is set to false
     */
    let shouldSave = false
    export let saveDisabled = false
    $: {
        if (browser && !saveDisabled) setInterval(() => {
            console.log("checking if the level should be saved here...")
            if (shouldSave) {
                //save the current level, including all gates and stickers

                console.log("im gonna save the level now !")

                shouldSave = false
            }
        }, 20000)
    }
    $: editorEventTarget?.addUpdateListener(() => {
        shouldSave = true
    })

    /**
     * @param {ShelfTreeNode} shelf
     */
    function appendStickersToShelf(shelf) {
        const stickers = progressStorage.getTool("Stickers")?.data?.stickers
        
        if (stickers && stickers.length > 0) {
            shelf.children.push(new ShelfTreeNode("Stickers", (
                stickers instanceof Array ? stickers : []
            ).map((/** @type {{ name: string; }} */ s) => s.name)))
        }
    }

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
    */
    export let editorEventTarget = null
    $: {console.log("editor event target: ", editorEventTarget)}

    /**
     * @type {CircuitSignalSetViewEventTarget | null}
     */
    export let signalSetViewEventTarget = null
    $: {console.log("signal set view event target: ", signalSetViewEventTarget)}

    export function isCircuitValid() {
        return signalSetView?.isCircuitValid()
    }

    
    /**
     * @type {GameViewDialog}
     */
    let completionPopup

    /**
     * @type {HTMLDivElement}
     */
    let editorContainer
    let editorContainerResizeObserver

    function onComplete() {
        if (gameParams.name === progressStorage.getCurrentTutorial()) {
            progressStorage.passTutorial()
        }

        levelRewards.map(progressStorage.addLevel.bind(progressStorage))
        gateRewards.map(progressStorage.addGate.bind(progressStorage))
        toolRewards.map(progressStorage.addTool.bind(progressStorage))

        progressStorage.completeLevel(gameParams.name)

        completionPopup.show()

        if (toolRewards.length > 0) {
            SFXPlayer.play("outro2.wav")
        }
        else {
            SFXPlayer.play("outro1.wav")
        }
        
    }

    function placeExistingEditor() {
        if (!existingEditor) return

        existingEditor.pickup()
        circuitController.onComplete = onComplete
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

    export let maxSizeState = {
        navFlex:initialMaxSize(slidinParams.navFlex),
        shelfMaxHeight:initialMaxSize(slidinParams.shelfMaxHeight),
        instructionsFlex:initialMaxSize(slidinParams.instructionsFlex),
        signalMaxHeight:initialMaxSize(slidinParams.signalMaxHeight)
    }

    function slideIn() {
        maxSizeState.navFlex = slidinParams.navFlex
        maxSizeState.shelfMaxHeight = slidinParams.shelfMaxHeight
        maxSizeState.instructionsFlex = slidinParams.instructionsFlex
        maxSizeState.signalMaxHeight = slidinParams.signalMaxHeight
        maxSizeState = maxSizeState
        console.log("size state", JSON.stringify(maxSizeState))
    }

    onMount(async () => {
        console.log("size state", JSON.stringify(maxSizeState))
        placeExistingEditor()

        console.log("set to unlock ", gateRewards, levelRewards, toolRewards)

        await tick()

        //load the outro sfx
        SFXPlayer.loadAudio(["outro1.wav", "outro2.wav"])

        //wait a bit before starting the slide in bc that makes it look nicer
        setTimeout(slideIn, 200)

        readProgress()
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
                    maxSizeState={maxSizeState}
                    bind:editorEventTarget={editorEventTarget}
                    bind:signalSetViewEventTarget={signalSetViewEventTarget}
                    shelf={gameParams.allUnlocks ? GameViewShelfTree:shelf}
                    progress={progressStorage}
                />
            {/if}
        </div>
        <div class="instructions {slidinParams ? 'slidein':''}" title="Instructions" style="flex:{maxSizeState.instructionsFlex};">
            {@html gameParams.directions}
            {#if progressStorage?.findTool("TruthTable") !== -1 && 
                solver?.variant === "Gate" &&
                solver.view.sizeIn < 5
            }
                <TruthTableView 
                    truthTable={(new TruthTable(solver))}
                    customLabels={
                        rendererParams.useSolverForTruthTableLabels ? 
                            solver.view.inputLabels.concat(solver.view.outputLabels)
                            :
                            circuitController.getInputLabels().concat(circuitController.getOutputLabels())
                    }
                />
            {/if}
        </div>
    </div>
    {#if signalSetView}
        <div class="signal {slidinParams ? 'slidein':''}" title="Signal Player" style="max-height:{maxSizeState.signalMaxHeight};">
            <SignalShelf 
                circuitController={circuitController} 
                signalSetView={signalSetView} 
                editorParams={editorParams}
                bind:signalSetViewEventTarget={signalSetViewEventTarget}
            >
                <g fill="none">
                    <SignalViewer 
                        signalSetView={signalSetView}
                        channels={new Array(signalSetView.getInputSize()).fill("").map((_v, i) => {return {idx:i, type:"Given"}})}
                    />
                </g>
                <g fill="none" transform="translate(0, {signalSetView.getDesiredChannelHeight(signalSetView.getInputSize())})">
                    <SignalViewer 
                        signalSetView={signalSetView}
                        channels={new Array(signalSetView.channelCount() - signalSetView.getInputSize()).fill("").map((_v, i) => {return {idx:signalSetView.getInputSize() + i, type:"Expected"}})}
                    />
                </g>
                <g fill="none" transform="translate(0, {signalSetView.getDesiredChannelHeight(signalSetView.getInputSize())})">
                    <SignalViewer 
                        bind:eventTarget={signalSetViewEventTarget}
                        signalSetView={signalSetView}
                        circuitController={circuitController}
                        liveOnly={true}
                        channels={new Array(signalSetView.channelCount() - signalSetView.getInputSize()).fill("").map((_v, i) => {return {idx:i, type:"Live"}})}
                    />
                </g>
            </SignalShelf>
        </div>
    {/if}
    <slot />
</div>

<GameViewDialog bind:this={completionPopup}>
    <CompletionDisplay newGates={gateRewards} newLevels={levelRewards} newTools={toolRewards}/>
</GameViewDialog>

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
    }

    .slidein {
        transition: max-height calc(var(--animation-speed) * 4), max-width calc(var(--animation-speed) * 4), flex calc(var(--animation-speed) * 4);
    }
</style>