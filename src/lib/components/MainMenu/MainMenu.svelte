<script>
    import { browser } from "$app/environment";
    import { Decoder2t4, Or, getGateType } from "$lib/dat/GateTypes/GateTypes";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import MainMenuOption from "./MainMenuOption.svelte";

    let currentTutorial = browser ? new ProgressStorage().getCurrentTutorial() : ""

</script>

<div class="full">
    <div class="title">
        Lageta
    </div>
    <div class="menu">
        <div class="options">
            
            {#if currentTutorial !== ""}
                <MainMenuOption path={`tutorial/${currentTutorial}`}>Continue</MainMenuOption>
            {:else}
                <MainMenuOption path={`campaign`}>Continue</MainMenuOption>
                <MainMenuOption path={`tutorial/`} vType={getGateType(Decoder2t4).view}>Tutorials</MainMenuOption>
            {/if}
            <MainMenuOption path={"level/Freeplay"} vType={getGateType(Or).view}>Options</MainMenuOption>
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