<script>
    //@ts-ignore
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { CircuitSignalSetView, SignalSetView } from "$lib/signal_types/SignalSetView";
    import { onMount } from "svelte";
    import ResizingSvg from "../Misc/ResizingSvg.svelte";
    import { ConnectionValueSignalSet } from "$lib/signal_types/Signal";
    /**
     * @type {CircuitSignalSetView}
     */
    export let signalSetView
    let channelSvgs = signalSetView.drawChannels()

    let labelOffset = 50

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

    onMount(() => {
        signalSetView.createPlayer(100)
        signalSetView.sendPlayerToController(circuitController)
        restart()
        resetOutputSignalSetView()
    })

    /**
     * @type {SVGElement | null}
     */
    let playBarGroup
    /**
     * @type {HTMLButtonElement | null}
     */
    let playButton
    let playing = false

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

    function restart() {
        pause()
        signalSetView.resetPlayer()
        resetOutputSignalSetView()
        playBarGroup = container.querySelector("#signal-svg-play-bar")
        playButton = container.querySelector("#signal-play-button")
        setPlayBarProgress()
    }

    /**
     * @param {import("$lib/circuit_types/GateType").ConnectionValue[]} currentValue
     * @param {number} currentFrame
     * @param {boolean} update
     * @param {boolean} done
     */
    function onSignalStep(currentValue, currentFrame, update, done) {
        setPlayBarProgress(currentFrame)

        if (update) {
            outputSignalSetView.push(currentValue, currentFrame - 1);
            circuitController.setInputs(currentValue)
        }

        liveChannelSvgs = outputSignalSetView.drawChannels(currentFrame, `stroke="red"`)
        console.log(outputSignalSetView)
        
        if (done) {
            pause()
        }  
    }

    function play() {
        if (playButton) playButton.innerText = "⏸"

        signalSetView.startPlayer(onSignalStep, false)
        playing = true

        document.querySelectorAll("input").forEach((n) => n.setAttribute('disabled','disabled'))
    }

    function pause() {
        if (playButton) playButton.innerText = "⏵"
        
        signalSetView.pausePlayer()
        playing = false

        document.querySelectorAll("input").forEach((n) => n.removeAttribute('disabled'))
    }

    function setPlayBarProgress(frame = 0) {
        playBarGroup?.setAttribute('transform', `translate(${labelOffset + signalSetView.getDesiredFrameWidth() * frame}, 0)`)
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
        <ResizingSvg>
            <g transform="translate(0, 8)" fill="none">
                {#each channelSvgs as channel, index}
                    <g transform='translate({labelOffset}, {channelSvgHeight(index)})'>
                        {@html channel}
                    </g>
                    <g font-size="10px" transform='translate(0, {channelSvgHeight(index)  + channelSvgHeight(1) / 2})'>
                        <text>{labels[index]}</text>
                    </g>
                {/each}
                <g id="signal-svg-play-bar">
                    <path d="M -4 -8 L 4 -8 L 0 0 L 0 {signalSetView.getDesiredHeight()} L 0 0 Z" stroke="var(--grid-color)" stroke-width="1px" fill="none"/>
                </g>
                {#each liveChannelSvgs as channel, index}
                    <g transform='translate({labelOffset}, {channelSvgHeight(index)})'>
                        {@html channel}
                    </g>
                    <g font-size="10px" transform='translate(0, {channelSvgHeight(index)  + channelSvgHeight(1) / 2})'>
                        <text>{labels[index]}</text>
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
        width: 100%;
        height: 100%;
        overflow-y:scroll;
        overflow-x:hidden;
    }

    .svg-container {
        grid-column: 3 / 4;
        padding: 1%;
        width: 100%;
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
