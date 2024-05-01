<script>
    import { GameViewParameters } from "$lib/level_types/GameViewParameters";
    //@ts-ignore
    import { Level, all_levels } from "$lib/level_types/Level";
    import { AndLevel, Freeplay, NotLevel, OrLevel } from "$lib/dat/Levels/Levels";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import { onMount, tick } from "svelte";
    import GameViewCircuitPanel from "../GameView/GameViewCircuitPanel.svelte";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import CircuitDraggable from "../GameView/CircuitDraggable.svelte";
    import LevelViewer from "./LevelViewer.svelte";
    import InputCheckBox from "../GameView/InputCheckBox.svelte";
    import CircuitDiv from "../GameView/CircuitDiv.svelte";
    import { goto } from "$app/navigation";
    import { Input } from "$lib/dat/GateTypes/GateTypes";
    import { browser } from "$app/environment";

    const gridWidth = 20
    const gridHeight = 10
    const params = new GameViewParameters(
        "LevelSelect", "", 
        {size:[gridWidth, gridHeight] }, undefined, [], 
        {showGates:false, showGrid:false, initialScale:[8, 8]})

    let progress = browser ? new ProgressStorage() : undefined
    let levelSet = progress?.levels() || []

    /**
     * @type {GameViewCircuitPanel}
     */
    let circuitPanel
    
    onMount(() => {
        circuitController.addGateAtCell(Input(1, {name:"LevelSelectInput1", inputLabels:[""]}), 1, 1)
        console.log("Mounting level set: ",levelSet)
        if (browser) {
            resize()
            window.addEventListener('resize', resize)
        }
    })

    async function resize() {
        const width = window.innerWidth
        const height = window.innerHeight
        const cellOffset = width / gridWidth
        
    }

    let circuitController = params.initializeGrid()
    
    let circuitDraggable

    /**
     * @type {InputCheckBox}
     */
    let inputCheckBox
    let tutorialHighlightColor = "var(--connection-color-off)"

    function readInputCheckBox() {
        tutorialHighlightColor = inputCheckBox.isChecked() ? "var(--connection-color-on)" : "var(--connection-color-off)"
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
        canDragGates={false}
    >
        {#each levelSet as params}
            <LevelViewer params={params} circuitController={circuitController} />
        {/each}

        <InputCheckBox 
            
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
            <p>If power is flowing through the wire, the wire will <span style="color:var(--connection-color-on);">glow</span>.</p>
        </CircuitDiv>
    </GameViewCircuitPanel>
</div>

<style>

</style>
