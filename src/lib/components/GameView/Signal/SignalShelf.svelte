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

    let labelOffset = 75

    /**
     * @type {CircuitController}
    */
    export let circuitController
    /**
     * @type {string[]}
     */
    export let labels = circuitController.getInputLabels().concat(circuitController.getOutputLabels())

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

    let playButtonInnerText = "⏵"

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

        playButtonInnerText = "⏸"
        if (atEnd) restart()

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

<div class="signal-viewer-container" bind:this={container}>
    <div class="button-container">
        <HeavyButton on:click={playPause} id="signal-play-button">
            {playButtonInnerText}
        </HeavyButton>
        <HeavyButton on:click={restart} id="signal-restart-button">
            Restart
        </HeavyButton>
    </div>
    <div class="signal-verifier">
        <SignalVerifier 
            eventTarget={signalSetViewEventTarget}
            signalSetView={signalSetView}
            circuitController={circuitController}
        />
    </div>
    <div class="signal-container">
        <div class="signal-channel-labels">
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
    </div>
</div>


<style>
    .signal-viewer-container {
        display:grid;
        grid-template-columns: 1fr 1fr 8fr;
        gap: 5%;
        height:100%;
    }

    .signal-container {
        display:flex;
        flex-direction: row;
        justify-content: space-around;
    }

    .signal-svg-container {
        grid-column: 3;
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

    .signal-verifier {
        grid-column: 2;
    }
</style>
