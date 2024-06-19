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
    let labels = circuitController.getInputLabels().concat(circuitController.getOutputLabels())
    console.log(circuitController.getInputLabels(), circuitController.getOutputLabels())

    /**
     * @type {CircuitSignalSetView}
     */
    export let outputSignalSetView =  new CircuitSignalSetView(circuitController.getOutputs())
    let liveChannelSvgs = outputSignalSetView.drawChannels(0)

    function resetOutputSignalSetView() {
        outputSignalSetView = new CircuitSignalSetView(circuitController.getOutputs())
        liveChannelSvgs = outputSignalSetView.drawChannels(0)
    }

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
        signalSetViewEventTarget.addEventListener("update", onUpdate)
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
        resetOutputSignalSetView()

        playBarGroup = container.querySelector("#signal-svg-play-bar")
        playButton = container.querySelector("#signal-play-button")

        setPlayBarProgress()
        atStart = true
        atEnd = false

        signalSvg.setOffset([0, 0])
    }

    /**
     * @param {import("$lib/circuit_types/GateType").ConnectionValue[]} currentValue
     * @param {number} currentFrame
     * @param {boolean} update
     * @param {boolean} done
     */
    function step(currentValue, currentFrame, update, done) {
        dispatchSignalEvent("step", {isCircuitValid:signalSetView.isCircuitValid()})   
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
        setPlayBarProgress(frame)
        liveChannelSvgs = outputSignalSetView.drawChannels(
            frame, 
            `stroke="var(--circuit-color)" stroke-width="2" stroke-dasharray="2 1"`
        )
    }

    /**
     * 
     * @param {import("$lib/signal_types/SignalSetViewEvent").CircuitSignalSetViewEvent} param0
     */
    function onUpdate({frame, value}) {

        //send circuit outputs to output channels
        outputSignalSetView.push(circuitController.getOutputs(), frame - 1);
    }

    function onDone() {
        atEnd = true
        pause()
        if (signalSetView.isCircuitValid()) {
            circuitController.complete()
            dispatchSignalEvent("complete")
        }
    }

    function play() {
        dispatchSignalEvent("play")
    }

    function onPlay() {
        signalSetView.playVerify(circuitController, step)

        if (playButton) playButton.innerText = "⏸"
        if (atEnd) restart()

        playing = true

        document.querySelectorAll("input").forEach((n) => n.setAttribute('disabled','disabled'))
    }

    function pause() {
        dispatchSignalEvent("pause")
    }

    function onPause() {
        signalSetView.pausePlayer()

        if (playButton) playButton.innerText = "⏵"
        playing = false

        document.querySelectorAll("input").forEach((n) => n.removeAttribute('disabled'))
    }

    /**
     * @type {ResizingSvg}
     */
    let signalSvg

    function setPlayBarProgress(frame = 0) {
        let adjustedFrame = frame + 1
        if (frame === 0) adjustedFrame = 0
        else if (frame === signalSetView.getLength()) adjustedFrame = signalSetView.getLength()
        const frameWidth = signalSetView.getDesiredFrameWidth()
        const translateX = labelOffset + frameWidth * (adjustedFrame)
        console.log("moving play bar to frame ", frame)
        if (playBarGroup) playBarGroup.style.translate = `${translateX}px`
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

    <div class="svg-container">
        <ResizingSvg
        bind:this={signalSvg}
            overflowWidth={true}
            ancestry={1}
        >
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
                    eventTarget={signalSetViewEventTarget}
                    signalSetView={signalSetView}
                    liveChannelSources={circuitController.getOutputPoints()}
                    circuitController={circuitController}
                    liveOnly={true}
                    channels={new Array(signalSetView.channelCount() - signalSetView.getInputSize()).fill("").map((_v, i) => {return {idx:i, type:"Live"}})}
                />
            </g>
        </ResizingSvg>
    </div>
</div>


<style>
    .signal-viewer-container {
        display:grid;
        grid-template-columns: 1fr 1fr 8fr 1fr;
        gap: 5%;
        height:100%;
    }

    .svg-container {
        grid-column: 3 / 4;
        overflow-x: hidden;
        position:relative;
    }

    .button-container {
        grid-column: 2;

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
</style>
