<script>
    import { browser } from "$app/environment";
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { onMount } from "svelte";
    import CircuitDiv from "../CircuitDiv.svelte";
    import { GameViewCircuitPanelEventTarget, createGameViewCircuitPanelEvent } from "$lib/circuit_types/GameViewCircuitPanelEvent";
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";
    import Led from "../Signal/Led.svelte";

    
    /**
     * @type {HeavyButton}
     */
    let checkbox

    /**
     * @type {GameViewCircuitPanelEventTarget}
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

    export let active = true
    /**
     * @param {boolean} to
     */
    export function setActive(to) {
        active = to
    }
    export function isActive() {
        return active
    }

    

    onMount(async () => {
        onChangeExternal(from[0])

        gridController.addGraphListener("update", ({id}) => {
            onChangeExternal(id)
        })
    
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

        if (gridController) {
            console.log("trying to check box with gridController ", gridController)
            if (gridController.isPlaying()) {
                return
            }
            gridController.setInput(from, !checked)
        }

        checked = !checked

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
     * @type {[number, number] | undefined}
     */
    export let gridOffset = undefined
    /**
     * @type {[number, number]}
     */
    let position = [0.0, 0.0]
    $: if (gridOffset) {
        position = getPosition()
    } else {
        gridOffset = getButtonOffset()
        position = getPosition()
    }

    function getButtonOffset() {
        return gridController.
            getGateTypeController(from[0])?.
            view.buttonOffset
    }
    
    /**
     * @returns {[number, number]}
     */
    export function getPosition() {
        const gateOffset = gridController.getGatePosition(from[0])
        const connectionOffset = gridController.getConnectionPoint({id:from[0], index:from[1], type:"Output"})
        if (connectionOffset === undefined || gateOffset === undefined) return [0, 0]
        const safeGridOffset = gridOffset || [0, 0]
        return [gateOffset[0] + connectionOffset[0] / 10 + safeGridOffset[0], gateOffset[1] + connectionOffset[1] / 10 + safeGridOffset[1]]
    }

    const divStyle = 
`
    background:transparent;
`

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

    let highColor = "#00000"
    let lowColor = "#00000"
    $: if (browser) {
        const root = document.documentElement; 
        const style = getComputedStyle(root)
        highColor = style.getPropertyValue('--connection-color-on');
        lowColor = style.getPropertyValue('--connection-color-off');
    }

    $: highLedOn = checked
    $: lowLedOn = !checked

</script>

<CircuitDiv
    circuitController={gridController}
    position={position}
    size={[1.1, 0.6]}
    active={active}
    smooth={true}
    extraStyle={divStyle}
    >
    
    <HeavyButton 
        style={checkboxStyle}
        hoverStyle={checkboxHoverStyle}
        bind:this={checkbox} 
        on:click={onChange}
    >
        <div class="check">
            <Led color={lowColor} on={lowLedOn}/>
            <Led color={highColor} on={highLedOn}/>
        </div>
    
        
    </HeavyButton>  
</CircuitDiv>

<style>
    .check {
        display:flex;
        position:absolute;
        width:100%;
        height:100%;
        top:0;
        left:8%;
        font-size:small;
        box-sizing:border-box;
        padding:5%;
    }
</style>
