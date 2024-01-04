<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";

    export let offsetX = 0
    export let offsetY = 0
    export let gateId = 0
    export let circuitController = new CircuitController()

    
</script>

<div class="signal" style="left:{offsetX}px; top:{offsetY}px">
    abogus
</div>

<style>
    .signal {
        background-color: white;
        width: 30%;
        aspect-ratio: 7;
        position: absolute;
    }
</style>