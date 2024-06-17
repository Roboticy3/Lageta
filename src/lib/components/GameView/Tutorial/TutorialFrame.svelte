
<script>
    import { createEventDispatcher } from "svelte";


    /**
     * @type {string}
     */
    export let tutorial

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
</script>

<slot />

<button class="skip-tutorial-button" on:click={onClick}>
    Skip Tutorial
</button>

<dialog class="skip-tutorial-dialog" bind:this={dialog}>
    Are you sure?
    <div>
        <button on:click={skip}>
            Yes
        </button>
        <button on:click={() => dialog.close()}>
            No
        </button>
    </div>
</dialog>

<style>
    .skip-tutorial-button {
        position:absolute;
        transition: top var(--animation-speed);
        top:-5%;
        right:0;
        padding:1%;
        background-color: var(--connection-color-on);
        color:white;
    }

    .skip-tutorial-button:hover {
        top:0;
    }

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