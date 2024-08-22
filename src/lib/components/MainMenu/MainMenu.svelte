<script>
    import { browser } from "$app/environment";
    import { And, Decoder2t4, Or, getGateType } from "$lib/dat/GateTypes/GateTypes";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import { onMount } from "svelte";
    import MainMenuOption from "./MainMenuOption.svelte";
    import { CowSticker } from "$lib/dat/Tools/Tools";

    /**
     * @type {string}
     */
    let currentTutorial = ""
    let stickersUnlocked = false

    /**
     * @type {ProgressStorage}
     */
    let progressStorage
    $: if (browser) progressStorage = new ProgressStorage()

    $: {
        currentTutorial = progressStorage?.getCurrentTutorial() || ""
        stickersUnlocked = progressStorage?.findTool("Stickers") !== undefined
    }

</script>

<div class="full">
    <div class="title">
        Lageta
    </div>
    <div class="menu">
        <div class="options">

            <!--If there's an avilable tutorial, force the user to go through it--> 
            {#if currentTutorial !== ""}
                <MainMenuOption path={`tutorial/${currentTutorial}`}>Tutorial</MainMenuOption>
            <!--If there's no tutorial, let the user browse old ones-->
            {:else}
                <MainMenuOption path={`campaign`}>Continue</MainMenuOption>
                <MainMenuOption path={`tutorial/`} vType={getGateType(And).view}>Tutorials</MainMenuOption>
            {/if}

            <MainMenuOption path={"level/Freeplay"} vType={getGateType(Or).view}>Options</MainMenuOption>

            {#if stickersUnlocked} 
                <MainMenuOption path={'stickers'} spriteMode="Sticker" >Stickers</MainMenuOption>
            {/if}

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