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
            async (evt) => {
                if (state.currentEvent <= 10) {
                    document.querySelector('#signal-play-button')?.setAttribute('disabled', 'disabled')
                    document.querySelector('#signal-play-button')?.classList.add('unavailable')
                }
                else {
                    document.querySelector('#signal-play-button')?.removeAttribute('disabled')
                    document.querySelector('#signal-play-button')?.classList.remove('unavailable')
                }

                switch (state.currentEvent) {
                    case 12:
                    case 19:
                    case 25:
                        await delayedContinue()
                        break
                    case 17:
                    case 13:
                        pauseSignalPlayer()
                        break
                    case 18:
                        restartSignalPlayer()
                        break
                    case 23:
                        restartSignalPlayer()
                        document.querySelector('#signal-play-button')?.setAttribute('disabled', 'disabled')
                        document.querySelector('#signal-play-button')?.classList.add('unavailable')
                        break
                }
            },
        );

        eventStagesController.editorEventTarget.addEventListener(
            "drop",
            async (evt) => {
                console.log("changed!", state.currentEvent, (state.circuitController?.getNumGates() || 0) < 3)
                if (state.currentEvent >= 17 && (state.circuitController?.getNumGates() || 0) < 3) {
                    console.log("preparing event 15 (blocking delayed continues)")
                    block = true
                    eventStagesController.prepareEvent(createCustomEvent({}, "", null), 15)
                    state.indicator?.hide()
                }
            }
        )

        eventStagesController
    });

    function restartSignalPlayer() {
        eventStagesController.signalEventTarget.dispatchEvent(
            createCustomEvent(
                {
                    frame:0,
                    value:[]
                },
                "restart",
                null
            )
        )
    }

    function pauseSignalPlayer() {
        eventStagesController.signalEventTarget.dispatchEvent(
            createCustomEvent(
                {
                    frame:0,
                    value:[]
                },
                "pause",
                null
            )
        )
    }

    function onContinue() {
        // @ts-ignore
        eventStagesController.tutorialEventTarget.dispatchEvent(createCustomEvent({}, "continue"))
    }

    let block = false
    async function delayedContinue() {
        block = false
        const delay = () => {return new Promise((resolve) => {setTimeout(resolve, 5000)})}
        await delay()
        if (block) block = false
        else onContinue()
    }
</script>

{#if state.currentEvent === 26}
    <TutorialText
        position={[85, 15]}
        initialPosition={[85, 45]}
        showButton={false}
    >
    <div style="color:black; width:25vw">
        <p>Each Gate has a name, this one is called a “Not” gate.</p> 
        <p>It takes one input and “inverts” it, <span style="color:var(--connection-color-on)">high</span> to <span style="color:var(--connection-color-off)">low</span>
        and <span style="color:var(--connection-color-off)">low</span> to <span style="color:var(--connection-color-on)">high</span>.</p>
    </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 25}
    <TutorialText
        position={[85, 15]}
        initialPosition={[85, 45]}
        showButton={false}
    >
    <div style="color:black; width:25vw">
        Wait for the <span style="color:var(--circuit-color);">signal</span> to play all the way through to 
        <span style="color:green;">verify</span> the circuit.
    </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 24}
    <TutorialText
        position={[85, 45]}
        initialPosition={[85, 30]}
        showButton={false}
    >
    <div style="color:black; width:25vw">
        That looks much better, play the <span style="color:var(--circuit-color);">signal</span> again to see how the circuit performs.
    </div>
    </TutorialText>
{/if}

{#if state.currentEvent >= 22 && state.currentEvent <= 23}
    <TutorialText
        position={[85, 30]}
        initialPosition={[85, 15]}
        showButton={false}
    >
    <div style="color:black; width:25vw">
        Now, draw a second wire between the gate and the output of the circuit.
    </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 21}
    <TutorialText
        position={[85, 15]}
        initialPosition={[20,90]}
        showButton={false}
    >
    <div style="color:black; width:25vw">
        For the gate to affect the circuit, it needs to be connected.
    </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 19}
    <TutorialText
        position={[20, 90]}
        initialPosition={[20,90]}
        showButton={false}
    >
    <div style="color:black;">
        ...
    </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 18}
    <TutorialText
        position={[100, 70]}
        initialPosition={[85, 20]}
        showButton={false}
    >
    <div style="color:black; width:80vw;">
        Let's see if the circuit works now! (press play)
    </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 17}
    <TutorialText
        position={[50, 20]}
        initialPosition={[50, 20]}
        on:continue={dispatch.bind(dispatch, "continue")}
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

{#if state.currentEvent === 16}
    <TutorialText
        position={[50, 20]}
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
            Looks like this circuit isn't correct.
        </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 12}
    <TutorialText
        position={[100, 65]}
        initialPosition={[20,90]}
        showButton={false}
    >
    <div style="color:black;">
        ...
    </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 11}
    <TutorialText
        position={[100, 65]}
        initialPosition={[95,30]}
        on:continue={dispatch.bind(dispatch, "continue")}
        showButton={false}
    >
        <div style="color:black; width:80vw;">
            <div>This is the <span style="color:var(--circuit-color);">signal</span>. Press the play button</div>
            <div>to see what happens in the <span style="color:var(--circuit-color);">circuit</span>.</div>
        </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 10}
    <TutorialText
        position={[85, 30]}
        on:continue={dispatch.bind(dispatch, "continue")}
        unavailable={state.signalPlaying}
    >
        <p style="color:black; width:150%;">This is a level.</p>
    </TutorialText>
{/if}
