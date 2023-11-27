<script>
    export let name = ""

    /**
     * @param {string} s
     * @returns {boolean}
     */
    export let submitFunction = (s) => {
        console.log(s)
        return false
    }

    /**
     * @type {HTMLDialogElement}
     */
    let dialog

    //why do official svelte docs ignore a11y errors? Why is it even there then?
    //from https://svelte.dev/examples/modal
    /**
     * @type {boolean}
     */
    export let visible = false

    /**
     * @type {HTMLFormElement}
     */
    let form

    /**
     * @param {((s:string) => boolean) | undefined} newSubmitFunction 
     * @param {string | undefined} newName
     */
    export function show(newName, newSubmitFunction) {
        if (newName !== undefined) {
            name = newName
        }
        if (newSubmitFunction !== undefined) {
            submitFunction = newSubmitFunction
        }

        dialog.show()
        visible = true
    }

    export function hide() {
        dialog.close()
        visible = false
    }

</script>

<dialog style="height: 25%;"
    bind:this={dialog}
    on:close={() => (visible = false)}
    on:submit={(e) => {
        var formData = new FormData(form)
        const value = formData.get("name")
        if (value instanceof File || value === null) {
            return
        }
        if (submitFunction(value)) {
            dialog.close()
            visible = false
        }
    }}>
    <form class="dialog-form"
        bind:this={form}>
        <input type="text" name="name" required class="dialog-text"/>
        <input type="submit" value={name} class="dialog-submit"/>
        <button class="dialog-quit" 
            on:click={() => {
                dialog.close()
                visible = false
            }}>
            Nevermind!
        </button>
    </form>

    <slot />
</dialog>

<style>
    .dialog-form {
        display:grid;
        grid-template-columns: 20%, 60%, 20%;
        grid-template-rows: 20%, 20%, 60%;
    }

    .dialog-text {
        grid-column: 1 / 2;
        grid-row: 1 / 2;
    }

    .dialog-submit {
        grid-column: 3;
        grid-row: 1;
    }

    .dialog-quit {
        grid-column: 3;
        grid-row: 2;
    }
</style>