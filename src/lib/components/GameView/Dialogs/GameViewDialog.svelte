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

    export function hide() {
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