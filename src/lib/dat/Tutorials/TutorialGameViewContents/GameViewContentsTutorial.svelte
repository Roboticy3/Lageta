<script>
    import TutorialText from "$lib/components/GameView/Tutorial/TutorialText.svelte";
    import { TutorialEventSequenceController } from "$lib/tutorial_types/TutorialEventSequence";
    import { createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher();

    /**
     * @type {any}
     */
    export let state = {};

    /**
     * Add a non-linear event to the tutorial where the user can skip pressing continue if they press play on the signal first
     * @type {TutorialEventSequenceController}
     */
    export let eventStagesController;
    onMount(() => {
        eventStagesController.signalEventTarget.addEventListener(
            "step",
            (evt) => {
                if (state.currentEvent === 10 && evt.frame >= 50) {
                    eventStagesController.prepareNextEvent(evt, 3);
                }
            },
        );
    });
</script>

{#if state.currentEvent === 17}
    <TutorialText
        position={[25, 25]}
        initialPosition={[85,20]}
        on:continue={dispatch.bind(dispatch, "continue")}
        showButton={false}
    >
        <div style="color:black; width:25vw;">
            Ok, the gate is now in the circuit. You can add more gates, or pick this one up and move it.
        </div>
    </TutorialText>
    <TutorialText
        position={[20, 80]}
        initialPosition={[85,20]}
        on:continue={dispatch.bind(dispatch, "continue")}
        showButton={false}
    >
        <div style="color:black; width:25vw;">
            Press play to see how the circuit works now!
        </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 16}
    <TutorialText
        position={[85, 20]}
        initialPosition={[50,20]}
        on:continue={dispatch.bind(dispatch, "continue")}
        showButton={false}
    >
        <div style="color:black; width:25vw;">
            You've picked up a gate. Click anywhere in the circuit to place the gate.
        </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 14}
    <TutorialText
        position={[50, 20]}
        on:continue={dispatch.bind(dispatch, "continue")}
        showButton={true}
    >
        <div style="color:black; white-space: nowrap;">
            <div>Looks like this circuit isn't correct.</div>
            <div>But flipping the input manually seems like a pain...</div>
            <div>
                To match the signal, we can <span style="font-style:italic;"
                    >transform</span
                > the input to match the expected output.
            </div>
        </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 11}
    <TutorialText
        position={[50, 85]}
        initialPosition={[85,30]}
        on:continue={dispatch.bind(dispatch, "continue")}
        showButton={false}
    >
        <div style="color:black; white-space: nowrap;">
            <div>This is the Signal. Press the play button</div>
            <div>to see what happens in the circuit.</div>
        </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 10}
    <TutorialText
        position={[85, 30]}
        on:continue={dispatch.bind(dispatch, "continue")}
        availableButton={!state.signalPlaying}
    >
        <p style="color:black; width:150%;">This is a level.</p>
    </TutorialText>
{/if}
