
<script>
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";
import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher()

    /**
     * @type {HTMLDialogElement}
     */
    let dialog

    function onClick() {
        dialog.show()
    }

    function skip() {
        dialog.close()
        dispatch('skip')
    }

    const skipTutorialButtonStyle = 
`
    position:absolute;
    transition: top var(--animation-speed);
    top:-5%;
    right:0;
    padding:1%;
    background-color: var(--connection-color-on);
    color:white;
`
    const skipTutorialButtonHoverStyle = 
`
    top:0;
`
</script>

<slot />

<HeavyButton 
    style={skipTutorialButtonStyle} 
    hoverStyle={skipTutorialButtonHoverStyle} 
    on:click={onClick}
>
    Skip Tutorial
</HeavyButton>

<dialog class="skip-tutorial-dialog" bind:this={dialog}>
    Are you sure?
    <div>
        <HeavyButton on:click={skip}>
            Yes
        </HeavyButton>
        <HeavyButton on:click={() => dialog.close()}>
            No
        </HeavyButton>
    </div>
</dialog>

<style>

    .skip-tutorial-dialog {
        position:absolute;
        animation-name: dialog;
        animation-duration: var(--animation-speed);
        top:20%;
        left:50%;
    }

    @keyframes dialog {
        0% {
            top: 50%;
        }
        100% {
            top: 20%;
        }
    }
</style>