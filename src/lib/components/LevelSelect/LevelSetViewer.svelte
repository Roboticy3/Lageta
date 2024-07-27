<script>
    import { GameViewParameters } from "$lib/level_types/GameViewParameters";
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

    const gridWidth = 24
    const gridHeight = 12
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
    const editorParams = {canDragGates:false, showShelf:false}
    const rendererParams = {showGates:false}

    $: progress = browser ? new ProgressStorage() : undefined
    $: levelSet = progress?.levels() || []
    $: newLevelSet = new Set((progress?.getNewLevels()))

    /**
     * @type {GameViewCircuitPanel}
     */
    let circuitPanel

    const connections = [
        {from:0, output:0, to:1, input:0}, //fill 1 input of Some Kind of Combo, let the user make the other
        {from:0, output:0, to:2, input:0}, //enable join by powering 1 input
        {from:0, output:0, to:3, input:1}, //Join powers Joinyer
        {from:3, output:0, to:1, input:1}, //Joinyer helps out with Some Kind of Combo
        {from:1, output:0, to:4, input:0},
        {from:2, output:0, to:4, input:1}, //fill 2 inputs of bigger combo, leave the other for the user
        {from:5, output:0, to:6, input:0}, //No Combo powers itself, use to power Exclusion
        {from:6, output:0, to:9, input:1}, //power the first adder level
        {from:10, output:1, to:8, input:3}, //power encoder from second adder
        {from:8, output:1, to:7, input:1}, //power decoder from encoder
        {from:9, output:0, to:10, input:0}, //power the second adder level
        {from:9, output:0, to:10, input:1},
        {from:10, output:1, to:11, input:2}, //partially power the full adder level
        {from:9, output:0, to:11, input:1},
        {from:7, output:2, to:11, input:0}, //fully power the full adder level from decoder
        {from:13, output:0, to:14, input:1}, //power the first random level
        {from:12, output:0, to:14, input:0},
        {from:11, output:0, to:15, input:6}, //power the four bit adder to sum to 8
        {from:7, output:2, to:15, input:2},
        {from:15, output:3, to:17, input:3}, //take the 8 from four bit adder and plug it into seven segment
    ]
    
    onMount(async () => {
        editorEventTarget.addEventListener("setinput", readInputCheckBox)
        editorEventTarget.addEventListener("addwire", save)
        editorEventTarget.addEventListener("removewire", save)

        await tick()
        
        connections.forEach(({from, output, to, input}) => circuitController.addConnection(from, output, to, input))
        if (browser) {
            const circuitStorage = new CircuitStorage(circuitController, "Campaign")
            const result = circuitStorage.load(undefined, 0, 0, true)
            console.log("loaded saved campaign screen with result ", result)
            if (result === "Ok") loaded = true
        }

        console.log("mounted level viewer with grid: ", circuitController.gateGrid)
        console.log("new levels! ", newLevelSet)
    })

    const circuitController = gameParams.initializeGrid()
    const editorEventTarget = new GameViewCircuitPanelEventTarget()

    let loaded = false

    function save() {
        if (browser) {
            const circuitStorage = new CircuitStorage(circuitController, "Campaign")
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
<div class="level-panel" data-sveltekit-noscroll>
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

        <CircuitStickerContainer
            position={[10, 10]}
            size={[1, 1]}
            circuitController={circuitController}
        >
            <StickerViewer sticker={CowSticker}/>
        </CircuitStickerContainer>
    </CircuitEditorComponent>
</div>

<style>
    .level-panel {
        width:100%;
        height:100%;
    }
</style>
