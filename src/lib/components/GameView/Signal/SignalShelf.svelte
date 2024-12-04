<script>
    //@ts-ignore
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { CircuitSignalSetView, SignalSetView } from "$lib/signal_types/SignalSetView";
    import { onMount, tick } from "svelte";
    import ResizingSvg from "../../Misc/ResizingSvg.svelte";
    import { ConnectionValueSignalSet } from "$lib/signal_types/Signal";
    import { CircuitSignalSetViewEventTarget, SignalSetViewEventTarget } from "$lib/signal_types/SignalSetViewEvent";
    import { createCustomEvent } from "$lib/misc_types/CustomEventSystem";
    import SignalViewer from "./SignalViewer.svelte";
    import SignalPlayBar from "./SignalPlayBar.svelte";
    import SignalVerifier from "./SignalVerifier.svelte";
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";
    /**
     * @type {CircuitSignalSetView}
     */
    export let signalSetView
    let channelSvgs = signalSetView.drawChannels()

    /**
     * @type {CircuitSignalSetViewEventTarget | null}
     */
    export let signalSetViewEventTarget = null
    $: { if (signalSetViewEventTarget) {
        signalSetViewEventTarget.addEventListener("restart", updateDesiredOutputs)
        signalSetViewEventTarget.addEventListener("update", updateDesiredOutputs)

        signalSetViewEventTarget.addEventListener("restart", onRestart)
        signalSetViewEventTarget.addEventListener("play", onPlay)
        signalSetViewEventTarget.addEventListener("pause", onPause)
        signalSetViewEventTarget.addEventListener("step", onStep)
        signalSetViewEventTarget.addEventListener("done", onDone)
    }}
    
    /**
     * @type {CircuitController}
    */
    export let circuitController
    /**
     * @type {string[]}
     */
    export let labels = circuitController.getInputLabels().concat(circuitController.getOutputLabels())

    /**
     * @type {any}
     */
    export let editorParams

    onMount(async () => {
        signalSetView.createPlayer(100)
        signalSetView.sendPlayerToController(circuitController)

        if (!signalSetViewEventTarget) signalSetViewEventTarget = new CircuitSignalSetViewEventTarget()

        console.log("channels", labels, channelSvgs)

        await tick()

        restart()
    })


    /**
     * @param {{ value: import("$lib/circuit_types/GateType").ConnectionValue[]; }} withKeyFrame
     */
    function updateDesiredOutputs(withKeyFrame) {
        console.log("signal wants desired outputs", withKeyFrame.value)
        circuitController.setDesiredOutputs(withKeyFrame.value.slice(-signalSetView.getOutputSize()))
    }

    /**
     * @type {SVGElement | null}
     */
    let playBarGroup

    let playButtonInnerText = "⏵"

    let playing = false
    let atStart = true
    let atEnd = false
    let circuitValid = false

    /**
     * @type {HTMLElement}
     */
    let container

    async function playPause() {
        if (playing) {
            await pause()
        }
        else {
            await play()
        }
    }

    /**
     * @param {import("$lib/signal_types/SignalSetViewEvent").SignalSetViewEventKey} type
     * @param {Object | undefined} [options]
     */
    async function dispatchSignalEvent(type, options) {
        await signalSetViewEventTarget?.dispatchEvent(
            createCustomEvent(
                {...{
                    frame:signalSetView.getPlayerFrame() || 0,
                    value:signalSetView.getPlayerValue() || []
                }, ...(options || {})},
                type,
                container
            )
        )
    }

    async function restart() {
        await dispatchSignalEvent("restart")
    }

    function onRestart() {
        console.log("restarting")

        pause()

        signalSetView.resetPlayer()
        circuitController.setInputs(signalSetView.getPlayerValue() || [], false)

        checkScroll()
        signalSvg.setOffset([0, 0])

        atStart = true
        atEnd = false
    }

    /**
     * @param {import("$lib/circuit_types/GateType").ConnectionValue[]} currentValue
     * @param {number} currentFrame
     * @param {boolean} update
     * @param {boolean} done
     */
    function step(currentValue, currentFrame, update, done) {
        dispatchSignalEvent("step")   
        if (update) {
            //send input channels to circuit inputs
            circuitController.setInputs(currentValue, false)
            dispatchSignalEvent("update")
        }
        if (done) {
            dispatchSignalEvent("done") 
        }

        circuitValid = signalSetView.isCircuitValid()
        
    }

    /**
     * 
     * @param {import("$lib/signal_types/SignalSetViewEvent").CircuitSignalSetViewEvent} param0
     */
    function onStep({frame}) {
        checkScroll(frame)
    }

    function onDone() {
        atEnd = true
        pause()
    }

    function play() {
        dispatchSignalEvent("play")
    }

    function onPlay() {
        if (atEnd) {
            restart().then(play)
            return
        }

        signalSetView.playVerify(circuitController, step)

        playButtonInnerText = "⏸"

        playing = true
    }

    function pause() {
        dispatchSignalEvent("pause")
    }

    function onPause() {
        signalSetView.pausePlayer()

        playButtonInnerText = "⏵"
        playing = false
    }

    /**
     * @type {ResizingSvg}
     */
    let signalSvg

    function checkScroll(frame = 0) {
        const frameWidth = signalSetView.getDesiredFrameWidth()
        const translateX = frameWidth * (frame)
        const shouldScroll = !(signalSvg.isInnerOffsetInBounds([translateX + 16 * frameWidth, 0]))
        if (shouldScroll) {
            const offset = signalSvg.getOffset()
            signalSvg.setOffset([offset[0] + frameWidth, offset[1]])
        }
    }

