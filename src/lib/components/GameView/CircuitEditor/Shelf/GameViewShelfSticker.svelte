<script>
    import { Sticker } from "$lib/dat/Tools/Tools";
    import CircuitDraggable from "$lib/components/GameView/CircuitEditor/CircuitDraggable.svelte";
    import StickerViewer from "../Sticker/StickerViewer.svelte";
    import GameViewShelfButton from "./GameViewShelfButton.svelte";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { createCustomEvent } from "$lib/misc_types/CustomEventSystem";

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

    /**
     * @param {MouseEvent} e
     */
    function onMouseDown(e) {
        const newQuery = new CircuitControllerQueryResult(
            undefined, "Sticker", undefined, undefined, sticker, undefined, [e.pageX, e.pageY], e.timeStamp
        )

        editorEventTarget?.dispatchEvent(createCustomEvent({
                from:newQuery,
                to:  newQuery,
                e:e
            },
            "dragstart",
            e.target
        ))

        console.log("sticker time!", newQuery)
    }
</script>

<GameViewShelfButton
    circuitDraggable={circuitDraggable}
    name={sticker.name}
    onMouseDown={onMouseDown}
>
    <StickerViewer sticker={sticker}/>
</GameViewShelfButton>