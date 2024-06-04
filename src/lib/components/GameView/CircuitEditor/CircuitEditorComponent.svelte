
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { onMount, tick } from "svelte";
    import CircuitDraggable from "$lib/components/GameView/CircuitEditor/CircuitDraggable.svelte";
    import GameViewShelfButton from "$lib/components/GameView/CircuitEditor/GameViewShelfButton.svelte";
    import GameViewCircuitPanel from "$lib/components/GameView/CircuitEditor/GameViewCircuitPanel.svelte";
    import { GameViewParameters } from "$lib/level_types/GameViewParameters";
    import { GateTypeController } from "$lib/circuit_types/GateType";
    import { GameViewCircuitPanelEventTarget } from "$lib/circuit_types/GameViewCircuitPanelEvent";

    /**
     * @type {CircuitController | null}
     */
    export let circuitController = null

    export function getController() {
        return circuitController
    }

    /**
     * @type {GameViewParameters}
     */
    export let gameParams
    
    /**
     * @type {any}
     */
    export let editorParams = {}

    export let rendererParams = {}

    /**
     * @type {any}
     */
    export let maxSizeState = {
        shelfMaxHeight:'0%'
    }

    /**
     * @type {GameViewCircuitPanelEventTarget}
     */
    export let editorEventTarget

    /**
     * @type {GateTypeController[]}
     */
    export let shelf = []

    onMount(async () => {
        if (!circuitController) {
            circuitController = new CircuitController()
        }
    })

    /**
     * @type {GameViewCircuitPanel}
     */
    let circuitPanel

    /**
     * @type {HTMLDivElement}
     */
    let shelfContainer

    /**
     * @type {HTMLDivElement}
     */
    let circuitContainer

    /**
     * @type {CircuitDraggable}
     */
    let circuitDraggable

    /**
     * @type {HTMLDivElement}
     */
    let container

    /**
     * @param {string} qs
     */
    export function getElement(qs) {
        return circuitPanel?.getElement(qs) || null
    }

    /**
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEventKey} type
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEventListener} listener
     */
     export function addEventListener(type, listener) {
        circuitPanel.addEventListener(type, listener)
    }

    /**
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEventKey} type
     * @param {import("$lib/circuit_types/GameViewCircuitPanelEvent").GameViewCircuitPanelEventListener} listener
     */
    export function removeEventListener(type, listener) {
        circuitPanel.removeEventListener(type, listener)
    }

    /**
     * Used to give an existing CircuitEditorComponent to a new GameView by putting it in absolute coordinates and letting GameView position it where a normally constructed editor would go.
     */
    let floating = false
    export function pickup() {
        floating = true
    }
    export function putdown() {
        floating = false
        container.style.left = 'auto'
        container.style.top = 'auto'
        container.style.width = '100%'
        container.style.height = '100%'
    }

    /**
     * Intended for use after pickup has been called. Move the editor in pixel coordinates.
     * @param {number} left
     * @param {number} top
     */
    export function move(left, top) {
        if (!floating) return
        container.style.left = `${left}px`
        container.style.top = `${top}px`
    }

    /**
     * Intended for use after pickup has been called. Scale the editor in pixel coordinates.
     * @param {number} width
     * @param {number} height
     */
    export function scale(width, height) {
        if (!floating) return
        container.style.width = `${width}px`
        container.style.height = `${height}px`
    }
</script>

<div 
    class="container {floating ? 'floating':''}" 
    style="width:100%; height:100%;"
    bind:this={container}
>
    {#if circuitController}
        <CircuitDraggable 
            editorEventTarget={editorEventTarget}
            bind:this={circuitDraggable}
        />
        <div 
            class="shelf" 
            style="max-height:{maxSizeState.shelfMaxHeight};" 
            title="Shelf"
            bind:this={shelfContainer}
        >
            {#each shelf as gateTypeController}
                <GameViewShelfButton 
                    circuitDraggable={circuitDraggable} 
                    gateType={gateTypeController}
                    editorEventTarget={editorEventTarget}
                />
            {/each}
        </div>
        
        <div 
            class="circuit-panel" 
            bind:this={circuitContainer}
            title="Circuit"
        >
            <GameViewCircuitPanel 
                bind:this={circuitPanel}
                gameParams={gameParams}
                circuitController={circuitController}
                circuitDraggable={circuitDraggable}
                editorParams={editorParams}
                rendererParams={rendererParams}
                editorEventTarget={editorEventTarget}
            >
                <slot />
            </GameViewCircuitPanel>
        </div>
    {/if}
</div>

<style>

    .container {
        display: flex;
        flex-direction: column;
    }

    .shelf {

        flex:1;

        background-color: var(--tertiary-bg-color);

        display: flex;
        flex-direction: row;

        transition:max-height 3s;
    }

    .circuit-panel {
        flex:7;

        background-color: var(--main-bg-color);

        border: thick double;
        color: var(--grid-color);
    }

    .floating {
        position:absolute;
    }
</style>