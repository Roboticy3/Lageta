<script>
  import { browser } from "$app/environment";
  import GameView from "$lib/components/GameView/GameView.svelte";
  import LevelTemplate from "$lib/components/GameView/LevelTemplate.svelte";
  import { HalfAdder } from "$lib/dat/GateTypes/GateTypes";
  import { getLevelFromParams, MulLevel } from "$lib/dat/Levels/Levels";
  import { ShelfTreeNode } from "$lib/dat/Shelf/ShelfTree";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";

  $: level = browser ? getLevelFromParams(MulLevel):undefined

  //add a custom progress upon visiting this level:
  //change the truth table labels from high/low to 1/0
  let ready = false
  $: if (browser) {
    const progress = new ProgressStorage()
    const toolProgress = progress.getTool("TruthTable")
    if (toolProgress) {
      toolProgress.data = {highText:"1", lowText:"0"}
    }
    progress.commit()
    ready = true
  }

</script> 
{#if ready}
<LevelTemplate allParams={{gameParams:level?.unpack()}} levelName={MulLevel.params?.name}/>
{/if}