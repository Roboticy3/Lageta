<script>
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import { onMount, tick } from "svelte";
    import GameViewCircuitPanel from "$lib/components/GameView/CircuitEditor/GameViewCircuitPanel.svelte";
    import LevelViewer from "./LevelViewer.svelte";
    import InputCheckBox from "$lib/components/GameView/CircuitEditor/InputCheckBox.svelte";
    import CircuitDiv from "../GameView/CircuitDiv.svelte";
    import { AdderNoCarry1, BCDDecoder, Input, InputDown, SevenSegmentDecoder, SevenSegmentEncoder, getGateType } from "$lib/dat/GateTypes/GateTypes";
    import { browser } from "$app/environment";
    import CircuitEditorComponent from "../GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { CircuitStorage } from "$lib/storage_types/CircuitStorage";
    import HeavyButton from "../Misc/HeavyButton.svelte";
    import CircuitStickerContainer from "../GameView/CircuitEditor/Sticker/CircuitStickerContainer.svelte";
    import StickerViewer from "../GameView/CircuitEditor/Sticker/StickerViewer.svelte";
    import { CowSticker } from "$lib/dat/Tools/Tools";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { CampaignGrids } from "$lib/dat/Levels/Levels";

    /**
     * @type {Set<number>}
     */
    let interactionMask = new Set()
    let editorParams = {
        canDragGates:false, 
        showShelf:false, 
        slotInFront:false,
        interactionMask:interactionMask,
        inputCheckboxes:false
    }
    const rendererParams = {
        showGates:false, 
        showGrid:false,
        showMask:interactionMask,
        showConnectionLabels:false
    }

    $: progress = browser ? new ProgressStorage() : undefined
    $: levelSet = progress?.levels() || []

    $: hintTokenView = progress?.getHintTokens()

    const nonLevelIds = [0]

    /**
     * @type {GameViewCircuitPanel}
     */
    let circuitPanel

    /**
     * @type {CircuitStorage | undefined}
     */
    let circuitStorage = undefined
    
    onMount(async () => {
        editorEventTarget.addEventListener("setinput", readInputCheckBox) 

        editorEventTarget.addUpdateListener(() => {
            circuitStorage = new CircuitStorage(storageName, circuitController, storageKey)
            circuitStorage?.save()
        })
    })

    export let storageKey = "Stage 1"
    export let storageName = "Stage 1"

    $: if (browser) {
        //load the gate type for the simple input, this allows for the input to be used even though its loaded dynamically
        //if other gates "break" (i.e. appear as buf on this screen), register them here in the same way
        getGateType(Input(1))
        getGateType(AdderNoCarry1)
        getGateType(InputDown)
        getGateType(SevenSegmentEncoder)
        getGateType(SevenSegmentDecoder)
        getGateType(BCDDecoder)

        //then, load the saved circuit for this campaign screen from the given key and name
        circuitStorage = new CircuitStorage(storageKey, undefined, storageName)
        let gridOrError = circuitStorage.loadNew(undefined, false)
        if (typeof gridOrError !== "string") {
            const grid = gridOrError
            circuitController = new CircuitController(grid)
        }
        else {
            const error = gridOrError
            console.log("LevelSetViewer failed to load grid ", storageKey, storageName, " with code ", error, " Resolving to default...")
            const fresh = CampaignGrids.get(storageKey)
            localStorage.setItem(storageKey, fresh === undefined ? "":fresh)
            circuitStorage = new CircuitStorage(storageKey, undefined, storageName)
            gridOrError = circuitStorage.loadNew(undefined, false)
        }

        if (typeof gridOrError !== "string") {
            const grid = gridOrError
            circuitController = new CircuitController(grid)
        }
        else {
            const error = gridOrError
            console.log("LevelSetViewer failed to load DEFAULT grid ", storageKey, storageName, " with code ", error)
        }

        console.log("LevelSetViewer updated circuitController: ", circuitController)
    }

    /**
     * @type {CircuitController | undefined}
     */
    let circuitController
    const editorEventTarget = new GameViewCircuitPanelEventTarget()

    /**
     * editorParams allows for a set of uninteractive gates to be passed. This should be the complement on the set of unlocked levels
     * @param {number} universe
     * @param {Set<number>} lSet
     * @param {Set<number>} iMask
     */
    function updateInteractionMask(universe, lSet, iMask) {
        iMask.clear()
        for (let id = 0; id < universe; id++) {
            if (!lSet.has(id)) iMask.add(id)
        }
    }
    $: {
        const maskNegative = new Set(levelSet.map(p => p.desiredId || -1))
        nonLevelIds.forEach(id => maskNegative.add(id))
        updateInteractionMask(
            circuitController?.getGateIdLength() || -1, 
            maskNegative, 
            interactionMask
        )
        editorParams = editorParams

        circuitController?.giveSimulationMask(interactionMask)
        circuitController?.setInputs([true, true, true])
    }

    /**
     * @type {InputCheckBox}
     */
    let inputCheckBox
    let tutorialHighlightColor = "var(--connection-color-off)"

    function readInputCheckBox() {
        tutorialHighlightColor = inputCheckBox.isChecked() ? "var(--connection-color-on)" : "var(--connection-color-off)"
    }

</script>
{#if circuitController}<div class="level-panel" data-sveltekit-noscroll>
    <CircuitEditorComponent
        editorEventTarget={editorEventTarget}
        signalSetViewEventTarget={null}
        circuitController={circuitController}
        editorParams={editorParams}
        rendererParams={rendererParams}
    >
        {#each levelSet as params}
            {#if params.x !== undefined && params.y !== undefined}
            <LevelViewer 
                params={params} 
                circuitController={circuitController} 
                levelProgress={progress?.getLevelProgress(params.params?.name || "") || {}}
                gPos={[params.x, params.y]}
            />
            {:else}
            <LevelViewer 
                params={params} 
                circuitController={circuitController} 
                levelProgress={progress?.getLevelProgress(params.params?.name || "") || {}}
            />
            {/if}
        {/each}

        <InputCheckBox 
            editorEventTarget={editorEventTarget}
            gridController={circuitController} 
            from={[0,0]}
            bind:this={inputCheckBox}
        />

        <CircuitDiv 
            circuitController={circuitController} 
            position={[0, 0]} 
            size={[2, 0.5]} 
            active={true}
        >
            <HeavyButton 
                style="width:100%;height:100%;" 
                on:click={() => {
                    window.location.pathname = "/"
                }}
            >
                Back
            </HeavyButton>
        </CircuitDiv>

        {#if hintTokenView}
            <CircuitDiv
                circuitController={circuitController} 
                position={[16, 9.5]} 
                size={[4, 0.5]} 
                active={true}
            >
                You have {hintTokenView || "?"} hint tokens.
            </CircuitDiv>
        {/if}
    </CircuitEditorComponent>
</div>{/if}

<style>
    .level-panel {
        width:100%;
        height:100%;
    }
</style>
