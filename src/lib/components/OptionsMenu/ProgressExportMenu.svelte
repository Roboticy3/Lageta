<script>
    import { browser } from "$app/environment";
    import { Decoder2t4, Encoder4t2, getGateType, Not, wrapGateTypeViewInSvgHeader } from "$lib/dat/GateTypes/GateTypes";
    import { onMount, tick } from "svelte";
    import HeavyButton from "../Misc/HeavyButton.svelte";
    import GameViewDialog from "../GameView/Dialogs/GameViewDialog.svelte";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";

  const buttonStyle = 
`
  display:flex;
  justify-content:space-between;
  flex-direction:row;
  width:100%;
  margin-top:1vh;
`

  const ExportGateSprite = getGateType(Encoder4t2).view
  const ImportGateSprite = getGateType(Decoder2t4).view
  const DeleteGateSprite = getGateType(Not).view

  /**
   * @type {Event}
   */
  let simulatedClick 
  $: if (browser) simulatedClick = new MouseEvent("click", {
    "view": window,
    "bubbles": true,
    "cancelable": false
  });

  const exportKeys = ["CircuitStorage", "ProgressStorage", "StickerStorage"]
  let exportUrl = ''
  $: {
    if (exportUrl && exportUrl.length > 0) {
      exportElement.href = exportUrl
      exportElement.dispatchEvent(simulatedClick)
    }
  }

  function hasProgress() {
    const progress = new ProgressStorage()
    return progress.getPassedTutorials().length > 0
  }

  /**
     * @param {string} k
     */
  function parseStorageKey(k) {
    let content = localStorage.getItem(k)
    if (content) {
      content = `\n"${k}": ${content}`
    }
    else
      content = ""
    return content
  }

  function storageToBlob() {
    return new Blob([`{${exportKeys.map(parseStorageKey).filter((s) => s.length > 0).join(',')}\n}`], {type: 'application/json'})
  }

  /**
   * @type {HTMLAnchorElement}
   */
  let exportElement

  /**
   * @param {CustomEvent<any>} e
   */
  async function onExportPressed(e) {
    const blob = storageToBlob()
    exportUrl = URL.createObjectURL(blob)
  }

  /**
   * @param {any} e
   */
   function onImportSelect(e) {
    importElement.dispatchEvent(simulatedClick)
  }

  function getCurrentImportSelection() {
    return importElement.files?.item(0)
  }

  /**
     * @type {HeavyButton}
     */
  let exportButton

  /**
     * @type {HeavyButton}
     */
  let deleteButton

  /**
     * @param {Event | undefined} e
     */
  async function onImportFileSelected(e) {
    const file = getCurrentImportSelection()
    console.log("should import be available?", file)

    file?.text().then((s) => { 
      try {
        //s = s.replaceAll("\n","")
        const obj = JSON.parse(s)
        exportKeys.map(k => [k, JSON.stringify(obj[k])]).filter(([key, value]) => value).forEach(([key, value]) => localStorage.setItem(key, value)) //horrendous
        exportButton.setUnavailable(false)
        deleteButton.setUnavailable(false)
      } catch (e) {
        console.log("PARSER ERROR: ", e, s)
      }
      
    })
  }

  /**
   * @type {HTMLInputElement}
   */
  let importElement

  /**
     * @type {GameViewDialog}
     */
  let confirmDeleteDialog

  /**
   * @param {CustomEvent<any>} e
   */
  function onDeletePressed(e) {
    confirmDeleteDialog.show()
  }

  function onDelete() {

    confirmDeleteDialog.close()

    for (const k of exportKeys) {
      console.log("REMOVING ", k, " FROM LOCAL STORAGE!!")
      localStorage.removeItem(k)
    }

    exportButton.setUnavailable(true)
    deleteButton.setUnavailable(true)
  }

  onMount(() => {
    exportButton.setUnavailable(!hasProgress())
    deleteButton.setUnavailable(!hasProgress())
  })
</script>

<GameViewDialog bind:this={confirmDeleteDialog}>
  <div class="options" style="align-items:center; justify-content:space-between; height:100%;">
    <div class="title" style="font-size: min(5vw, 5vh);">
      Warning
    </div>
    <div>Are you sure you want to delete your data?</div>
    <div style="display:flex; justify-content:space-evenly; width:100%;">
      <button on:click={onDelete}>Yes</button>
      <button on:click={() => confirmDeleteDialog.close()}>Nevermind</button>
    </div>
    
  </div>
</GameViewDialog>

<div style="display:none;">
  <a download={"lageta.lagetaprogress"} href="/" bind:this={exportElement}> </a>
  <input style="display:none;" type="file" accept=".lagetaprogress" on:change={onImportFileSelected} bind:this={importElement} />
</div>

<div class="options">
  <HeavyButton style={buttonStyle} unavailable={true} on:click={onExportPressed}  bind:this={exportButton}>
    <div>Export Progress to File</div>
    {@html wrapGateTypeViewInSvgHeader(
      ExportGateSprite.gridWidth, ExportGateSprite.gridHeight, 
      ExportGateSprite.draw({override:[true]}), `height="20px"`
    )}
  </HeavyButton>
  <HeavyButton style={buttonStyle} on:click={onImportSelect}>
    <div>Import Progress</div>
    {@html wrapGateTypeViewInSvgHeader(
      ImportGateSprite.gridWidth, ImportGateSprite.gridHeight, 
      ImportGateSprite.draw({override:[true]}), `height="20px"`
    )}
  </HeavyButton>
  <HeavyButton style={buttonStyle} unavailable={true} on:click={onDeletePressed} bind:this={deleteButton}>
    <div>Delete Progress</div>
    {@html wrapGateTypeViewInSvgHeader(
      DeleteGateSprite.gridWidth, DeleteGateSprite.gridHeight, 
      DeleteGateSprite.draw(), `height="20px"`
    )}
  </HeavyButton>
</div>

<style>
  .options {
    display:flex;
    flex-direction:column;
    gap:1em;
  }
</style>
