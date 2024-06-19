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
    /**
     * @type {CircuitSignalSetView}
     */
    export let signalSetView
    let channelSvgs = signalSetView.drawChannels()

    /**
     * @type {CircuitSignalSetViewEventTarget | null}
     */
    export let signalSetViewEventTarget = null

    let labelOffset = 75

    /**
     * @type {CircuitController}
    */
    export let circuitController
    $: labels = circuitController.getInputLabels().concat(circuitController.getOutputLabels())

    onMount(async () => {
        signalSetView.createPlayer(100)
        signalSetView.sendPlayerToController(circuitController)
        
        restart()

        if (!signalSetViewEventTarget) signalSetViewEventTarget = new CircuitSignalSetViewEventTarget()

        signalSetViewEventTarget.addEventListener("restart", updateDesiredOutputs)
        signalSetViewEventTarget.addEventListener("update", updateDesiredOutputs)

        signalSetViewEventTarget.addEventListener("restart", onRestart)
        signalSetViewEventTarget.addEventListener("play", onPlay)
        signalSetViewEventTarget.addEventListener("pause", onPause)
        signalSetViewEventTarget.addEventListener("step", onStep)
        signalSetViewEventTarget.addEventListener("done", onDone)

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
    /**
     * @type {HTMLButtonElement | null}
     */
    let playButton
    let playing = false
    let atStart = true
    let atEnd = false

    /**
     * @type {HTMLDivElement}
     */
    let container

    function playPause() {
        if (playing) {
            pause()
        }
        else {
            play()
        }
    }

    /**
     * @param {import("$lib/signal_types/SignalSetViewEvent").SignalSetViewEventKey} type
     * @param {Object | undefined} [options]
     */
    function dispatchSignalEvent(type, options) {
        signalSetViewEventTarget?.dispatchEvent(
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

    function restart() {
        dispatchSignalEvent("restart")
    }

    function onRestart() {
        pause()

        signalSetView.resetPlayer()

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
            circuitController.setInputs(currentValue)
            dispatchSignalEvent("update")
        }
        if (done) {
            dispatchSignalEvent("done") 
        }
        
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
        signalSetView.playVerify(circuitController, step)

        if (playButton) playButton.innerText = "⏸"
        if (atEnd) restart()

        playing = true
    }

    function pause() {
        dispatchSignalEvent("pause")
    }

    function onPause() {
        signalSetView.pausePlayer()

        if (playButton) playButton.innerText = "⏵"
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

<div class="signal-viewer-container" bind:this={container}>
    <div class="button-container">
        <button on:click={playPause} id="signal-play-button">
            ⏵
        </button>
        <button on:click={restart} id="signal-restart-button">
            Restart
        </button>
    </div>
    <div class="signal-container">
        <div class="signal-channel-labels">
            {#each labels as label}
                <div>{label}</div>
            {/each}
        </div>
        <div class="signal-svg-container">
            <ResizingSvg
            bind:this={signalSvg}
                overflowWidth={true}
                ancestry={1}
            >
                <g transform="translate(0, 8)">
                    <g fill="none">
                        <SignalViewer 
                            signalSetView={signalSetView}
                            channels={new Array(signalSetView.getInputSize()).fill("").map((_v, i) => {return {idx:i, type:"Given"}})}
                        />
                    </g>
                    <g fill="none" transform="translate(0, {signalSetView.getDesiredChannelHeight(signalSetView.getInputSize())})">
                        <SignalViewer 
                            signalSetView={signalSetView}
                            channels={new Array(signalSetView.channelCount() - signalSetView.getInputSize()).fill("").map((_v, i) => {return {idx:signalSetView.getInputSize() + i, type:"Expected"}})}
                        />
                    </g>
                    <g fill="none" transform="translate(0, {signalSetView.getDesiredChannelHeight(signalSetView.getInputSize())})">
                        <SignalViewer 
                            bind:eventTarget={signalSetViewEventTarget}
                            signalSetView={signalSetView}
                            liveChannelSources={circuitController.getOutputPoints()}
                            circuitController={circuitController}
                            liveOnly={true}
                            channels={new Array(signalSetView.channelCount() - signalSetView.getInputSize()).fill("").map((_v, i) => {return {idx:i, type:"Live"}})}
                        />
                    </g>
                    <g>
                        <SignalPlayBar
                            signalSetView={signalSetView}
                            bind:eventTarget={signalSetViewEventTarget}
                        />
                    </g>
                </g>

            </ResizingSvg>
        </div>
    </div>
    <div class="signal-verifier">
        <SignalVerifier 
            eventTarget={signalSetViewEventTarget}
            signalSetView={signalSetView}
            circuitController={circuitController}
        />
    </div>
</div>


<style>
    .signal-viewer-container {
        display:grid;
        grid-template-columns: 1fr 8fr 2fr;
        gap: 5%;
        height:100%;
    }

    .signal-container {
        display:flex;
        flex-direction: row;
        justify-content: space-around;
    }

    .signal-svg-container {
        grid-column: 2;
        overflow-x: hidden;
        position:relative;

        width:100%;
        height:100%;
    }

    .signal-channel-labels {
        display:flex;
        flex-direction: column;
        justify-content:space-evenly;

        text-wrap: nowrap;
        margin-right:3%;
    }

    .button-container {
        grid-column: 1;

        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .button-container button {
        color: var(--circuit-color);
        font-size: x-large;
    }

    .button-container button:hover {
        font-size: xx-large;
    }

    .signal-verifier {
        grid-column: 3;
    }
</style>
