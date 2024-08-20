<script>
    import { Sticker } from "$lib/dat/Tools/Tools";
    import CircuitDraggable from "$lib/components/GameView/CircuitEditor/CircuitDraggable.svelte";
    import StickerViewer from "../Sticker/StickerViewer.svelte";
    import GameViewShelfButton from "./GameViewShelfButton.svelte";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";

    /**
     * @type {Sticker}
     */
     export let sticker

    /**
     * @type {CircuitDraggable}
     */
    export let circuitDraggable

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
     */
    export let editorEventTarget = null

    function onMouseDown() {
        
    }
</script>

<GameViewShelfButton
    circuitDraggable={circuitDraggable}
    name={sticker.name}
    onMouseDown={onMouseDown}
>
    <StickerViewer sticker={sticker}/>
</GameViewShelfButton>