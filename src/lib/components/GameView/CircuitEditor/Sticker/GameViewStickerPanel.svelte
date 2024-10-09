<script>
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { onMount, tick } from "svelte";
    import StickerViewer from "./StickerViewer.svelte";
    import CircuitStickerContainer from "$lib/components/GameView/CircuitEditor/Sticker/CircuitStickerContainer.svelte";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { SerializableSticker } from "$lib/storage_types/StickerStorage";
    import { Sticker, StickerType } from "$lib/circuit_types/sticker/Sticker";
    import { StickerController } from "$lib/circuit_types/sticker/StickerController";

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
     * @type {StickerController}
     */
    export let stickerController = new StickerController()
    //replace stickers from scratch if the registry or container are switched out
    $: { if (stickerController && stickerContainer) {
        resetStickers()
    }}

    //replace waits for the next tick, since this will crash if the circuit renderer is not up to date
    //this is because stickers are CircuitDivs, which scale off of the circuitController, and thus CircuitRenderer
    //it's a big shit show and super flaky, but I don't care enough to fix that
    async function resetStickers() {
        await tick()

        stickerContainer.replaceChildren(...[])
        stickerController.forEach((ss, i) => {
            if (ss) addSticker([ss.x, ss.y], new Sticker(ss.sticker, i))
        })
    }

    /**
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {HTMLDivElement}
     */
    let stickerContainer

    /**
     * @param {{from:CircuitControllerQueryResult, to:CircuitControllerQueryResult}} param0 
     */
    function onDrag({from, to}) {
    }

    function onDragStart() {

    }

    /**
     * @param {{from:CircuitControllerQueryResult, to:CircuitControllerQueryResult}} param0 
     */
    function onDrop({from, to}) {
        if (from.type === "Sticker") onAddSticker({from, to})
    }

    /**
     * 
     * @param {{from:CircuitControllerQueryResult, to:CircuitControllerQueryResult}} param0 
     */
    function onAddSticker({from, to}) {
        if (!stickerContainer || !from.stickerType || !to.localOffset) return

        const gridPos = circuitController.localOffsetToIndex(to.localOffset[0], to.localOffset[1])

        const id = stickerController.registerSticker(new SerializableSticker(gridPos[0], gridPos[1], from.stickerType))
 
        let sticker = new Sticker(from.stickerType, id)

        addSticker(gridPos, sticker)

        console.log("added sticker! controller: ", stickerController)
    }

    /**
     * awful workaround to slot hierarchies in dynamically created components
     * want to see how it works? no? too bad!
     * @param {[number, number]} gridPos
     * @param {Sticker} sticker
     */
    function addSticker(gridPos, sticker) {
        //step 1, create a parent component
        //remember, components imply that elements exist somewhere, but are not equal to those elements, because the Geneva Conventions cannot protect you from the web development context
        //we can technically access the associated elements through something like newStickerContainer.$$.root..., but that's explicitly an internal API
        const newStickerContainer = new CircuitStickerContainer(
            {
                target:stickerContainer,
                props:{
                    position:gridPos,
                    size:[2, 2],
                    circuitController:circuitController,
                    editorEventTarget:editorEventTarget,
                    sticker:sticker
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
                    sticker:sticker.type
                }
            }
        )
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
        pointer-events: none;
    }
</style>