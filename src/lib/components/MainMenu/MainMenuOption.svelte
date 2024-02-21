<script>
    import { Buf } from "$lib/circuit_types/Gate";
    import { getGateTypeSvg } from "../GateSvgs.svelte";

    export let gateType = Buf
</script>

<button class="option">
    {@html getGateTypeSvg(gateType, "height:100%;vertical-align:sub;")} 
    <div class="option-text">
        <slot />
    </div>
</button>

<style>
    .option {
        display:flex;
        justify-content:space-evenly;
        flex-direction:row;
        height:5vh;
        background:none;
    }
    .option:hover {
        background:grey;
    }
    .option-text {
        font-family: monospace;
        font-size: 4vh;
        height:100%;
    }
</style>