
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { onMount } from "svelte";
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
    
    export let editorParams = {}

    export let rendererParams = {}

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
     */
    export let editorEventTarget = null

    /**
     * @type {GateTypeController[]}
     */
    export let shelf = []

    onMount(() => {
        if (!circuitController) {
            circuitController = new CircuitController()
        }

        if (shelf.length > 0) {
            shelfContainer.style.height = '15%'
            circuitContainer.style.height = '85%'
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
        container.style.left = `${left}px`
        container.style.top = `${top}px`
    }

    /**
     * Intended for use after pickup has been called. Scale the editor in pixel coordinates.
     * @param {number} width
     * @param {number} height
     */
    export function scale(width, height) {
        container.style.width = `${width}px`
        container.style.height = `${height}px`
    }
</script>

<div 
    class="{floating ? 'floating':''}" 
    style="width:100%; height:100%;"
    bind:this={container}
>
    {#if circuitController}
        <CircuitDraggable 
            circuitController={circuitController} 
            bind:this={circuitDraggable}
        />
        {#if shelf.length > 0}
            <div class="shelf" bind:this={shelfContainer}>
                {#each shelf as gateTypeController}
                    <GameViewShelfButton circuitDraggable={circuitDraggable} gateType={gateTypeController}/>
                {/each}
            </div>
        {/if}
        <div class="circuit-panel" bind:this={circuitContainer}>
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
        width: 100%;
        height: 100%;
    }

    .shelf {
        background-color: var(--tertiary-bg-color);

        display: flex;
        flex-direction: row;
    }

    .circuit-panel {
        background-color: var(--main-bg-color);
        min-height: 0;

        border: thick double;
        color: var(--grid-color);

        height:100%;
        width:100%;
    }

    .floating {
        position:absolute;
    }
</style>