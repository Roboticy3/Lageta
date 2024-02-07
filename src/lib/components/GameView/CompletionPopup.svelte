<script>
    import { onMount } from "svelte";

    /**
     * @type {string[]}
     */
    export let unlocks = []

    /**
     * @type {HTMLDialogElement}
     */
    let dialog

    let visible = false

    export function show() {
        dialog.show()
        visible = true
    }

    export function hide() {
        dialog.close()
        visible = false
    }
</script>

<dialog bind:this={dialog}>
    Congradulations!
    <div>
        Unlocks:
        <ul>
            {#each unlocks as unlock}
            <li>{unlock}</li>
            {/each}
        </ul>
    </div>
</dialog>

<style>
    dialog {
        height: 50%;
        width: 50%;
        top: 20%;
        font-size: 100%;
        animation-name: dialog;
        animation-duration: 1s;
        overflow-y: hidden;
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