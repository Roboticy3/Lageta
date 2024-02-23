<script>
    import { GameViewParameters } from "$lib/level_types/GameViewParameters";
    //@ts-ignore
    import { Freeplay, Level, W1S1, all_levels } from "$lib/level_types/Level";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import { onMount } from "svelte";
    import GameViewCircuitPanel from "../GameView/GameViewCircuitPanel.svelte";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import CircuitDraggable from "../GameView/CircuitDraggable.svelte";
    import LevelViewer from "./LevelViewer.svelte";

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

        resize()
    })

    function resize() {
        const width = window.innerWidth
        const height = window.innerHeight
        const cellOffset = width / gridWidth
        circuitController.setGridCellOffset(cellOffset)
        circuitPanel.setViewBox(width, height - height * 0.1)
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
    >
        {#each levelSet as level}
            <LevelViewer level={level} circuitController={circuitController}/>
        {/each}
    </GameViewCircuitPanel>
</div>

<style>
    .level-panel {
        display:flex;
        justify-content: center;
        align-items: center;
    }
</style>
