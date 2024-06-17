<script>
    import { browser } from "$app/environment";

    //@ts-ignore
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { onMount, tick } from "svelte";
    import CircuitDiv from "../CircuitDiv.svelte";
    import { GameViewCircuitPanelEventTarget, createGameViewCircuitPanelEvent } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import { CircuitControllerQueryResult } from "$lib/circuit_types/CircuitControllerQueryResult";
    import ResizingSvg from "$lib/components/Misc/ResizingSvg.svelte";
    import { Buf, getGateType } from "$lib/dat/GateTypes/GateTypes";

    
    /**
     * @type {Element}
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
    let checked = startChecked
    $: content = checked ? "+":"-"

    onMount(async () => {
        if (browser) {
            window.addEventListener('load', onChange)
        }
        else {
            checkbox.setAttribute("hidden","hidden")
        }

        gridController.addGraphListener("update", ({id}) => {
            onChangeExternal(id)
        })

        onChangeExternal(from[0])
    })

    /**
     * @param {number} id
     */
    function onChangeExternal(id) {
        if (id === from[0]) {
            const value = gridController.getGateOutputs(from[0])?.override[from[1]]
            if (value) {
                checked = true
            } else {
                checked = false
            }
        }
    }

    function onChange() {
        if (from === null) {
            return
        }

        checked = !checked

        if (gridController) {
            gridController.setInput(from, checked)
        }

        const bbox = checkbox.getBoundingClientRect()
        
        const q = gridController.toQuery(from[0], "Input", from[1], undefined, [bbox.x, bbox.y])
        editorEventTarget?.dispatchEvent(createGameViewCircuitPanelEvent("setinput", q, q, checkbox))
    }

    export function isChecked() {
        return checked
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
    
    <button class="input-checkbox">
        <ResizingSvg>
            <rect x="0" y="0" width="20" height="20" fill="none"/>
        </ResizingSvg>
    </button>
    
    
    
</CircuitDiv>


<style>

    .input-checkbox {
        font-size:min(3vw, 4vh);
        height:100%;
        width:100%;
        top:-10%;
        left:-5%;
        position:relative;
    }

    .input-checkbox-checked {
        background-color: var(--connection-color-on);
        color: white;
    }

    .input-checkbox-unchecked {
        background-color: var(--connection-color-off);
        color: black;
    }
</style>