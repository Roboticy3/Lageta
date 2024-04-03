<script>
    //@ts-ignore
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    //@ts-ignore
    import GameViewCircuitPanel from "./GameViewCircuitPanel.svelte";
    import { onMount, tick } from "svelte";

    
    /**
     * @type {HTMLInputElement}
     */
    let checkbox

    /**
     * @type {CircuitController | null}
     */
    export let gridController
    /**
     * @type {GameViewCircuitPanel | null}
     */
    export let circuitPanel
    /**
     * @type {[number, number] | null}
     */
    export let from

    export let startChecked = true

    /**
     * @type {[number, number]}
     */
    let offset = [0, 0]
    let margin = [0, 0]
    const setOffset = () => {
        if (checkbox === null) {
            return
        }

        if (gridController === null) {
            checkbox.parentNode?.removeChild(checkbox)
            console.log("InputCheckBox needs a gridController and the index of the input!")
            return
        }
        if (from === null) {
            checkbox.parentNode?.removeChild(checkbox)
            console.log("InputCheckBox needs an index to draw at!")
            return
        }
        const vType = gridController.getGateTypeView(from[0])
        const gridPos = gridController.getGatePosition(from[0])
        if (vType === undefined || gridPos === undefined) {
            checkbox.parentNode?.removeChild(checkbox)
            console.log("InputCheckBox doesn't link to a valid gate!")
            return
        }
        
        const conOffset = vType.getConnectionPoint("Output", from[1])
        if (conOffset === undefined) {
            checkbox.parentNode?.removeChild(checkbox)
            console.log("InputCheckBox indexes a non-existent connection!")
            return
        }
        const localOffset = [gridPos[0] * 10 + conOffset[0], gridPos[1] * 10 + conOffset[1]]

        const parentRect = checkbox?.parentElement?.getBoundingClientRect()
        if (parentRect !== undefined) {
            margin[0] = parentRect.x
            margin[1] = parentRect.y
        }

        offset = gridController.projectOffset(
            localOffset[0] - 5,
            localOffset[1]
        )

        const position = getPosition()
        if (parentRect === undefined || (
            parentRect !== undefined && //type safety more like stink safety
            (position[0] > parentRect.right || position[1] > parentRect.bottom)
            )
        ) {
            checkbox.hidden = true
        }
        else {
            checkbox.hidden = false
        }
    }
    onMount(async () => {
        await tick()
        setOffset()
        checkbox.checked = startChecked
        onChange()
    })

    window.addEventListener('resize', (e) => {
        setOffset()
    })

    export let onChangeListener = () => {}

    function onChange() {
        if (from === null) {
            return
        }
        gridController?.setInput(from, checkbox.checked)
        circuitPanel?.getRenderer().updateGate(from[0])
        onChangeListener()
    }

    function getPosition() {
        return [
            margin[0] + offset[0],
            margin[1] + offset[1]
        ]
    }

    export function isChecked() {
        return checkbox.checked
    }

</script>

<input 
    type="checkbox" 
    class="input-checkbox" 
    bind:this={checkbox} 
    on:change={onChange}
    style="left:{margin[0] + offset[0]}px; top:{margin[1] + offset[1]}px;"
/>

<style>
    .input-checkbox {
        position: absolute;
        margin: 0px;
        accent-color:var(--connection-color-on);
    }
</style>