
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
        <p style="color:black; width:150%;">
            This is a level.
        </p>
    </TutorialText>
{/if}

{#if state.currentEvent === 11}
    <TutorialText
        position={[50, 85]}
        on:continue={dispatch.bind(dispatch, 'continue')}
        showButton={false}
    >   
        <div style="color:black; white-space: nowrap;">
            <div>This is the Signal. Press the play button</div>
            <div>to see what happens in the circuit.</div>
        </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 13}
    <TutorialText
        position={[30, 25]}
        on:continue={dispatch.bind(dispatch, 'continue')}
        showButton={false}
    >   
        <div style="color:black; white-space: nowrap;">
            <div>As the signal changes, it sends voltage to the input</div>
            <div>But also expects a certain output from the circuit</div>
        </div>
    </TutorialText>
{/if}