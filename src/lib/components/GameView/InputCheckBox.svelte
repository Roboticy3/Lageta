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

        if (gridController === null || from === null) {
            checkbox.parentNode?.removeChild(checkbox)
            console.log("InputCheckBox needs a gridController and the index of the input!")
            return
        }

        const localOffset = gridController.getConnectionPoint({
            id:from[0],
            type:"Output",
            index:from[1]
        })

        const parentRect = checkbox?.parentElement?.getBoundingClientRect()
        if (parentRect !== undefined) {
            margin[0] = parentRect.x
            margin[1] = parentRect.y
        }

        offset = gridController.projectOffset(
            localOffset[0] - gridController.getGridCellOffset() - 5,
            localOffset[1] - 5
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
        circuitPanel?.updateSvg()
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