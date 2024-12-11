<script>
    import { browser } from "$app/environment";
    import StickerViewer from "$lib/components/GameView/CircuitEditor/Sticker/StickerViewer.svelte";
    import { BoredomSticker, CowSticker, FrogSticker } from "$lib/dat/Tools/Tools";
import { Sticker, StickerType } from "$lib/circuit_types/sticker/Sticker";    import { ProgressStorage } from "$lib/storage_types/ProgressStore";
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";
    import { StickerStorage } from "$lib/storage_types/StickerStorage";
    import GameViewDialog from "$lib/components/GameView/Dialogs/GameViewDialog.svelte";
    /**
     * @type {ProgressStorage}
     */
    let progressStorage
    $: if (browser) progressStorage = new ProgressStorage()

    /**
     * @type {{ name: string; data: any; } | undefined}
     */
    let stickerTool
    /**
     * @type {Array<StickerType> | undefined}
     */
    let stickers
    $: stickerTool = progressStorage?.getTool("Stickers")
    $: stickers = stickerTool?.data.stickers
    $: console.log("stickers updated  : ", stickers)

    /**
     * @type {HeavyButton}
     */
    let exportButton
    /**
     * @type {HeavyButton}
     */
    let importButton
    /**
     * @type {HeavyButton}
     */
    let deleteButton

    /**
     * @type {HTMLInputElement}
     */
    let importElement

    /**
     * @type {Event}
     */
    let simulatedClick 
    $: if (browser) simulatedClick = new MouseEvent("click", {
        "view": window,
        "bubbles": true,
        "cancelable": false
    });

    /**
   * @param {any} e
   */
   function onImportSelect(e) {
    importElement.dispatchEvent(simulatedClick)
  }

  function getCurrentImportSelection() {
    return importElement.files?.item(0)
  }

  async function onImportFileSelected() {
    if (!stickers) stickers = []

    lastImportErrors.overlappingNames = []
    lastImportErrors.missingFields = []
    lastImportErrors.noArray = false
    lastImportErrors = lastImportErrors

    const file = getCurrentImportSelection()


    file?.text().then((s) => { 
        if (!stickerTool) return

        /**
         * @type {any}
         */
        let obj = undefined

        try {
            //s = s.replaceAll("\n","")
            obj = JSON.parse(s)
            exportButton.setUnavailable(false)
        } catch (e) {
            console.log("sticker PARSER ERROR: ", e, s)
        }

        if (!obj) return

        /**
         * @type {Array<StickerType>}
         */
        const stickerList = obj.
            map((/** @type {any} */ o) => {
                const result = StickerType.fromObject(o)

                if (!o.name && o.url) {
                    lastImportErrors.missingFields.push("url: " + o.url)
                }
                else if (!o.url && o.name) {
                    lastImportErrors.missingFields.push("name: " + o.name)
                }

                return result
            }).
            filter((/** @type {any} */ newS) => {
                //check that the read sticker exists (meaning it passed the checks in Sticker.fromObject)
                //and that it's name is not already registered in the database
                const nameExists = newS ? (stickers?.find((s) => s.name === newS.name)) : false

                if (nameExists && newS) {
                    lastImportErrors.overlappingNames.push(newS.name)
                }

                return newS && !nameExists
            })

        lastImportErrors = lastImportErrors

        console.log("adding stickers ", stickerList)
        stickers?.push(...stickerList)
        stickerTool.data.stickers = stickers
        stickerTool = stickerTool 
        console.log("writing save data...", stickers)
        progressStorage.commit()
        progressStorage = progressStorage

    })

    }

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

    /**
     * @type {string | null}
     */
    let exportUrl = null

    /**
     * @type {HTMLAnchorElement}
     */
    let exportElement
    $: if (exportUrl) {
        exportElement.href = exportUrl
        exportElement.dispatchEvent(simulatedClick)
    }

    /**
     * 
     * @param {Array<StickerType>} stickerList
     */
    function getExportBlob(stickerList) {

        const text = JSON.stringify(stickerList)
        console.log("printing stickers", text, "to json")

        return new Blob([text], {type:"application/json"})
    }

    /**
     * @param {CustomEvent<any>} e
     */
    async function onExportPressed(e) {
        if (!stickers) return
        const blob = getExportBlob(stickers)
        exportUrl = URL.createObjectURL(blob)
    }

    /**
     * @type {GameViewDialog}
     */
    let confirmDeleteDialog

    /**
     * @param {any} e
     */
    async function onDeletePressed(e) {
        confirmDeleteDialog.show()
    }

    function onDelete() {

        confirmDeleteDialog.close()

        if (stickerTool) {
            console.log("deleting stickers... ", stickers)
            stickerTool.data.stickers = undefined
            stickerTool = stickerTool
            console.log("writing save data...")
            progressStorage.commit()
            progressStorage = progressStorage
        }

        exportButton.setUnavailable(true)
        deleteButton.setUnavailable(true)
    }

    const buttonStyle = 
    `
    display:flex;
    justify-content:space-between;
    flex-direction:row;
    width:100%;
    margin-top:1vh;
    `

</script>

<GameViewDialog bind:this={confirmDeleteDialog}>
    <div class="options" style="align-items:center; justify-content:space-between; height:100%;">
      <div class="title" style="font-size: min(5vw, 5vh);">
        Warning
      </div>
      <div>Are you sure you want to delete your stickers?</div>
      <div style="display:flex; justify-content:space-evenly; width:100%;">
        <button on:click={onDelete}>Yes</button>
        <button on:click={() => confirmDeleteDialog.close()}>Nevermind</button>
      </div>
      
    </div>
  </GameViewDialog>

<div style="display:none;">
    <a download={"lageta.stickers"} href="/" bind:this={exportElement}> </a>
    <input type="file" accept=".stickers" on:change={onImportFileSelected} bind:this={importElement} />
</div>


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
        <HeavyButton style={buttonStyle} unavailable={stickers === undefined} on:click={onExportPressed}  bind:this={exportButton}>
            <div>Export Stickers to File</div>
            <div style="height:20px;">
              <StickerViewer sticker={CowSticker}/>
          </div>
          </HeavyButton>
          <HeavyButton style={buttonStyle} on:click={onImportSelect}>
            <div>Import Stickers</div>
            <div style="height:20px;">
              <StickerViewer sticker={FrogSticker}/>
            </div>
          </HeavyButton>
          {#if lastImportErrors.overlappingNames.length > 0}
            <p style="color:var(--failure-color);">Last import had stickers that already existed: {JSON.stringify(lastImportErrors.overlappingNames)}</p>
            {/if}
            {#if lastImportErrors.missingFields.length > 0}
                <p style="color:var(--failure-color);">Last import had stickers with missing data: {JSON.stringify(lastImportErrors.missingFields)}</p>
            {/if}
            {#if lastImportErrors.noArray}
                <p style="color:var(--failure-color);">Last import did not contain a top-level list! Importer does not search for lists nested in other objects.</p>
            {/if}
        <HeavyButton style={buttonStyle} unavailable={stickers === undefined} on:click={onDeletePressed} bind:this={deleteButton}>
            <div>Delete Progress</div>
            <div style="height:20px;">
                <StickerViewer sticker={BoredomSticker}/>
              </div>
            </HeavyButton>
        
    </div>
</div>


<style>
    .container {
        display:flex;
        width:100%;
        overflow:hidden;
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

    .options {
        display:flex;
        flex-direction:column;
        gap:1em;
    }

    
</style>
