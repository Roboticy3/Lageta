<script>
    import { browser } from "$app/environment";

    //@ts-ignore
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { onMount, tick } from "svelte";
    import CircuitDiv from "../CircuitDiv.svelte";
    import { GameViewCircuitPanelEventTarget, createGameViewCircuitPanelEvent } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";

    
    /**
     * @type {HTMLInputElement}
     */
    let checkbox

    /**
     * @type {GameViewCircuitPanelEventTarget | null}
     */
     export let editorEventTarget

    /**
     * @type {CircuitController}
     */
    export let gridController
    /**
     * @type {[number, number]}
     */
    export let from

    export let startChecked = true

    onMount(async () => {
        if (browser) {
            
            checkbox.checked = startChecked
            window.addEventListener('load', onChange)
        }
        else {
            checkbox.setAttribute("hidden","hidden")
        }

        onChange()
    })

    function onChange() {
        if (from === null) {
            return
        }
        if (gridController) {
            gridController.setInput(from, checkbox.checked)
        }

        const bbox = checkbox.getBoundingClientRect()
        
        const q = gridController.toQuery(from[0], "Input", from[1], undefined, [bbox.x, bbox.y])
        editorEventTarget?.dispatchEvent(createGameViewCircuitPanelEvent("setinput", q, q, checkbox))
    }

    export function isChecked() {
        return checkbox.checked
    }
    
    /**
     * @returns {[number, number]}
     */
    export function getPosition() {
        const gateOffset = gridController.getGatePosition(from[0])
        const connectionOffset = gridController.getConnectionPoint({id:from[0], index:from[1], type:"Output"})
        if (connectionOffset === undefined || gateOffset === undefined) return [0, 0]
        return [gateOffset[0] + connectionOffset[0] / 10 - 1, gateOffset[1] + connectionOffset[1] / 10 - 0.75]
    }

</script>

<CircuitDiv
    circuitController={gridController}
    position={getPosition()}
    size={[0.5, 0.5]}
    active={true}
    smooth={true}
    >
    <div>
        <input 
            type="checkbox" 
            class="input-checkbox" 
            bind:this={checkbox} 
            on:change={onChange}
        />
    </div>
    
</CircuitDiv>


<style>
    .input-checkbox {
        background-color: 2px solid var(--connection-color-off);
        accent-color:var(--connection-color-on);
    }

    .input-checkbox:hover {
        transform: scale(1.2);
    }
</style>