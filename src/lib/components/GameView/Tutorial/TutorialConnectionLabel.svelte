<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { onMount } from "svelte";
    import CircuitDiv from "../CircuitDiv.svelte";

    /**
     * @type {CircuitController}
     */
    export let circuitController
    /**
     * @type {import("$lib/circuit_types/CircuitController").ConnectionIndex}
     */
    export let index
    /**
     * @type {import("$lib/circuit_types/GateType").ConnectionValue}
     */
    let value = undefined

    circuitController.addGraphListener("update", ({id}) => {
        if (id === index.id) {
            value = circuitController.getConnectionValue(index)
        }
    })

    const valueLabelOptions = new Map([
        [true, `<p style="color:var(--connection-color-on);">high</p>`],
        [false, `<p style="color:var(--connection-color-off);">low</p>`],
        [undefined, `<p style="color:var(--connection-color-x);">neither</p>`]
    ])

    export let adjust = [-0.5, -0.5]

    /**
     * @type {[number, number]}
     */
    let position = [0, 0]
    function setPosition() {
        const connectionPointOffset = circuitController.getConnectionPoint(index)
        const gPos = circuitController.getGatePosition(index.id)
        if (!connectionPointOffset || !gPos) return
        const totalPosition = [gPos[0] + connectionPointOffset[0] / 10, gPos[1] + connectionPointOffset[1] / 10]
        position = [totalPosition[0] + adjust[0], totalPosition[1] + adjust[1]]
    }

    onMount(() => {
        setPosition()
        value = circuitController.getConnectionValue(index)
    })
</script>

<CircuitDiv 
    position={position} 
    circuitController={circuitController}
    size={[1, 0.5]}
    active={true}
>
    <div style="font-size:min(2vh, 2vw);">
        {@html valueLabelOptions.get(value)}
    </div>
    
</CircuitDiv>