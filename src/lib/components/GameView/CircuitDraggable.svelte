
<script>
    //@ts-ignore
    import { CircuitDragDropController } from "$lib/circuit_types/CircuitDragDropController";
    import { GateType } from "$lib/circuit_types/Gate";
    import { getGateTypeSvgContents, getGateTypeSvg } from "../GateSvgs.svelte";

    let contents = ""

    let circuitDragDropController = new CircuitDragDropController()

    /**
     * @param {MouseEvent} e
     * @param {GateType} type
     * @param {HTMLElement | null} element
     */
    export function dragGate(e, type, element=null) {
        circuitDragDropController.dragStart(type, element) 
        resolveContents()
        document.addEventListener("mousemove", onMouseMove)
        onMouseMove(e) //update the position before the mouse actually moves
    }

    function resolveContents() {
        const item = circuitDragDropController.getItem()
        if (item instanceof GateType) {
            contents = getGateTypeSvg(item)
        }
    }

    let posX = 0
    let posY = 0

    /**
     * @param {MouseEvent} e
     */
    function onMouseMove(e) {
        posX = e.pageX
        posY = e.pageY
    }

    /**
     * 
     * @param {MouseEvent} e
     */
    export function dropGate(e) {
        const item = circuitDragDropController.getItem()

        circuitDragDropController.dragEnd()
    }
</script>

<div style="top:{posY}px; left:{posX}px;">{@html contents}</div>

<style>
    div {
        pointer-events: none;
        position: absolute;
        width: 30px;
    }
</style>