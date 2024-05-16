<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";


    import CircuitDiv from "../CircuitDiv.svelte";

    /**
     * @type {CircuitController}
     */
    export let circuitController
    
    /**
     * @type {[number, number]}
     */
    export let position

</script>
<CircuitDiv
    circuitController={circuitController}
    position={position}
    size={[0.75, 0.75]}
    active={true}
    bob={true}
>
    <div style="justify-content:center;">
        <p>click me!</p>
        <p>|</p>
        <p>V</p>
    </div>
    
</CircuitDiv>