<script>
    import { GameViewParameters } from "$lib/level_types/GameViewParameters";
    //@ts-ignore
    import { Freeplay, Level, all_levels } from "$lib/level_types/Level";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import { onMount } from "svelte";
    import GameViewCircuitPanel from "../GameView/GameViewCircuitPanel.svelte";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import CircuitDraggable from "../GameView/CircuitDraggable.svelte";

    const params = new GameViewParameters("LevelSelect", "", {size:[20, 20]})

    let progress = new ProgressStorage()
    let levelSet = progress.levels()

    let circuitPanel

    let circuitController = params.initializeGrid()
    
    let circuitDraggable

</script>

<CircuitDraggable 
    bind:this={circuitDraggable}
    circuitController={circuitController}  
/>

<GameViewCircuitPanel 
    bind:this={circuitPanel} 
    params={params}
    gridController={circuitController}
    circuitDraggable={circuitDraggable}
/> 