<script>
    import { onMount } from "svelte";
    
    import CircuitDraggable from "$lib/components/GameView/CircuitEditor/CircuitDraggable.svelte";
    import { Buf, getGateType, wrapGateTypeViewInSvgHeader } from "$lib/dat/GateTypes/GateTypes";
    import { GateType, GateTypeController, GateTypeView } from "$lib/circuit_types/GateType";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { createCustomEvent } from "$lib/misc_types/CustomEventSystem";

    /**
     * @type {GateTypeController}
     */
    export let gateType = getGateType(Buf)

    /**
     * @type {CircuitDraggable}
     */
    export let circuitDraggable

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
     */
    export let editorEventTarget

    onMount(() => {

        let elem = document.getElementById(`gateshelf.${gateType.view.name}`)

        if (elem == null) {
            return
        }

        render = gateType.view.draw({override:[]})
    })

    let id = `gateshelf.${gateType.view.name}`
    let title = `ShelfButton.${gateType.view.name}`

    /**
     * @type {HTMLElement}
     */
    let element

    let render = ""

    /**
     * @param {MouseEvent} e
     */
    export let onMouseDown = (e) => {
        const newQuery = new CircuitControllerQueryResult(
            undefined, "Gate", undefined, gateType, undefined, [e.pageX, e.pageY], e.timeStamp
        )

        editorEventTarget?.dispatchEvent(createCustomEvent({
                from:newQuery,
                to:  newQuery,
                e:e
            },
            "dragstart",
            e.target
        ))

        console.log("starting drag from shelf button ", newQuery)
    }

    export let highlight = () => {
        circuitDraggable.setContentsToName(gateType.name)
    }

    export let unhighlight = () => {
        circuitDraggable.resolveContents()
    }

</script>

<button 
    class="shelf-button"
    id={id} 
    title={title}
    bind:this={element} 
    on:mousedown={onMouseDown}
    on:mouseenter={highlight}
    on:focusin={highlight}
    on:mouseleave={unhighlight}
    on:focusout={unhighlight}
>
    {@html wrapGateTypeViewInSvgHeader(gateType.view.gridWidth, gateType.view.gridHeight, render, `width="100%" height="100%"`)}
</button>

<style>
    .shelf-button {
        display: block;
        align-self: center;
        height:100%;
        min-width:3vw;
    }

    .shelf-button:hover {
        height:110%;
    }
</style>
