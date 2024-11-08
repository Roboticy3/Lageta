<script>
    import { browser } from "$app/environment";
    import { Decoder2t4, Encoder4t2, getGateType, Not, wrapGateTypeViewInSvgHeader } from "$lib/dat/GateTypes/GateTypes";
  import HeavyButton from "../Misc/HeavyButton.svelte";

  const buttonStyle = 
`
  display:flex;
  justify-content:space-between;
  flex-direction:row;
  background:none;
  width:100%;
  margin-top:1vh;
`

  const ExportGateSprite = getGateType(Encoder4t2).view
  const ImportGateSprite = getGateType(Decoder2t4).view
  const DeleteGateSprite = getGateType(Not).view

  const exportKeys = ["CircuitStorage", "ProgressStorage"]
  let exportUrl = ''

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
    return new Blob([`{${exportKeys.map(parseStorageKey).join(',')}\n}`], {type: 'application/json'})
  }

  /**
   * @param {CustomEvent<any>} e
   */
  function onExportPressed(e) {
    const blob = storageToBlob()
    exportUrl = URL.createObjectURL(blob)
  }

  /**
     * @param {Event} e
     */
  function onImportFileSelected(e) {
    
  }

  let importAvailable = false
  /**
   * @type {HTMLInputElement}
   */
  let importElement
  /**
   * @type {HTMLDialogElement}
   */
  let importErrorDialog
  let importErrorReason = ""
  $: if (importErrorDialog) {
    importErrorDialog.close()
  }

  /**
   * @param {CustomEvent<any>} e
   */
  function onImportPressed(e) {
    const file = importElement.files?.item(0)
    if (!file || file.type !== 'application/json') {
      importErrorDialog.show()
      importErrorReason = `File ${file?.name || ""} is missing or not in the right format.`
    }
    
    if (exportUrl !== '') onExportPressed(e) //update the export url if it was already visible
  }

  /**
   * @param {CustomEvent<any>} e
   */
  function onDeletePressed(e) {
    
  }

  function onDelete() {
    URL.revokeObjectURL(exportUrl)
    exportUrl = ''
  }
</script>

<dialog bind:this={importErrorDialog}>
  <div class="options" style="text-align:center; width:25vw;">
    <div class="title" style="font-size: min(5vw, 5vh);">
      Import Failed !
    </div>
    <div>{@html importErrorReason}</div>
    <button on:click={() => importErrorDialog.close()}>Ok</button>
  </div>
</dialog>

<div class="options">
  {#if exportUrl !== ''}
    <div>Finished processing, <a download={"lageta.lagetaprogress"} href={exportUrl}>click here to download.</a></div>
  {/if}
  <HeavyButton style={buttonStyle} on:click={onExportPressed}>
    <div>Export Progress</div>
    {@html wrapGateTypeViewInSvgHeader(
      ExportGateSprite.gridWidth, ExportGateSprite.gridHeight, 
      ExportGateSprite.draw({override:[true]}), `height="20px"`
    )}
  </HeavyButton>
  <input type="file" accept=".lagetaprogress" on:change={onImportFileSelected} bind:this={importElement}/>
  <HeavyButton style={buttonStyle} on:click={onImportPressed}>
    <div>Import Progress</div>
    {@html wrapGateTypeViewInSvgHeader(
      ImportGateSprite.gridWidth, ImportGateSprite.gridHeight, 
      ImportGateSprite.draw({override:[true]}), `height="20px"`
    )}
  </HeavyButton>
  <HeavyButton style={buttonStyle} on:click={onDeletePressed}>
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
