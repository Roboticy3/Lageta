
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import { onMount } from 'svelte';
    import { GateType, GateTypeController } from '$lib/circuit_types/GateType';
    import { Buf, getGateType, getGateTypeParams, wrapGateTypeViewInSvgHeader } from '$lib/dat/GateTypes/GateTypes';
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import TruthTableView from "../TruthTableView.svelte";
    import { TruthTable } from "$lib/circuit_types/TruthTable";
import { StickerType } from "$lib/circuit_types/sticker/Sticker";
    let contents = ""

    /*
    //Since GameViewCircuitPanel is now responsible for queries, it will call onMouseMove and feed it query data remotely
    onMount(() => {
        window.addEventListener("mousemove", onMouseMove)
    })
    */

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
     */
    export let editorEventTarget
    $: {
        editorEventTarget?.addEventListener("dragstart", onDragStart)
        editorEventTarget?.addEventListener("drop", onDrop)
    }

    let dragging = false

    let query = new CircuitControllerQueryResult()

    onMount(() => {

        window.addEventListener("mousemove", onMouseMove)
    })


    export function resolveContents() {
        switch (query.type) {
            case "Gate":
                const vType = query.gateTypeController?.view
                if (vType !== undefined) {
                    contents = wrapGateTypeViewInSvgHeader(vType.gridWidth, vType.gridHeight, vType.draw())
                    console.log("resolving contents ", contents)
                    return
                }
                break
            case "Sticker":
                const stickerType = query.stickerType
                if (stickerType !== undefined) {
                    contents = wrapSticker(stickerType)
                    console.log("resolving contents ", contents)
                    hoverGateType = null
                    return
                }
        }
        
        contents = ""
        hoverGateType = null
    }

    /**
     * @param {string} name
     */
    export function setContentsToName(name) {
        contents = `<div style="background:white; width:fit-content;"><p>${name || "?"}</p></div>`
        const gParams = getGateTypeParams(name)
        const gType = gParams ? getGateType(gParams) : undefined
        if (gType &&
            gType.view.sizeIn < 5 && 
            gType.view.sizeIn > 0 && 
            gType.view.sizeOut > 0
        )
        {
            hoverGateType = gType
        }
            
    }

    /**
     * @param {StickerType} sticker
     */
    function wrapSticker(sticker) {
        return `
<img src="${sticker.url}" alt="${sticker.name}" style="width:100px;"/>
`
    }

    /**
     * @type {GateTypeController | null}
     */
    let hoverGateType = null
    export let showTruthTables = false

    let posX = 0
    let posY = 0

    /**
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEvent} param0
     */
     export function onDragStart({from, to}) {
        query = from
        dragging = true
        resolveContents()
    }

    /**
     * @param {MouseEvent} e
      */
    export function onMouseMove(e) {
        posX = e.pageX
        posY = e.pageY
    }

    /**
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEvent} param0
     */
     export function onDrop({from, to}) {
        query = new CircuitControllerQueryResult()
        dragging = false
        resolveContents()
    }

    export function isDragging() {
        return dragging
    }

    export function getQuery() {
        return query
    }
</script>

<div class="contents" style="top:{posY}px; left:{posX}px;">
    {@html contents}
    {#if showTruthTables && hoverGateType}
        <TruthTableView truthTable={new TruthTable(hoverGateType)}/>
    {/if}
</div>

<style>
    .contents {
        pointer-events: none;
        position: absolute;
        display:flex;
        flex-direction: column;
    }
</style>