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
        circuitController.addGateAtCell(Input(1), 9, 0)
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
            <LevelViewer level={level} circuitController={circuitController}/>
        {/each}

        <InputCheckBox circuitPanel={circuitPanel} gridController={circuitController} from={[0,0]}/>
    </GameViewCircuitPanel>
</div>

<style>
    .level-panel {
        display:flex;
        justify-content: center;
        align-items: center;
    }
</style>
