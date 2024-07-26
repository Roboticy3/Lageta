<script>
    import StickerViewer from "../Sticker/StickerViewer.svelte";
    import GameViewShelfButton from "./GameViewShelfButton.svelte";

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
</script>

<GameViewShelfButton
    circuitDraggable={circuitDraggable}
    name={sticker.name}
>
    <StickerViewer sticker={sticker}/>
</GameViewShelfButton>