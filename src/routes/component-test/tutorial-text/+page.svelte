<script>

  import TutorialText from "$lib/components/GameView/Tutorial/TutorialText.svelte";
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";

  $: count = 0

  $: text = false
</script>

<HeavyButton on:click={() => {text = !text}}>toggle text</HeavyButton>
<div>{count}</div>

{#if text}
<TutorialText
  position={[50, 20]}
  initialPosition={[50, 20]}
  on:continue={() => {
    count++
  }}
>
  <div style="color:black; width:25vw;">
      You can add more gates, and this one can be picked up and moved.
  </div>
</TutorialText>
{/if}