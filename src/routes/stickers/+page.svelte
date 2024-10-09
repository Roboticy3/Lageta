<script>
    import { browser } from "$app/environment";
    import StickerViewer from "$lib/components/GameView/CircuitEditor/Sticker/StickerViewer.svelte";
    import { CowSticker } from "$lib/dat/Tools/Tools";
import { StickerType } from "$lib/circuit_types/sticker/Sticker";    import { ProgressStorage } from "$lib/storage_types/ProgressStore";

    /**
     * @type {ProgressStorage}
     */
    let progressStorage
    $: if (browser) progressStorage = new ProgressStorage()

    /**
     * @type {Array<StickerType> | undefined}
     */
    let stickers
    $: stickers = progressStorage?.getTool("Stickers")?.data.stickers

    /**
     * @type {HTMLInputElement}
     */
    let fileInput

    let lastImportErrors = {
        /**
         * @type {string[]}
        */
        overlappingNames:[],
        /**
         * @type {string[]}
        */
        missingFields:[],
        noArray:false
    }

    function onImport() {
        if (!stickers) return

        console.log("importing stickers from ", fileInput.files, "...")

        lastImportErrors.overlappingNames = []
        lastImportErrors.missingFields = []
        lastImportErrors.noArray = false
        lastImportErrors = lastImportErrors

        for (const f of fileInput.files || []) {
            f.text().then(
                (text) => {
                    console.log("reading text ", text)
                    let ob

                    try {
                        ob = JSON.parse(text)
                        console.log("loaded object ", ob)

                        if (!(ob instanceof Array)) {
                            lastImportErrors.noArray = true
                            lastImportErrors = lastImportErrors
                            return
                        }
                    }
                    catch (s) {
                        console.log(s)
                        return
                    }

                    /**
                     * @type {Array<StickerType>}
                     */
                    // @ts-ignore bc filter is too stupid
                    const stickerList = ob.
                        map((o) => {
                            const result = StickerType.fromObject(o)

                            if (!o.name && o.url) {
                                lastImportErrors.missingFields.push("url: " + o.url)
                            }
                            else if (!o.url && o.name) {
                                lastImportErrors.missingFields.push("name: " + o.name)
                            }

                            return result
                        }).
                        filter(newS => {
                            //check that the read sticker exists (meaning it passed the checks in Sticker.fromObject)
                            //and that it's name is not already registered in the database
                            const nameExists = newS ? (stickers.find((s) => s.name === newS.name)) : false

                            if (nameExists && newS) {
                                lastImportErrors.overlappingNames.push(newS.name)
                            }

                            return newS && !nameExists
                        })
                    
                    lastImportErrors = lastImportErrors

                    console.log("adding stickers ", stickerList)
                    stickers.push(...stickerList)
                    console.log("writing save data...")
                    progressStorage.commit()
                    progressStorage = progressStorage
                }
            )
        }
    }

    /**
     * 
     * @param {Array<StickerType>} stickerList
     */
    function exportStickers(stickerList) {

        const text = JSON.stringify(stickerList)
        console.log("printing stickers", text, "to json")

        const blob = new Blob([text], {type:"application/json"})
        return window.URL.createObjectURL(blob)
    }

    $: currentExport = stickers ? exportStickers(stickers) : ""

    function onExport() {
        location.href = currentExport
    }

</script>

<div class="container">
    <div class="sticker-list">
        <div>List of Stickers:</div>
        {#if stickers}
            <div style="height:100vh;">
                {#each stickers as sticker}
                    <div style="display:inline-block; height:25vh;">
                        <StickerViewer sticker={sticker} />
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <div class="button-list">
        <p>Select a file below, then click "Import Stickers" to load them in!</p>
        <input type="file" name="importer" required={true} bind:this={fileInput} accept=".json,.txt"> 
        <button on:click={onImport}>Import Stickers</button>
        <p>The file must be a .json file containing a list of objects with names and urls.</p>
        <p>Stickers must have names and urls to be imported.</p>
        <p>If you try to import a sticker with a name that already exists, or that is missing a name or url, that sticker will be ignored.</p>
        {#if lastImportErrors.overlappingNames.length > 0}
            <p style="color:var(--failure-color);">Last import had stickers that already existed: {JSON.stringify(lastImportErrors.overlappingNames)}</p>
        {/if}
        {#if lastImportErrors.missingFields.length > 0}
            <p style="color:var(--failure-color);">Last import had stickers with missing data: {JSON.stringify(lastImportErrors.missingFields)}</p>
        {/if}
        {#if lastImportErrors.noArray}
            <p style="color:var(--failure-color);">Last import did not contain a top-level list! Importer does not search for lists nested in other objects.</p>
        {/if}
        <p>Click below to download your current stickers to a file.</p>
        <button on:click={onExport}>Download Stickers</button>
        
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
        flex: 2;
    }

    .button-list {
        display:flex;
        flex-direction: column;
        
        flex:1;
    }

    
</style>
