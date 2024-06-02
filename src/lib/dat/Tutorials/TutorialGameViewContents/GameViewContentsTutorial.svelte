<script>
    import TutorialText from "$lib/components/GameView/Tutorial/TutorialText.svelte";
    import { createCustomEvent } from "$lib/misc_types/CustomEventSystem";
    import { TutorialEventSequenceController } from "$lib/tutorial_types/TutorialEventSequence";
    import { createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher();

    /**
     * @type {any}
     */
    export let state = {};

    /**
     * Make sure the play button is disabled for step 10
     * @type {TutorialEventSequenceController}
     */
    export let eventStagesController;
    onMount(() => {
        eventStagesController.eventSequenceTarget.addEventListener(
            "preparenext",
            (evt) => {
                if (state.currentEvent <= 10) {
                    document.querySelector('#signal-play-button')?.setAttribute('disabled', 'disabled')
                    document.querySelector('#signal-play-button')?.classList.add('unavailable')
                }
                else {
                    document.querySelector('#signal-play-button')?.removeAttribute('disabled')
                    document.querySelector('#signal-play-button')?.classList.remove('unavailable')
                }
            },
        );
    });

    function onContinue() {
        // @ts-ignore
        eventStagesController.tutorialEventTarget.dispatchEvent(createCustomEvent({}, "continue"))
    }

    async function delayedContinue() {
        const delay = () => {return new Promise((resolve) => {setTimeout(resolve, 5000)})}
        await delay()
        onContinue()
    }
</script>

{#if state.currentEvent === 19}
    <TutorialText
        position={[20, 90]}
        initialPosition={[20,90]}
        showButton={false}
    >
    <div style="color:black;" use:delayedContinue>
        ...
    </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 18}
    <TutorialText
        position={[35, 90]}
        initialPosition={[85, 20]}
        showButton={false}
    >
    <div style="color:black;">
        Let's see if the circuit works now! (press play)
    </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 17}
    <TutorialText
        position={[85, 20]}
        initialPosition={[85, 30]}
        on:continue={dispatch.bind(dispatch, "continue")}
    >
    <div style="color:black; width:25vw;">
        Ok, the gate is now in the circuit. You can add more gates, or pick this one up and move it.
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

{#if state.currentEvent === 12}
    <TutorialText
        position={[20, 90]}
        initialPosition={[20,90]}
        showButton={false}
    >
    <div style="color:black;" use:delayedContinue>
        ...
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
