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
    import { Input, getGateType } from "$lib/dat/GateTypes/GateTypes";
    import { browser } from "$app/environment";
    import CircuitEditorComponent from "../GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { CircuitStorage } from "$lib/storage_types/CircuitStorage";

    const gridWidth = 22
    const gridHeight = 10
    const gameParams = new GameViewParameters(
        "LevelSelect", "", 
        {
            size:[gridWidth, gridHeight],
            gateTypes:[getGateType(Input(1, {name:"LevelSelectInput1", inputLabels:[""]}))],
            gates:[
                {type:"LevelSelectInput1",x:0,y:1,id:0,state:{override:[true]}}
            ]
        }, 
        undefined, []
    )
    const editorParams = {canDragGates:false}
    const rendererParams = {showIds:true}

    let progress = browser ? new ProgressStorage() : undefined
    let levelSet = progress?.levels() || []

    /**
     * @type {GameViewCircuitPanel}
     */
    let circuitPanel

    const connections = [
        {from:0, output:0, to:2, input:1},
        {from:3, output:0, to:4, input:0},
        {from:5, output:2, to:6, input:3},
        {from:1, output:0, to:7, input:1},
        {from:2, output:0, to:7, input:3},
    ]
    
    onMount(async () => {
        editorEventTarget.addEventListener("setinput", readInputCheckBox)
        editorEventTarget.addEventListener("addwire", save)
        editorEventTarget.addEventListener("removewire", save)

        await tick()

        connections.forEach(({from, output, to, input}) => circuitController.addConnection(from, output, to, input))
    })

    const circuitController = gameParams.initializeGrid()
    const editorEventTarget = new GameViewCircuitPanelEventTarget()

    $: {
        if (browser) {
            const circuitStorage = new CircuitStorage(circuitController, "Campaign")
            const result = circuitStorage.load()
            console.log("loaded saved campaign screen with result ", result)
        }
    }

    function save() {
        if (browser) {
            const circuitStorage = new CircuitStorage(circuitController, "Campaign")
            circuitStorage.save()
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
