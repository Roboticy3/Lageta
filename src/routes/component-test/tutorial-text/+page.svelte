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
    >
    <div style="color:black; width:25vw; pointer-events:all;">
        <div>Click on gates to pick them up and move them around. </div>
        <div>You can also hold shift (
            <span style="margin-left:-0.5em; margin-right:-1em;">
                <svg style="display:inline; width:2.5em; vertical-align: bottom;" height=1em viewBox="0 0 100 50" fill="none">
                    <rect width="100" height="50" rx="15" fill="black"/>
                    <rect x=5 y=5 width="90" height="40" rx="15" stroke="white" stroke-width=3/>
                    <g transform="translate(25 0)">
                      <path d="M 20 40 L 30 40 L 30 20 L 35 20 L 25 10 L 15 20 L 20 20 Z" stroke="white" stroke-width=3/>
                    </g>
                    
                </svg>
            </span> 
        ) while clicking to delete gates. </div>
    </div>
    </TutorialText>
{/if}