
<script>
    import TutorialText from "$lib/components/GameView/Tutorial/TutorialText.svelte";
    import { TutorialEventSequenceController } from "$lib/tutorial_types/TutorialEventSequence";
    import { createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher()

    /**
     * @type {any}
     */
    export let state = {}

    /**
     * Add a non-linear event to the tutorial where the user can skip pressing continue if they press play on the signal first
     * @type {TutorialEventSequenceController}
     */
    export let eventStagesController
    onMount(() => {
        eventStagesController.signalEventTarget.addEventListener("step", (evt) => {
            if (state.currentEvent === 10 && evt.frame >= 50) {
                eventStagesController.prepareNextEvent(evt, 3)
            }
            console.log("skipping to", state.currentEvent)
        })
    })
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