
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { onMount } from "svelte";
    import CircuitDraggable from "$lib/components/GameView/CircuitEditor/CircuitDraggable.svelte";
    import GameViewShelfButton from "$lib/components/GameView/CircuitEditor/GameViewShelfButton.svelte";
    import GameViewCircuitPanel from "$lib/components/GameView/CircuitEditor/GameViewCircuitPanel.svelte";
    import { GameViewParameters } from "$lib/level_types/GameViewParameters";
    import { GateTypeController } from "$lib/circuit_types/GateType";

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
     * @type {GateTypeController[]}
     */
    export let shelf = []

    onMount(() => {
        if (!circuitController) {
            circuitController = new CircuitController()
        }
    })

    /**
     * @type {GameViewCircuitPanel}
     */
    let circuitPanel

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

    let circuitDraggable
</script>

{#if circuitController}
    <CircuitDraggable 
        circuitController={circuitController} 
        bind:this={circuitDraggable}
    />
    {#if shelf.length > 0}
        <div class="shelf">
            {#each shelf as gateTypeController}
                <GameViewShelfButton circuitDraggable={circuitDraggable} gateType={gateTypeController}/>
            {/each}
        </div>
    {/if}
    <div class="circuit-panel">
        <GameViewCircuitPanel 
            bind:this={circuitPanel}
            gameParams={gameParams}
            circuitController={circuitController}
            circuitDraggable={circuitDraggable}
            editorParams={editorParams}
            rendererParams={rendererParams}
        >
            <slot />
        </GameViewCircuitPanel>
    </div>
{/if}

<style>
    .shelf {
        flex: 1;
        background-color: var(--tertiary-bg-color);

        display: flex;
        flex-direction: row;

        
    }

    .circuit-panel {
        flex: 7;
        background-color: var(--main-bg-color);
        min-height: 0;

        border: thick double;
        color: var(--grid-color);

        height:100%;
        width:100%;
    }
</style>