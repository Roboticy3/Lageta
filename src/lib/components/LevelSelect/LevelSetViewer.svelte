<script>
    import { GameViewParameters } from "$lib/level_types/GameViewParameters";
    //@ts-ignore
    import { Level, all_levels } from "$lib/level_types/Level";
    import { AndLevel, Freeplay, NotLevel, OrLevel } from "$lib/dat/Levels/Levels";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import { onMount, tick } from "svelte";
    import GameViewCircuitPanel from "$lib/components/GameView/CircuitEditor/GameViewCircuitPanel.svelte";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import CircuitDraggable from "$lib/components/GameView/CircuitEditor/CircuitDraggable.svelte";
    import LevelViewer from "./LevelViewer.svelte";
    import InputCheckBox from "$lib/components/GameView/CircuitEditor/InputCheckBox.svelte";
    import CircuitDiv from "../GameView/CircuitDiv.svelte";
    import { goto } from "$app/navigation";
    import { Input } from "$lib/dat/GateTypes/GateTypes";
    import { browser } from "$app/environment";
    import CircuitEditorComponent from "../GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";

    const gridWidth = 15
    const gridHeight = 10
    const gameParams = new GameViewParameters(
        "LevelSelect", "", 
        {size:[gridWidth, gridHeight] }, undefined, [])
    const editorParams = {showGates:false, showGrid:false, initialScale:[8, 8]}

    let progress = browser ? new ProgressStorage() : undefined
    let levelSet = progress?.levels() || []

    /**
     * @type {GameViewCircuitPanel}
     */
    let circuitPanel
    
    onMount(() => {
        circuitController.addGateAtCell(Input(1, {name:"LevelSelectInput1", inputLabels:[""]}), 1, 1)
        circuitEventTarget.addEventListener("setinput", readInputCheckBox)
    })

    const circuitController = gameParams.initializeGrid()
    const circuitEventTarget = new GameViewCircuitPanelEventTarget()

    /**
     * @type {InputCheckBox}
     */
    let inputCheckBox
    let tutorialHighlightColor = "var(--connection-color-off)"

    function readInputCheckBox() {
        tutorialHighlightColor = inputCheckBox.isChecked() ? "var(--connection-color-on)" : "var(--connection-color-off)"
    }

</script>
<div class="level-panel" data-sveltekit-noscroll>
    <CircuitEditorComponent
        gameParams={gameParams}
        circuitController={circuitController}
        editorParams={editorParams}
    >
        {#each levelSet as params}
            <LevelViewer params={params} circuitController={circuitController} />
        {/each}

        <InputCheckBox 
            circuitEventTarget={circuitEventTarget}
            gridController={circuitController} 
            from={[0,0]}
            bind:this={inputCheckBox}
        />

        <CircuitDiv 
            circuitController={circuitController} 
            position={[0.5, 0.5]} 
            size={[2, 0.5]} 
            active={true}
        >
            <button 
                style="width:100%;height:100%;" 
                on:click={() => {
                    history.back()
                }}
            >
                Back
            </button>
        </CircuitDiv>

        <CircuitDiv
            circuitController={circuitController}
            position={[0.5, 2]}
            size={[3, 3]}
            active={true}
        >
            <p>Click on the <span style="color:{tutorialHighlightColor};">triangular connection point</span> to drag out a wire.</p>
            <p>Then, click on another connection point to connect the wire.</p>
            <p>If power is flowing through the wire, the wire will <span style="color:var(--connection-color-on);">glow</span>.</p>
        </CircuitDiv>
    </CircuitEditorComponent>
</div>

<style>
    .level-panel {
        width:100%;
        height:100%;
    }
</style>
