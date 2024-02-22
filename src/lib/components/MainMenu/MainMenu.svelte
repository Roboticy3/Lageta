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
        <div class="options">
            <MainMenuOption path={"campaign"}>Continue</MainMenuOption>
            <MainMenuOption path={"level/Freeplay"} gateType={Or}>Options</MainMenuOption>
        </div>
    </div>
</div>

<style>

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
        margin: 1em;
        font-size: min(20vw, 20vh);
        font-family:monospace;
    }

    .menu {
        width:20%;
        height:30%;
    }
</style>