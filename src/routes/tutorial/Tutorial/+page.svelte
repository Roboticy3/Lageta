<script>

    import GameView from "$lib/components/GameView/GameView.svelte";
    import GameViewCircuitPanel from "$lib/components/GameView/CircuitEditor/GameViewCircuitPanel.svelte";
    import { GameViewParameters } from "$lib/level_types/GameViewParameters";
    import CircuitEditorComponent from "$lib/components/GameView/CircuitEditor/CircuitEditorComponent.svelte";
    import { NotLevel } from "$lib/dat/Levels/Levels";

    let editor

</script>

<div class="base-vertical">
    <div class="sandbox-horizontal">
        <div class="circuit-editor">
            <CircuitEditorComponent params={NotLevel.params} bind:this={editor}/>
        </div>
    </div>
</div>

<style>
    .base-vertical {
        display:flex;
        flex-direction: column;
        height:100%;
    }

    .base-vertical .sandbox-horizontal {
        flex: 7;
        
        display:flex;
        flex-direction: row;
        height:70%;
    }

    .sandbox-horizontal .circuit-editor {
        flex: 9;

        display: flex;
        flex-direction: column;
    }
</style>