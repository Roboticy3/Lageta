<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import CircuitDiv from "$lib/components/GameView/CircuitDiv.svelte";
    import TutorialConnectionLabel from "$lib/components/GameView/Tutorial/TutorialConnectionLabel.svelte";


    import TutorialIndicator from "$lib/components/GameView/Tutorial/TutorialIndicator.svelte";
    import TutorialText from "$lib/components/GameView/Tutorial/TutorialText.svelte";
    import { createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher()

    /**
     * @type {TutorialIndicator | undefined}
     */
    let indicator
    export function getIndicator() {
        return indicator
    }
    $: state.indicator = indicator

    /**
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {any}
     */
    export let state = {}

    export function getState() {
        return state
    }

    function setConnectionValues() {
        state.input = circuitController.getInputs()[0]
        state.output = circuitController.getOutputs()[0]
        state = state
    }

    onMount(() => {
        circuitController.addGraphListener("update", setConnectionValues)
    })

</script>
<TutorialIndicator 
    bind:this={indicator}
    circuitController={circuitController}
    position={[1.35, 1.25]}
/>



{#if state.currentEvent === 8} 
    <TutorialText 
        position={[50, 10]} 
        showButton={false}
        on:continue={dispatch.bind(dispatch, 'continue')}
    >
        <p style="color:black; font-size:x-large;">
            Are you ready to solve some puzzles?
        </p>
        <p style="color:black;">
            (Reconnect the points to continue)
        </p>
    </TutorialText>
{/if}

{#if state.currentEvent === 7} 
    <TutorialText 
        position={[50, 10]} 
        showButton={false}
        on:continue={dispatch.bind(dispatch, 'continue')}
    >
        <p style="color:black; font-size:x-large;">
            Click on any blank space to delete a wire.
        </p>
    </TutorialText>
{/if}

{#if state.currentEvent >= 6 && state.currentEvent <= 7}
    <TutorialText 
        position={[50, 70]} 
        on:continue={dispatch.bind(dispatch, 'continue')}
        showButton={false}
    >
        <p style="color:black; font-size:x-large;">
            When points are not connected to anything, they have
            <span style="color:var(--connection-color-x)">neither</span>
            high or low voltage.
        </p>
    </TutorialText>
{/if}

{#if state.currentEvent === 5}
    <TutorialText 
        position={[50, 70]} 
        showButton={true}
        availableButton={state.output === false}
        on:continue={dispatch.bind(dispatch, 'continue')}
    >
        <p style="color:black; font-size:x-large;">At any connection point, voltage can be
            <span style="color:var(--connection-color-on)">high</span>,
            <span style="color:var(--connection-color-off)">low</span>,
            or <span style="color:var(--connection-color-x)">neither</span>.
        </p>
    </TutorialText>
    <TutorialConnectionLabel
        circuitController={circuitController}
        index={{id:0, type:"Output", index:0}}
        adjust={[-0.5,0.25]}
    />
    <TutorialConnectionLabel
        circuitController={circuitController}
        index={{id:1, type:"Input", index:0}}
    />
{/if}

{#if state.currentEvent === 3}
    <CircuitDiv
        circuitController={circuitController}
        position={[0.65, 1.25]}
        size={[0.75, 0.25]}
        active={true}
        smooth={true}
    >
        <p style="scale:0.75">what's this?</p>
    </CircuitDiv>
    <!--Gross multi-binds, let's see if this works!-->
    <TutorialText 
        position={[50, 55]} 
        availableButton={state.output === true}
        on:continue={dispatch.bind(dispatch, 'continue')}
    >
        <p style="font-size:xx-large; color:black;">Voltage!</p>
    </TutorialText>
{/if}