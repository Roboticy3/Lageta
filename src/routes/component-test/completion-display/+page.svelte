<script>
    import CompletionDisplay from "$lib/components/GameView/Dialogs/CompletionDisplay.svelte";
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";

  /**
     * @type {HTMLInputElement}
     */
  let newGateInputElement

  /**
     * @type {string[]}
     */
  let newGates = []
  
</script>

<input type="text" bind:this={newGateInputElement}/>
<HeavyButton on:click={() => {newGates.push(newGateInputElement.value); newGates = newGates}}>Submit</HeavyButton>

<CompletionDisplay newGates={newGates} newLevels={[]} newTools={[]} />