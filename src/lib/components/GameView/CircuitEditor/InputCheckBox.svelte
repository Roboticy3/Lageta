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
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";

    
    /**
     * @type {HeavyButton}
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
    $: color = checked ? 'var(--connection-color-on)':'var(--connection-color-off)'

    onMount(async () => {
        if (browser) {
            window.addEventListener('load', onChange)
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
            checked = gridController.getGateOutputs(from[0])?.override[from[1]] || false
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

        const button = checkbox.getButton()
        const bbox = button.getBoundingClientRect()
        
        const q = gridController.toQuery(from[0], "Input", from[1], undefined, [bbox.x, bbox.y])
        const evt = createGameViewCircuitPanelEvent("setinput", q, q, button)
        editorEventTarget?.dispatchEvent(evt)
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
        return [gateOffset[0] + connectionOffset[0] / 10 + 0.5, gateOffset[1] + connectionOffset[1] / 10 - 1.25]
    }

    const checkboxStyle =
`
    font-size:min(3vw, 4vh);
    height:100%;
    width:100%;
    top:-10%;
    left:-5%;
    position:relative;
`
    const checkboxHoverStyle =
`
    scale:1.2;
`

</script>

<CircuitDiv
    circuitController={gridController}
    position={getPosition()}
    size={[0.5, 0.75]}
    active={true}
    smooth={true}
    >
    
    <HeavyButton 
        style={checkboxStyle}
        hoverStyle={checkboxHoverStyle}
        bind:this={checkbox} 
        on:click={onChange} 
    >
        <ResizingSvg>
            <g font-size="10">
                <text x="5" y="10" fill="var(--connection-color-on)">H</text>
                <g transform="rotate(12)"><text x="7" y="9" fill="black">_</text></g>
                <text x="5" y="20" fill="var(--connection-color-off)">L</text>
                <circle fill="none" stroke="{color}" cx="8" r="6" cy="{checked ? 6:17}"/>
            </g>
            
        </ResizingSvg>
    </HeavyButton>
    
    
    
</CircuitDiv>


<style>

    .input-checkbox {
        
    }

    .input-checkbox:hover {
        scale:1.2;
    }
</style>