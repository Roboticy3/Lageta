<script>

    import { Buf } from "$lib/circuit_types/Gate";
    import { onMount } from "svelte";

    import { getGateSvg, getGateTypeSvg } from "../GateSvgs.svelte";

    export let gateType = Buf

    onMount(() => {

        let elem = document.getElementById(`gateshelf.${gateType.name}`)

        if (elem == null) {
            return
        }
    })

    let id = `gateshelf.${gateType.name}`

    /**
     * @param {DragEvent} e
     */
    export let onDragStart = (e) => {

        const dataTransfer = e.dataTransfer
        if (dataTransfer === null) {
            return
        }
        dataTransfer.setData("type","Gate")

        dataTransfer.setData('ShelfButtonId', id)
        dataTransfer.setData('GateName', gateType.name)
        
        dataTransfer.setData('offset', `${e.offsetX}|${e.offsetY}`)
    }
</script>

<div class="shelf-button" draggable="true" id={id} on:dragstart={onDragStart}>
    {@html getGateTypeSvg(gateType)}
</div>

<style>
    .shelf-button {
        display: flex;
        margin-left: 3%;
        align-self: center;
        align-items: center;
        background-color: yellow;
        max-height: 50px;
        aspect-ratio: 1;
    }
</style>
