<script>
    import { Decoder2t4, Encoder4t2, getGateType, Not, wrapGateTypeViewInSvgHeader } from "$lib/dat/GateTypes/GateTypes";
  import HeavyButton from "../Misc/HeavyButton.svelte";

  const buttonStyle = 
`
  display:flex;
  justify-content:space-between;
  flex-direction:row;
  background:none;
  height:25px;
  width:20%;
  margin-top:1vh;
`

  const ExportGateSprite = getGateType(Encoder4t2).view
  const ImportGateSprite = getGateType(Decoder2t4).view
  const DeleteGateSprite = getGateType(Not).view

  /**
   * @param {CustomEvent<any>} e
   */
  function onExportPressed(e) {

  }
</script>
<HeavyButton style={buttonStyle} on:click={onExportPressed}>
  <div>Export Progress</div>
  {@html wrapGateTypeViewInSvgHeader(
    ExportGateSprite.gridWidth, ExportGateSprite.gridHeight, 
    ExportGateSprite.draw({override:[true]}), `height="20px"`
  )}
</HeavyButton>
<HeavyButton style={buttonStyle} on:click={onExportPressed}>
  <div>Import Progress</div>
  {@html wrapGateTypeViewInSvgHeader(
    ImportGateSprite.gridWidth, ImportGateSprite.gridHeight, 
    ImportGateSprite.draw({override:[true]}), `height="20px"`
  )}
</HeavyButton>
<HeavyButton style={buttonStyle} on:click={onExportPressed}>
  <div>Delete Progress</div>
  {@html wrapGateTypeViewInSvgHeader(
    DeleteGateSprite.gridWidth, DeleteGateSprite.gridHeight, 
    DeleteGateSprite.draw(), `height="20px"`
  )}
</HeavyButton>
