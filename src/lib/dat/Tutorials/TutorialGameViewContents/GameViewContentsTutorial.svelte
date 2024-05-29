
<script>
    import TutorialText from "$lib/components/GameView/Tutorial/TutorialText.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher()

    /**
     * @type {any}
     */
    export let state = {}
</script>

{#if state.currentEvent === 10}
    <TutorialText
        position={[85, 30]}
        on:continue={dispatch.bind(dispatch, 'continue')}
    >   
        <p style="color:black;">
            This is a level.
        </p>
    </TutorialText>
{/if}