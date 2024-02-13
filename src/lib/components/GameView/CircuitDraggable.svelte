
<script>
    //@ts-ignore
    import { CircuitController } from "$lib/circuit_types/CircuitController";

    //@ts-ignore
    import { CircuitDragDropController } from "$lib/circuit_types/CircuitDragDropController";
    //@ts-ignore
    import { GateType } from "$lib/circuit_types/Gate";
    import { getGateTypeSvgContents, getGateTypeSvg } from "../GateSvgs.svelte";

    let contents = ""

    /**
     * @type {CircuitController}
     */
    export let circuitController

    let circuitDragDropController = new CircuitDragDropController(circuitController)

    /**
     * @param {MouseEvent} e
     * @param {GateType} type
     * @param {HTMLElement | null} element
     */
    export function dragGateType(e, type, element=null) {
        circuitDragDropController.dragStart(type, element) 
        resolveContents()
        document.addEventListener("mousemove", onMouseMove)
        onMouseMove(e) //update the position before the mouse actually moves
    }

    function resolveContents() {
        const item = circuitDragDropController.getGateType()
        if (item !== undefined) {
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