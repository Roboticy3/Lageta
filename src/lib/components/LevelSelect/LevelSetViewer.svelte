<script>
    import { GameViewParameters } from "$lib/level_types/GameViewParameters";
    //@ts-ignore
    import { Freeplay, Level, NotLevel, all_levels } from "$lib/level_types/Level";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import { onMount, tick } from "svelte";
    import GameViewCircuitPanel from "../GameView/GameViewCircuitPanel.svelte";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import CircuitDraggable from "../GameView/CircuitDraggable.svelte";
    import LevelViewer from "./LevelViewer.svelte";
    import { Input } from "$lib/circuit_types/Gate";
    import InputCheckBox from "../GameView/InputCheckBox.svelte";
    import CircuitDiv from "../GameView/CircuitDiv.svelte";
    import { goto } from "$app/navigation";
    import { connectionColor } from "../GateSvgs.svelte";

    const gridWidth = 20
    const gridHeight = 10
    const params = new GameViewParameters("LevelSelect", "", {size:[gridWidth, gridHeight]})

    let progress = new ProgressStorage()
    let levelSet = progress.levels()

    /**
     * @type {GameViewCircuitPanel}
     */
    let circuitPanel
    
    onMount(() => {
        circuitController.addGateAtCell(Input(1, {name:"LevelSelectInput1", inputLabels:[""]}), 1, 1)
        resize()
    })

    async function resize() {
        const width = window.innerWidth
        const height = window.innerHeight
        const cellOffset = width / gridWidth
        circuitController.setGridCellOffset(cellOffset)
        circuitPanel.setViewBox(width, height - height * 0.1)

        await tick()
        
        circuitPanel.updateSvg()
    }

    window.addEventListener('resize', resize)

    let circuitController = params.initializeGrid()
    
    let circuitDraggable

    /**
     * @type {InputCheckBox}
     */
    let inputCheckBox
    let tutorialHighlightColor = connectionColor(false)

    function readInputCheckBox() {
        tutorialHighlightColor = connectionColor(inputCheckBox.isChecked())
    }

</script>
<CircuitDraggable 
    bind:this={circuitDraggable}
    circuitController={circuitController}  
/>
<div class="level-panel">
    <GameViewCircuitPanel 
        bind:this={circuitPanel} 
        params={params}
        gridController={circuitController}
        circuitDraggable={circuitDraggable}
        startAutoResize={false}
        canDragGates={false}
        showGates={false}
    >
        {#each levelSet as level}
            <LevelViewer 
                level={level} 
                circuitController={circuitController}
            />
        {/each}

        <InputCheckBox 
            circuitPanel={circuitPanel} 
            gridController={circuitController} 
            from={[0,0]}
            onChangeListener={readInputCheckBox}
            bind:this={inputCheckBox}
        />

        <CircuitDiv 
            circuitController={circuitController} 
            position={[0, 0]} 
            size={[3, 1.5]} 
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
            position={[0, 1.5]}
            size={[4, 4]}
            active={true}
        >
            <p>Click on the <span style="color:{tutorialHighlightColor};">triangular connection point</span> to drag out a wire.</p>
            <p>Then, click on another connection point to connect the wire.</p>
            <p>If power is flowing through the wire, the wire will <span style="color:{connectionColor(true)};">glow</span>.</p>
        </CircuitDiv>
    </GameViewCircuitPanel>
</div>

<style>
    .level-panel {
        display:flex;
        justify-content: center;
        align-items: center;
    }
</style>