</script>
<div class="signomatic-box {circuitValid ? "":"failure"}" bind:this={container}>
    <!--apply shadow color to 3 quarters of box grid-->
    <div style="grid-row: 1/3; grid-column:2; background-color:var(--signomatic-box-shadow);"></div>
    <div style="grid-row: 2; grid-column:1; background-color:var(--signomatic-box-shadow)"></div>
    <div style="grid-row: 1; grid-column:1; background-color:var(--signomatic-box-bg)"></div>
    
    <div class="signomatic-frame">
        <div class="signal-verifier">
            <SignalVerifier 
                eventTarget={signalSetViewEventTarget}
                signalSetView={signalSetView}
                circuitController={circuitController}
                visible={editorParams.showVerifier}
            />
        </div>
        <div class="signal-container">
            <div class="signal-label-column">
                <div style="font-style:italic;">
                    <div>
                        Signo-
                    </div>
                    <div>
                        matic
                    </div>
                </div>
            </div>
            <div style="height:100%;width:2px;">

            </div>
            <div class="signal-label-column">
                {#each labels as label}
                    <div>{@html label}</div>
                {/each}
            </div>
            <div class="signal-svg-container">
                <ResizingSvg
                bind:this={signalSvg}
                    overflowWidth={true}
                    ancestry={1}
                >
                    <g transform="translate(0, 8)">
                        <slot />
                        <g>
                            <SignalPlayBar
                                signalSetView={signalSetView}
                                length={labels.length}
                                bind:eventTarget={signalSetViewEventTarget}
                            />
                        </g>
                    </g>

                </ResizingSvg>
            </div>
            <!--
            <div class="signal-label-column">
                <div>Play</div>
                <div>Restart</div>
            </div>
            -->
        </div>

        <div class="button-container">
            <HeavyButton on:click={playPause} id="signal-play-button">
                {playButtonInnerText}
            </HeavyButton>
            <HeavyButton on:click={restart} id="signal-restart-button">
                Restart
            </HeavyButton>
        </div>
    </div>
</div>



<style>
    /* Implement the figma design */
    .signomatic-box {
        --signomatic-box-bg: #D9D9D9;
        --signomatic-box-shadow: #B9B9B9;
        --signomatic-frame-bg: #CDCDCD;
        --signomatic-waveform-bg: #2A2A2A;
        --signomatic-waveform-text: #93DFC0;
        --signomatic-waveform-text-bg: #585BF4;

        box-sizing: border-box; 

        /* curved border, darker on the bottom */
        border-radius: 2em;
        border:solid var(--signomatic-box-bg) 2em;
        border-left-width: 2em;
        border-bottom-width: 1em;
        border-bottom-color: var(--signomatic-box-shadow);
        border-right-width: 2em;
        border-right-color: var(--signomatic-box-shadow);

        /* shadows inside the border, only in the 3 quarters touching shadow borders */
        /* rest of space will be overlaid by inner elements with their own backgrounds */
        display: grid; 
        grid-template-rows: 1fr 1fr;
        grid-template-columns: 1fr 1fr;
        height: calc(100%);
    }

    .signomatic-frame {

        grid-row: 1/3; 
        grid-column: 1/3;

        display: grid;
grid-template-columns: 12fr 1fr;
grid-template-rows: 3fr 1fr;
gap: 5vh;
height: calc(100% - 3em);
background-color: var(--signomatic-frame-bg);

border: solid #00000000 1em;
border-top-width: 2em;
border-radius: 2em;
box-shadow: 1em 1em 1em rgba(0, 0, 0, 0.25); /* Added box-shadow */

    }

    .signal-container {
        display:flex;
        flex-direction: row;
        justify-content: space-around;
        background-color: var(--signomatic-waveform-bg);

        grid-column: 1;
        grid-row: 1/3;
    }

    .signal-svg-container {
        overflow-x: hidden;
        position:relative;

        width:100%;
        height:100%;
    }

    .signal-label-column {
        display:flex;
        flex-direction: column;
        justify-content:space-evenly;
        padding-left:1em;
        padding-right: 1em;
        text-wrap: nowrap;
        background-color: var(--signomatic-waveform-text-bg);
        color:var(--signomatic-waveform-text);
    }

    .button-container {
        grid-column: 2;
        grid-row:1;

        display: flex;
        flex-direction: column;
        justify-content: center;
        justify-content:space-evenly;
    }

    .signal-verifier {
        grid-column: 2;
        grid-row:2;
    }

    .failure {
        animation: tilt-n-move-shaking calc(var(--animation-speed) * 0.1) 10;
    }

    @keyframes tilt-n-move-shaking {
    0% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(3px, 3px) rotate(.5deg); }
    50% { transform: translate(0, 0) rotate(0eg); }
    75% { transform: translate(-3px, 3px) rotate(-.5deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
    }
</style>
