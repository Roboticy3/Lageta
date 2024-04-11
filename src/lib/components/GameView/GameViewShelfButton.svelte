<script>
    import { onMount } from "svelte";
    
    import CircuitDraggable from "./CircuitDraggable.svelte";
    import { Buf, getGateType, wrapGateTypeViewInSvgHeader } from "$lib/dat/GateTypes/GateTypes";
    import { GateType, GateTypeController, GateTypeView } from "$lib/circuit_types/GateType";

    /**
     * @type {GateTypeController}
     */
    export let gateType = getGateType(Buf)

    /**
     * @type {CircuitDraggable}
     */
    export let circuitDraggable

    onMount(() => {

        let elem = document.getElementById(`gateshelf.${gateType.view.name}`)

        if (elem == null) {
            return
        }

        render = gateType.view.draw({override:[]})
    })

    let id = `gateshelf.${gateType.view.name}`

    /**
     * @type {HTMLElement}
     */
    let element

    let render = ""

    /**
     * @param {MouseEvent} e
     */
    export let onMouseDown = (e) => {
        circuitDraggable.dragGateType(e, gateType, element)
    }

</script>

<button class="shelf-button" id={id} bind:this={element} on:mousedown={onMouseDown}>
    {@html wrapGateTypeViewInSvgHeader(gateType.view.gridWidth, gateType.view.gridHeight, render)}
</button>

<style>
    .shelf-button {
        display: block;
        margin-left: 3%;
        padding: 0;
        align-self: center;
        background-color: yellow;
        height:80%;
        max-height: 50px;
        aspect-ratio: 1;
    }
</style>
