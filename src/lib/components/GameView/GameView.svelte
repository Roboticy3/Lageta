<!-- simulator containing all the basic elements needed to build, save, and load logical circuits -->

<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { CircuitSignalSetView } from "$lib/signal_types/SignalSetView";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import SignalShelf from "./Signal/SignalShelf.svelte";
    import CompletionDisplay from "$lib/components/GameView/Dialogs/CompletionDisplay.svelte";
    import CircuitEditorComponent from "./CircuitEditor/CircuitEditorComponent.svelte";
    import { onMount, tick } from "svelte";
    import { CircuitSignalSetViewEventTarget } from "$lib/signal_types/SignalSetViewEvent";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { getGateTypeParams, all_gates, getGateType, Buf } from "$lib/dat/GateTypes/GateTypes";
    import { getLevelParams } from "$lib/dat/Levels/Levels";
    import SignalViewer from "./Signal/SignalViewer.svelte";
    import { filterShelfTreeWithUnlocks, GameViewShelfTree, ShelfTreeNode } from "$lib/dat/Shelf/ShelfTree";
    import TruthTableView from "./TruthTableView.svelte";
    import { TruthTable } from "$lib/circuit_types/TruthTable";
    import { getToolParams } from "$lib/dat/Tools/Tools";
    import GameViewDialog from "$lib/components/GameView/Dialogs/GameViewDialog.svelte";
    import { SFXPlayer } from "$lib/misc_types/SFXPlayer";
    import { browser } from "$app/environment";
    import { CircuitStorage } from "$lib/storage_types/CircuitStorage";
    import { GateGrid } from "$lib/circuit_types/GateGrid";
    import { StickerStorage } from "$lib/storage_types/StickerStorage";
    import { StickerController } from "$lib/circuit_types/sticker/StickerController"
    import { gridSourceToGrid, parseDirections } from "$lib/level_types/GameViewParameters";
    import HeavyButton from "../Misc/HeavyButton.svelte";
    import { GateTypeController } from "$lib/circuit_types/GateType";

    if (!browser) throw Error("GameView requires 'browser' to be the active environment")

    /**
     * @type {import("$lib/level_types/GameViewParameters").GameViewParameters}
     */
    export let gameParams
    $: gateRewards = gameParams.completeRewards?.filter((v) => getGateTypeParams(v) !== undefined)
    $: levelRewards = gameParams.completeRewards?.filter((v) => getLevelParams(v) !== undefined)
    $: toolRewards = gameParams.completeRewards?.filter((v) => getToolParams(v) !== undefined)
    $: solver = getSolver(gameParams)
    /**
     * @param {import("$lib/level_types/GameViewParameters").GameViewParameters} params
     */
    function getSolver(params) {
        if (typeof params.solverOverride === "string") {
            return getGateType(getGateTypeParams(params.solverOverride) || Buf)
        } else if (params.solverOverride instanceof GateTypeController) {
            return params.solverOverride
        } else {
            return params.completeCondition?.solver
        }
    }

    $: hintActive = levelProgress?.hintUsed
    /**
     * Keep a copy of the player's current number of hint tokens
     */
    $: hintTokenView = progressStorage?.getHintTokens()
    function onUseHintToken() {
        if (progressStorage === undefined || hintActive) return
        hintActive = progressStorage.useHint(gameParams.name || "?")
        hintTokenView = progressStorage.getHintTokens()
    }

    $: hintTokenReward = !levelProgress?.complete && (!levelRewards || levelRewards.length === 0)

    $: truthTableProgress = progressStorage?.getTool("TruthTable")

    /**
     * @type {any}
     */
    export let editorParams = gameParams.editorParams || {}
    /**
     * @type {any}
     */
    export let rendererParams = gameParams.rendererParams || {}

    const slidinParams = {
        navFlex:1,
        shelfMaxHeight:'15%',
        signalMaxHeight:'36%',
        instructionsFlex:3
    }

    function getName() {
        return gameParams.name || "?"
    }

    function loadGrid() {
        
        const gridResult = circuitStorage?.loadNew()

        if (gridResult instanceof GateGrid) {
            return gridResult
        }
        return gridSourceToGrid(gameParams.grid)
    }

    function loadStickers() {
        const stickers = new StickerStorage(getName()).load()
        if (typeof stickers === "string") {
            return new StickerController()
        }
        else {
            return new StickerController(stickers)
        }
    }

    /**
     * Debugging tool, mainly for catching stuff that happens to circuitController outside of the main stack
     * @param {any} target
     * @param {((arg0: string | symbol) => any)} exclude
     */
    function bingo(target, exclude) {
    return new Proxy(target, {
        get(obj, prop) {
            const originalValue = obj[prop];
            if (typeof originalValue === "function" && !exclude(prop)) {
                // If the property is a method, wrap it
                return (/** @type {any} */ ...args) => {
                    console.log(`Method called: ${String(prop)} with arguments:`, args);
                    const result = originalValue.apply(obj, args);
                    console.log(`Method result: ${String(prop)} returned:`, result);
                    console.log(`proxy debugging step ${String(prop)}`, 
                        JSON.parse(
                            JSON.stringify(target?.gateGrid?.graph?.inputs)
                        ), JSON.parse(
                            JSON.stringify(target?.gateGrid?.graph?.outputs)
                        )
                    )
                    return result;
                };
            }
            return originalValue; // For non-method properties, return as-is
        }
    });
    }
    
    /**
     * @type {CircuitController | undefined}
     */
    export let circuitController = undefined
    $: if (circuitStorage) {
        console.log("reading progress: creating circuit controller")
        circuitController = new CircuitController(loadGrid(), gameParams.completeCondition ? onComplete:undefined, gameParams.completeCondition?.solver)
    }
    $: console.log("circuit controller ", circuitController, gridSourceToGrid(gameParams.grid))

    /**
     * @type {StickerController}
     */
    export let stickerController = loadStickers()

    /**
     * Passing an existing editor should induce GameView to "steal" the editor
     * 
     * Since the CircuitEditorComponent's job is to take up whatever space is left on screen after the rest of the UI,
     * It should be sufficient to just not construct the usual editor once one of these is passed and just position the exisitngEditor with some extra code
     * 
     * @type {CircuitEditorComponent | null}
     */
    export let existingEditor = null
    
    const signalSetView = gameParams.completeCondition ? 
        new CircuitSignalSetView(gameParams.completeCondition) : undefined

    /**
     * @type {ProgressStorage | undefined}
     */
    let progressStorage =  undefined
    $: progressStorage?.removeNewLevel(getName())
    $: levelProgress = progressStorage?.getLevelProgress(gameParams.name || "?")

    /**
     * @type {CircuitStorage | undefined}
     */
    let circuitStorage = undefined

    console.log("initializing GameView with params: ",gameParams, progressStorage, levelProgress)
    /**
     * @type {ShelfTreeNode | undefined}
     */
    export let shelf = undefined
    $: if (progressStorage) {
        updateShelf()
    }


    function readProgress() {
        console.log("reading progress...")

        progressStorage = new ProgressStorage()
        circuitStorage = new CircuitStorage(getName(), undefined, gameParams.storageKey)

        console.log("gameview loaded shelf ", shelf, " and unmarked ", getName(), " as new!")
    }

    function updateShelf() {
        //if a shelf has been provided, don't construct a new one
        if (!shelf && progressStorage) {
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
        }
    }

    /**
     * @param {ShelfTreeNode} shelf
     */
    function appendStickersToShelf(shelf) {
        const stickers = progressStorage?.getTool("Stickers")?.data?.stickers
        
        if (stickers && stickers.length > 0) {
            shelf.children.push(new ShelfTreeNode("Stickers", (
                stickers instanceof Array ? stickers : []
            ).map((/** @type {{ name: string; }} */ s) => s.name)))
        }
    }

    /**
     * check if the circuit should be saved. ignored if gameParams.serializable is set to false
     */
    let shouldSave = false
    function checkSave() {
        if (browser && gameParams.serializable !== false) {
            console.log("checking if the circuit should save...")
            if (shouldSave) {
                console.log("saving!")
                //save the current level, including all gates and stickers
                circuitStorage?.save()

                const stickerStorage = new StickerStorage(getName(), stickerController)
                stickerStorage.save()

                shouldSave = false
            }
        }
    }

    

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
    */
    export let editorEventTarget = null
    $: {console.log("editor event target: ", editorEventTarget)}
    $: editorEventTarget?.addUpdateListener(async () => {
        console.log("setting shouldSave to true. stickerController: ", stickerController)
        shouldSave = true
        
        await tick() //evil mode
    })

    /**
     * @type {CircuitSignalSetViewEventTarget | null}
     */
    export let signalSetViewEventTarget = null
    $: {console.log("signal set view event target: ", signalSetViewEventTarget)}
    $: signalSetViewEventTarget?.addEventListener("play",checkSave)

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
        if (progressStorage) {
            if (getName() === progressStorage.getCurrentTutorial()) {
                progressStorage.passTutorial()
            }

            levelRewards?.forEach(progressStorage.addLevel.bind(progressStorage))
            gateRewards?.forEach(progressStorage.addGate.bind(progressStorage))
            toolRewards?.forEach(progressStorage.addTool.bind(progressStorage))

            progressStorage.completeLevel(getName())

            if (hintTokenReward) {
                progressStorage.addHintTokens()
            }
        }
        

        completionPopup.show()

        if (toolRewards && toolRewards.length > 0) {
            SFXPlayer.play("outro2.wav")
        }
        else {
            SFXPlayer.play("outro1.wav")
        }    

       
    }

    function placeExistingEditor() {
        if (!existingEditor || !circuitController) return

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

{#if circuitController} <div class="base-vertical" data-sveltekit-noscroll>
    <div class="sandbox-horizontal">
        <div class="circuit-editor"bind:this={editorContainer}>
            {#if !existingEditor}
                <CircuitEditorComponent 
                    circuitController={circuitController} 
                    stickerController={stickerController}
                    editorParams={editorParams}
                    rendererParams={rendererParams}
                    maxSizeState={maxSizeState}
                    bind:editorEventTarget={editorEventTarget}
                    bind:signalSetViewEventTarget={signalSetViewEventTarget}
                    shelf={gameParams.allUnlocks ? filterShelfTreeWithUnlocks(all_gates.keys(), GameViewShelfTree):shelf}
                    progress={progressStorage}
                />
            {/if}
        </div>
        <div class="instructions {slidinParams ? 'slidein':''}" style="flex:{maxSizeState.instructionsFlex};">
            {@html parseDirections(gameParams.directions)}
            {#if truthTableProgress && 
                solver?.variant === "Gate" &&
                solver.view.sizeIn < 6
            }
                <TruthTableView 
                    truthTable={(new TruthTable(solver))}
                    customLabels={
                        rendererParams.useSolverForTruthTableLabels ? 
                            solver.view.inputLabels.concat(solver.view.outputLabels)
                            :
                            circuitController.getInputLabels().concat(circuitController.getOutputLabels())
                    }
                    truthTableData={truthTableProgress.data}

                />
            {/if}
            {#if  gameParams.hint && !levelProgress?.complete && !hintActive && hintTokenView !== undefined}
                <div style="height:1em;"></div>
                This level has a hint! 
                <HeavyButton on:click={onUseHintToken} unavailable={(progressStorage?.getHintTokens() || -1) < 1}>Use Hint Token?</HeavyButton>
                You have {hintTokenView} hint tokens.
            {/if}
            {#if hintActive}
                <b>You've used a hint:</b>
                {#each parseDirections(gameParams.hint) || ["?"] as p}
                    {#if typeof p === "string"}
                        <div class="flash">
                            {@html p}
                        </div>
                    {:else if p.truthTable}
                        <div class="flash">
                            <TruthTableView truthTable={p.truthTable} truthTableData={truthTableProgress?.data || {}}/>
                        </div>
                    {/if}
                {/each}
            {/if}
        </div>
    </div>
    {#if signalSetView}
        <div class="signal {slidinParams ? 'slidein':''}" style="max-height:{maxSizeState.signalMaxHeight};">
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
</div> {/if}

<GameViewDialog bind:this={completionPopup}>
    <CompletionDisplay 
        newGates={gateRewards} 
        newLevels={levelRewards} 
        newTools={toolRewards} 
        hintToken={hintTokenReward}
        alreadyCompleted={levelProgress?.complete}
        on:close={() => {completionPopup.close()}}
    />
</GameViewDialog>

<style>
    
    .base-vertical {
        display:flex;
        flex-direction: column;
        height:100%;

        box-sizing: border-box;
    }

    .base-vertical .sandbox-horizontal {
        flex: 7;
        
        display:flex;
        flex-direction: row;
        height:70%;

        box-sizing: border-box;
    }

    .sandbox-horizontal .circuit-editor {
        flex: 9;

        display: flex;
        flex-direction: column;
    }

    .sandbox-horizontal .instructions {
        background-color: var(--tertiary-bg-color);

        box-sizing: border-box;

        padding: 3%;
        overflow-y: scroll;
    }

    .base-vertical .signal {
        flex:3;
    }

    .slidein {
        transition: max-height calc(var(--animation-speed) * 4), max-width calc(var(--animation-speed) * 4), flex calc(var(--animation-speed) * 4);
    }
</style>