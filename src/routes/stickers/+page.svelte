<script>
    import { browser } from "$app/environment";
    import StickerViewer from "$lib/components/GameView/CircuitEditor/Sticker/StickerViewer.svelte";
    import { CowSticker, Sticker } from "$lib/dat/Tools/Tools";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";

    /**
     * @type {ProgressStorage}
     */
    let progressStorage
    $: if (browser) progressStorage = new ProgressStorage()

    /**
     * @type {Array<Sticker> | undefined}
     */
    let stickers
    $: stickers = progressStorage?.getTool("Stickers")?.data.stickers

    /**
     * @type {HTMLInputElement}
     */
    let fileInput

    function onImport() {
        if (!stickers) return

        console.log("importing stickers from ", fileInput.files, "...")

        for (const f of fileInput.files || []) {
            f.text().then(
                (text) => {
                    console.log("reading text ", text)
                    let ob

                    try {
                        ob = JSON.parse(text)
                        console.log("loaded object ", ob)

                        if (!(ob instanceof Array)) return
                    }
                    catch (s) {
                        console.log(s)
                        return
                    }

                    /**
                     * @type {Array<Sticker>}
                     */
                    // @ts-ignore bc filter is too stupid
                    const stickerList = ob.
                        map((o) => Sticker.fromObject(o)).
                        filter(newS => {
                            //check that the read sticker exists (meaning it passed the checks in Sticker.fromObject)
                            //and that it's name is not already registered in the database
                            return newS && !(stickers.find((s) => s.name === newS.name))
                        })

                    console.log("adding stickers ", stickerList)
                    stickers.push(...stickerList)
                    console.log("writing save data...")
                    progressStorage.commit()
                    progressStorage = progressStorage
                }
            )
        }

        
    }

</script>

<div class="container">
    <div class="sticker-list">
        <div>List of Stickers:</div>
        {#if stickers}
            <div style="height:100vh;">
                {#each stickers as sticker}
                    <div style="display:inline-block; height:max({100 / stickers.length}vh, 20vh);">
                        <StickerViewer sticker={sticker} />
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <div class="button-list">
        <input type="file" name="importer" required={true} bind:this={fileInput} accept=".json,.txt"> 
        <button on:click={onImport}>Import Stickers</button>
        <button on:click>Export Stickers</button>
        
    </div>
</div>


<style>
    .container {
        display:flex;
        width:100%;
    }

    .sticker-list {
        height:100vh;
        display:inline-block;
        flex-grow: 2;
    }

    .button-list {
        display:flex;
        flex-direction: column;
    }

    
</style>
