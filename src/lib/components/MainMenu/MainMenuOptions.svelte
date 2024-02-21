<script>
    import { Buf, Or, all_gates } from "$lib/circuit_types/Gate";
    import { getGateTypeSvg } from "../GateSvgs.svelte";

</script>

<div class="options-container">
    <div class="options">
        <button class="option">
            {@html getGateTypeSvg(Buf, "height:100%;vertical-align:sub;")} 
            <div class="option-text">
                Continue
            </div>
        </button>
        <button class="option">
            {@html getGateTypeSvg(Or, "height:100%;vertical-align:sub;")} 
            <div class="option-text">
                Options
            </div>
        </button>
    </div>
</div>

<style>

    .options-container {
        width: 100%;
    }

    .options {
        display:flex;
        flex-direction:column;
        gap:1em;
    }

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