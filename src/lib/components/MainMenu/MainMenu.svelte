<script>
    import { Or, getGateType } from "$lib/dat/GateTypes/GateTypes";
    import MainMenuOption from "./MainMenuOption.svelte";

</script>

<div class="full">
    <div class="title">
        Lageta
    </div>
    <div class="menu">
        <div class="options">
            <MainMenuOption path={"campaign"} name="Continue">Continue</MainMenuOption>
            <MainMenuOption path={"level/Freeplay"} vType={getGateType(Or).view} name="Options">Options</MainMenuOption>
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
        width:100%;
        height:100%;
        background-color: var(--main-bg-color);
    }

    .title {
        margin: 1em;
        font-size: min(20vw, 20vh);
        color:var(--text-color);
        text-shadow: 0.03em 0.03em var(--connection-color-on), -0.03em -0.03em var(--connection-color-off);
    }

    .menu {
        width:20%;
        height:30%;
        
    }
</style>