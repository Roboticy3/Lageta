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
    import { Input, getGateType } from "$lib/dat/GateTypes/GateTypes";
    import { browser } from "$app/environment";
    import CircuitEditorComponent from "../GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { Connection } from "$lib/circuit_types/GateGraph";

    const gridWidth = 20
    const gridHeight = 10
    const gameParams = new GameViewParameters(
        "LevelSelect", "", 
        {
            connections:[
                new Connection(0, 0, 3, 1)
            ],
            size:[gridWidth, gridHeight],
            gateTypes:[getGateType(Input(1, {name:"LevelSelectInput1", inputLabels:[""]}))],
            gates:[
                {type:"LevelSelectInput1",x:1,y:1,id:0,state:{override:[true]}}
            ]
        }, 
        undefined, []
    )
    const editorParams = {showGates:false, showGrid:false, initialScale:[8, 8]}
    const rendererParams = {showIds:true}

    let progress = browser ? new ProgressStorage() : undefined
    let levelSet = progress?.levels() || []

    /**
     * @type {GameViewCircuitPanel}
     */
    let circuitPanel
    
    onMount(async () => {
        editorEventTarget.addEventListener("setinput", readInputCheckBox)
    })

    const circuitController = gameParams.initializeGrid()
    const editorEventTarget = new GameViewCircuitPanelEventTarget()

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
        editorEventTarget={editorEventTarget}
        gameParams={gameParams}
        circuitController={circuitController}
        editorParams={editorParams}
        rendererParams={rendererParams}
    >
        {#each levelSet as params}
            <LevelViewer params={params} circuitController={circuitController} />
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
            <button 
                style="width:100%;height:100%;" 
                on:click={() => {
                    window.location.pathname = "/"
                }}
            >
                Back
            </button>
        </CircuitDiv>
    </CircuitEditorComponent>
</div>

<style>
    .level-panel {
        width:100%;
        height:100%;
    }
</style>
