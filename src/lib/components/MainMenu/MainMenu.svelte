<script>
    import { Buf, Or, all_gates } from "$lib/circuit_types/Gate";
    import { getGateTypeSvg } from "../GateSvgs.svelte";
    import MainMenuOption from "./MainMenuOption.svelte";

</script>

<div class="full">
    <div class="title">
        Lageta
    </div>
    <div class="menu">
        <div class="options-container">
            <div class="options">
                <MainMenuOption>Continue</MainMenuOption>
                <MainMenuOption>Options</MainMenuOption>
            </div>
        </div>
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

    .full {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .title {
        margin: 5vh;
        margin-top: 10%;
        font-size: max(15vw, 15vh);
        font-family:monospace;
    }
</style>