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
   * @param {CustomEvent<any>} e
   */
  function onImportPressed(e) {
    onExportPressed(e)
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

<div class="options">
  <HeavyButton style={buttonStyle} on:click={onExportPressed}>
    <div>Export Progress</div>
    {@html wrapGateTypeViewInSvgHeader(
      ExportGateSprite.gridWidth, ExportGateSprite.gridHeight, 
      ExportGateSprite.draw({override:[true]}), `height="20px"`
    )}
  </HeavyButton>
  {#if exportUrl !== ''}
    <div>Finished processing, <a download={"progress.json"} href={exportUrl}>click here to download.</a></div>
  {/if}
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
