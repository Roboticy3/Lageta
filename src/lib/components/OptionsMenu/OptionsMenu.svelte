<script>
    import ProgressExportMenu from "./ProgressExportMenu.svelte";
    import VisualOptionsMenu from "./VisualOptionsMenu.svelte";

</script>

<div class="menu-column">
  <div class="title" style="font-size: min(10vw, 10vh);">
    Options
  </div>
  <div class="section">Manage Save Data:</div>
  <div class="smaller">
    <ProgressExportMenu />
  </div>
  <div class="section">Graphics:</div>
  <div class="smaller" style="min-width:fit-content;">
    <VisualOptionsMenu />
  </div>
</div>

<style>
  .smaller {
    width:20%;
    height:50%; 
  }

  .section {
    padding-bottom:2vh;
  }
</style>