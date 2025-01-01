<script>
    import { onMount } from "svelte";
    
    import CircuitDraggable from "$lib/components/GameView/CircuitEditor/CircuitDraggable.svelte";
    import { Buf, getGateType, wrapGateTypeViewInSvgHeader } from "$lib/dat/GateTypes/GateTypes";
    import { GateTypeController } from "$lib/circuit_types/GateType";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { createCustomEvent } from "$lib/misc_types/CustomEventSystem";
    import GameViewShelfButton from "./GameViewShelfButton.svelte";

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

    let render = ""

    /**
     * @param {any} e
     */
    export let onMouseDown = (e) => {
        const newQuery = new CircuitControllerQueryResult({
            type:"Gate",
            gateTypeController:gateType,
            pageOffset:[e.pageX,e.pageY],
            timeStamp:e.timeStamp
        })

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

</script>

<GameViewShelfButton
    circuitDraggable={circuitDraggable}
    onMouseDown={onMouseDown}
    name={gateType.view.name}
>
    {@html wrapGateTypeViewInSvgHeader(gateType.view.gridWidth, gateType.view.gridHeight, render, `height="10vh" width="100%"`)}
    
</GameViewShelfButton>
