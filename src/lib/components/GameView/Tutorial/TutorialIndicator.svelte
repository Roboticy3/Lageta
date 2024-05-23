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

    export let smooth = true

    /**
     * @type {CircuitDiv}
     */
    let container

     /**
     * @param {[number, number]} newPosition
     */
      export function setPosition(newPosition) {
        position = newPosition
        container.setPosition(newPosition)
    } 

</script>
<CircuitDiv
    bind:this={container}
    circuitController={circuitController}
    position={position}
    size={[0.75, 0.75]}
    active={true}
    bob={true}
    smooth={smooth}
>
    <div style="justify-content:center;">
        <p>click me!</p>
        <p>|</p>
        <p>V</p>
    </div>
    
</CircuitDiv>