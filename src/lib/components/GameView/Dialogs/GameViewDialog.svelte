<script>
    /**
     * @type {HTMLDialogElement}
     */
    let dialog

    let visible = false

    export function show() {
        dialog.show()
        visible = true
    }

    export function close() {
        dialog.close()
        visible = false
    }
</script>

<dialog bind:this={dialog}>
    <slot />
</dialog>

<style>
    dialog {
        height: 50%;
        width: 50%;
        top: 20%;
        font-size: 100%;
        animation-name: dialog;
        animation-duration: var(--animation-speed);
        overflow-y: scroll;
        border:4px ridge black;
        z-index: 10000; /* yucky, but makes sure the dialog properly draws over filtered elements like unavailable HeavyButtons*/
    }

    @keyframes dialog { /* Nice slide in from the bottom */
        0% {
            top: 50%;
        }
        100% {
            top: 20%;
        }
    }
</style>