<script>

    import GameView from "$lib/components/GameView/GameView.svelte";
    import GameViewCircuitPanel from "$lib/components/GameView/CircuitEditor/GameViewCircuitPanel.svelte";
    import { GameViewParameters } from "$lib/level_types/GameViewParameters";
    import CircuitEditorComponent from "$lib/components/GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { NotLevel } from "$lib/dat/Levels/Levels";
    import { CircuitController } from "$lib/circuit_types/CircuitController";

    let editor

    const params = NotLevel.params
    const circuitController = params.initializeGrid()

</script>

<div class="level-panel" data-sveltekit-noscroll>
    <CircuitEditorComponent
        params={NotLevel.params}
        circuitController={circuitController}
        canDragGates={false}
        
    >
    </CircuitEditorComponent>
</div>

<style>
    .level-panel {
        width:100%;
        height:100%;
    }
</style>