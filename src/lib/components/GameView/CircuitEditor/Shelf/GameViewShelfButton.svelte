<script>
    import { onMount } from "svelte";
    
    import CircuitDraggable from "$lib/components/GameView/CircuitEditor/CircuitDraggable.svelte";
    import { Buf, getGateType, wrapGateTypeViewInSvgHeader } from "$lib/dat/GateTypes/GateTypes";
    import { GateType, GateTypeController, GateTypeView } from "$lib/circuit_types/GateType";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { createCustomEvent } from "$lib/misc_types/CustomEventSystem";
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";

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

    let render = ""

    /**
     * @param {any} e
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

    const buttonStyle = 
`
    display: block;
    align-self: center;
    height:100%;
    min-width:3vw;
    max-width:5vw;
`
    const buttonHoverStyle =
`
    height:105%;
`

</script>

<HeavyButton 
    style={buttonStyle}
    hoverStyle={buttonHoverStyle}
    id={id} 
    on:mousedown={onMouseDown}
    on:mouseenter={highlight}
    on:focusin={highlight}
    on:mouseleave={unhighlight}
    on:focusout={unhighlight}
>
    {@html wrapGateTypeViewInSvgHeader(gateType.view.gridWidth, gateType.view.gridHeight, render, `width="100%" height="100%"`)}
</HeavyButton>
