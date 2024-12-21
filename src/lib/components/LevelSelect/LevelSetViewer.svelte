<script>
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import { onMount, tick } from "svelte";
    import GameViewCircuitPanel from "$lib/components/GameView/CircuitEditor/GameViewCircuitPanel.svelte";
    import LevelViewer from "./LevelViewer.svelte";
    import InputCheckBox from "$lib/components/GameView/CircuitEditor/InputCheckBox.svelte";
    import CircuitDiv from "../GameView/CircuitDiv.svelte";
    import { Input, getGateType } from "$lib/dat/GateTypes/GateTypes";
    import { browser } from "$app/environment";
    import CircuitEditorComponent from "../GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { CircuitStorage } from "$lib/storage_types/CircuitStorage";
    import { Level } from "$lib/level_types/Level";
    import HeavyButton from "../Misc/HeavyButton.svelte";
    import CircuitStickerContainer from "../GameView/CircuitEditor/Sticker/CircuitStickerContainer.svelte";
    import StickerViewer from "../GameView/CircuitEditor/Sticker/StickerViewer.svelte";
    import { CowSticker } from "$lib/dat/Tools/Tools";
    import { CircuitController } from "$lib/circuit_types/CircuitController";

    const gridWidth = 24
    const gridHeight = 12
    /**
     * @type {import("$lib/level_types/GameViewParameters").GameViewParameters}
     */
    const gameParams = {
        name:"LevelSelect", directions:"", 
        grid: {
            size:[gridWidth, gridHeight],
            
        }, 
        completeCondition:undefined, 
        completeRewards:[]
    }
    const editorParams = {canDragGates:false, showShelf:false}
    const rendererParams = {drawGates:true}

    $: progress = browser ? new ProgressStorage() : undefined
    $: levelSet = progress?.levels() || []
    $: newLevelSet = new Set((progress?.getNewLevels()))

    /**
     * @type {GameViewCircuitPanel}
     */
    let circuitPanel
    
    onMount(async () => {
        editorEventTarget.addEventListener("setinput", readInputCheckBox)
        editorEventTarget.addUpdateListener(save)
    })

    $: if (browser) {
        const circuitStorage = new CircuitStorage("Stage 1", undefined, "Stage 1")
        const grid = circuitStorage.loadNew()
        if (typeof grid !== "string") circuitController = new CircuitController(grid)
    }

    /**
     * @type {CircuitController | undefined}
     */
    let circuitController
    const editorEventTarget = new GameViewCircuitPanelEventTarget()

    let loaded = false

    function save() {
        if (browser) {
            const circuitStorage = new CircuitStorage("Campaign", circuitController)
            circuitStorage.save("Campaign", false)
        }
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
        gameParams={gameParams}
        circuitController={circuitController}
        editorParams={editorParams}
        rendererParams={rendererParams}
    >
        {#each levelSet as params}
            <LevelViewer 
                params={params} 
                circuitController={circuitController} 
                levelProgress={progress?.getLevelProgress(params.params?.name || "") || {}}
            />
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
    </CircuitEditorComponent>
</div>{/if}

<style>
    .level-panel {
        width:100%;
        height:100%;
    }
</style>
