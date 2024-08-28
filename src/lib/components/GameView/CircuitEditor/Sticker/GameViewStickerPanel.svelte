<script>
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { onMount } from "svelte";
    import StickerViewer from "./StickerViewer.svelte";
    import CircuitStickerContainer from "$lib/components/GameView/CircuitEditor/Sticker/CircuitStickerContainer.svelte";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { SerializableSticker } from "$lib/storage_types/StickerStorage";

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
     */
    export let editorEventTarget = null
    $: {
        editorEventTarget?.addEventListener("addsticker", onAddSticker)

        addDragEventListeners()
    }

    function addDragEventListeners() {
        if (editorEventTarget == null) {
            return
        }
        editorEventTarget.addEventListener("drag", onDrag)
        editorEventTarget.addEventListener("dragstart", onDragStart)
        editorEventTarget.addEventListener("drop", onDrop)
    }

    /**
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {HTMLDivElement}
     */
    let stickerContainer

    function onDrag() {

    }

    function onDragStart() {

    }

    /**
     * 
     * @param {{from:CircuitControllerQueryResult, to:CircuitControllerQueryResult}} param0 
     */
    function onDrop({from, to}) {
        if (from.type === "Sticker") onAddSticker({from, to})
    }

    /**
     * @type {Array<SerializableSticker>}
     */
    let stickerRegistry = []

    /**
     * 
     * @param {{from:CircuitControllerQueryResult, to:CircuitControllerQueryResult}} param0 
     */
    function onAddSticker({from, to}) {
        if (!stickerContainer || !from.sticker || !to.localOffset) return

        //awful workaround to slot hierarchies in dynamically created components
        //want to see how it works? no? too bad!

        //step 1, create a parent component
        //remember, components imply that elements exist somewhere, but are not equal to those elements, because the Geneva Conventions cannot protect you from the web development context
        //we can technically access the associated elements through something like newStickerContainer.$$.root..., but that's explicitly an internal API
        const gridPos = circuitController.localOffsetToIndex(to.localOffset[0], to.localOffset[1])
        const newStickerContainer = new CircuitStickerContainer(
            {
                target:stickerContainer,
                props:{
                    position:gridPos,
                    size:[2, 2],
                    circuitController:circuitController,
                }
            }
        )

        //instead, let's just grab the container CircuitStickerContainer's slot usually points to with a custom function
        //because simply creating two components is definitely something that should require multiple files worth of code
        const slot = newStickerContainer.getContainer()

        //then, we have an element reference! create a StickerViewer and 
        const stickerViewer = new StickerViewer(
            {
                target:slot,
                props:{ 
                    sticker:from.sticker
                }
            }
        )  

        //then, finally, track the sticker so we can serialize it later
        stickerRegistry.push(new SerializableSticker(gridPos[0], gridPos[1], from.sticker))
        
    }
    
</script>

<!--Stickers laid out to mimic the slot on a GameViewCircuitPanel-->
<div
    class="circuit-container"
    bind:this={stickerContainer}
>


</div>

<style>
    .circuit-container {
        height:100%;
        overflow: hidden;
        position:relative;
    }
</style>