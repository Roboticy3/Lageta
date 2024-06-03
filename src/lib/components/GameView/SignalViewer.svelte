<script>
    //@ts-ignore
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { CircuitSignalSetView, SignalSetView } from "$lib/signal_types/SignalSetView";
    import { onMount, tick } from "svelte";
    import ResizingSvg from "../Misc/ResizingSvg.svelte";
    import { ConnectionValueSignalSet } from "$lib/signal_types/Signal";
    import { CircuitSignalSetViewEventTarget, SignalSetViewEventTarget } from "$lib/signal_types/SignalSetViewEvent";
    import { createCustomEvent } from "$lib/misc_types/CustomEventSystem";
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

    /**
     * @param {number} index
     */
    function channelSvgHeight(index) {
        return signalSetView.getDesiredChannelHeight(index)
    }

    onMount(async () => {
        signalSetView.createPlayer(100)
        signalSetView.sendPlayerToController(circuitController)
        
        restart()

        if (!signalSetViewEventTarget) signalSetViewEventTarget = new CircuitSignalSetViewEventTarget()

        signalSetViewEventTarget.addEventListener("restart", updateDesiredOutputs)
        signalSetViewEventTarget.addEventListener("play", updateDesiredOutputs)
        signalSetViewEventTarget.addEventListener("pause", updateDesiredOutputs)
        signalSetViewEventTarget.addEventListener("step", updateDesiredOutputs)

        signalSetViewEventTarget.addEventListener("restart", onRestart)
        signalSetViewEventTarget.addEventListener("play", onPlay)
        signalSetViewEventTarget.addEventListener("pause", onPause)
        signalSetViewEventTarget.addEventListener("step", onStep)

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
     */
    function dispatchSignalEvent(type) {
        signalSetViewEventTarget?.dispatchEvent(
            createCustomEvent(
                {
                    frame:signalSetView.getPlayerFrame() || 0,
                    value:signalSetView.getPlayerValue() || []
                },
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

            //send circuit outputs to output channels
            outputSignalSetView.push(circuitController.getOutputs(), currentFrame - 1);
        }       
        
        if (done) {
            atEnd = true
            pause()
            if (signalSetView.isCircuitValid()) {
                circuitController.complete()
            }
        }  
    }

    /**
     * 
     * @param {import("$lib/signal_types/SignalSetViewEvent").CircuitSignalSetViewEvent} param0
     */
    function onStep({frame, value}) {
        setPlayBarProgress(frame)
        liveChannelSvgs = outputSignalSetView.drawChannels(
            frame, 
            `stroke="var(--grid-color)" stroke-width="2" stroke-dasharray="2 1"`
        )
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

    function setPlayBarProgress(frame = 0) {
        let adjustedFrame = frame + 1
        if (frame === 0) adjustedFrame = 0
        else if (frame === signalSetView.getLength()) adjustedFrame = signalSetView.getLength()
        if (playBarGroup) playBarGroup.style.translate = `${labelOffset + signalSetView.getDesiredFrameWidth() * (adjustedFrame)}px`
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
            
            ancestry={1}
        >
            <g transform="translate(0, 8)" fill="none">
                {#each channelSvgs as channel, index}
                    <g transform='translate({labelOffset}, {channelSvgHeight(index)})'>
                        {@html channel}
                    </g>
                    <g fill="black" transform='translate(0, {channelSvgHeight(index)  + channelSvgHeight(1) / 2})'>
                        <text>{labels[index]}</text>
                    </g>
                {/each}
                <g id="signal-svg-play-bar" style="transition:translate 200ms;">
                    <path d="M -4 -8 L 4 -8 L 0 0 L 0 {signalSetView.getDesiredHeight()} L 0 0 Z" stroke="var(--grid-color)" stroke-width="1px" fill="none"/>
                </g>
                {#each liveChannelSvgs as channel, index}
                    <g transform='translate({labelOffset}, {channelSvgHeight(index + signalSetView.getInputSize())})'>
                        {@html channel}
                    </g>
                {/each}
            </g>
        </ResizingSvg>
    </div>
</div>


<style>
    .signal-viewer-container {
        display:grid;
        grid-template-columns: 1fr 1fr 9fr;
        gap: 5%;
        height:100%;
    }

    .svg-container {
        grid-column: 3 / 4;
    }

    .button-container {
        grid-column: 2;

        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .button-container button {
        color: var(--grid-color);
        font-size: x-large;
    }

    .button-container button:hover {
        font-size: xx-large;
    }
</style>
