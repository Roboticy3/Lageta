<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import CircuitDiv from "$lib/components/GameView/CircuitDiv.svelte";
    import TutorialConnectionLabel from "$lib/components/GameView/Tutorial/TutorialConnectionLabel.svelte";


    import TutorialIndicator from "$lib/components/GameView/Tutorial/TutorialIndicator.svelte";
    import TutorialText from "$lib/components/GameView/Tutorial/TutorialText.svelte";
    import { TutorialEventSequenceController } from "$lib/tutorial_types/TutorialEventSequence";
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
     * @type {TutorialEventSequenceController}
     */
    export let eventStagesController

    /**
     * @type {any}
     */
    export let state = {
        currentEvent:0,
        showInputCheckboxes:false,
        circuitController:circuitController,
        /**
         * @type {import("$lib/circuit_types/GateType").ConnectionValue}
        */
        input:true,
        /**
         * @type {import("$lib/circuit_types/GateType").ConnectionValue}
        */
        output:undefined,
        /**
         * @type {import("$lib/circuit_types/GateType").ConnectionValue}
        */
        expectedOutput:undefined
    }

    export function getState() {
        return state
    }

    function setConnectionValues() {
        state.input = circuitController.getInputs()[0]
        const outputs = circuitController.getOutputs()
        state.output = outputs[0]
        state.expectedOutput = circuitController.getPlayerValue()?.slice(-outputs.length)[0]
        state = state
    }

    const valueLabelColors = new Map([
        [true, "var(--connection-color-on)"],
        [false, "var(--connection-color-off)"],
        [undefined, "var(--connection-color-x)"]
    ])

    onMount(() => {
        circuitController.addGraphListener("update", setConnectionValues)
        indicator?.setPositionToConnectionPoint({id:0, type:"Output", index:0})

        eventStagesController.editorEventTarget.addEventListener("drop", (evt) => {
            if (state.currentEvent >= 3 && state.currentEvent <= 4) {
                if (state.circuitController.getOutputs()[0] === undefined) {
                    state.showInputCheckboxes = false
                    state.indicator.show()
                    eventStagesController.prepareEvent(evt, 2)
                }
            }
        })
    })

</script>
<TutorialIndicator 
    bind:this={indicator}
    circuitController={circuitController}
/>

{#if state.currentEvent >= 20 && (state.isCircuitValid !== true)}
    <TutorialText
        position={[50, 90]}
        initialPosition={[30, 120]}
        on:continue={dispatch.bind(dispatch, 'continue')}
        showButton={false}
    >   
        <div style="color:black;">
            It's still not working..
        </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 15}
    <TutorialIndicator 
        circuitController={circuitController}
        variant={1}
        position={[0.5, 0]}
    />
{/if}

{#if state.currentEvent === 13}
    <TutorialText
        position={[40, 5]}
        on:continue={dispatch.bind(dispatch, 'continue')}
        showButton={true}
    >   
        <div style="color:black; white-space: nowrap;">
            <div style="position:relative; left:5vw;">As the <span style="color:var(--circuit-color);">signal</span> plays,</div>
            <div style="
                display:flex; 
                flex-direction:row; 
                width:125%; 
                justify-content:space-between;
                font-size:min(3vh, 1vw);

            ">
                <div>it <span style="color:{valueLabelColors.get(state.input)}">sends voltage to the input</span>,</div>
                <div>but also <span style="color:{valueLabelColors.get(state.expectedOutput)}">expects a certain output (dotted circle)</span></div>
            </div>
        </div>
    </TutorialText>
{/if}

{#if state.currentEvent === 8} 
    <TutorialText 
        position={[50, 10]} 
        initialPosition={undefined}
        showButton={false}
        on:continue={dispatch.bind(dispatch, 'continue')}
    >
        <p style="color:black; font-size:min(3vw, 3vh);">
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
        initialPosition={[50,70]}
        showButton={false}
        on:continue={dispatch.bind(dispatch, 'continue')}
    >
        <p style="color:black; font-size:min(3vw, 3vh);">
            Click on any blank space to delete a wire.
        </p>
    </TutorialText>
{/if}

{#if state.currentEvent >= 6 && state.currentEvent <= 7}
    <TutorialText 
        position={[50, 70]} 
        initialPosition={undefined}
        on:continue={dispatch.bind(dispatch, 'continue')}
        showButton={false}
    >
        <p style="color:black; font-size:min(3vw, 3vh);">
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
        unavailable={state.output !== false}
        on:continue={dispatch.bind(dispatch, 'continue')}
    >
        <p style="color:black; font-size:min(3vw, 3vh);">At any connection point, voltage can be
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
        adjust={[-0.5,-1]}
    />
    {#if state.output !== false}
        <TutorialText
            position={[50,25]}
            initialPosition={[50,70]}
            showButton={false}
        >
            <span style="color:var(--connection-color-off);">(Hint: the <span style="color:{valueLabelColors.get(state.output)}">output</span> should match the dotted circle around it)</span>
        </TutorialText>
    {/if}
{/if}

{#if state.currentEvent === 3}
    <!--Gross multi-binds, let's see if this works!-->
    <TutorialText 
        position={[50, 55]} 
        unavailable={state.output !== true}
        on:continue={dispatch.bind(dispatch, 'continue')}
    >
        <p style="font-size:min(7vw, 7vh); color:black;">Voltage!</p>
    </TutorialText>
{/if}