<script>
    //@ts-ignore
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { CircuitSignalSetView } from "$lib/signal_types/SignalSetView";
    import { onMount } from "svelte";
    import ResizingSvg from "../Misc/ResizingSvg.svelte";

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
     * @param {number} index
     */
    function channelSvgHeight(index) {
        return signalSetView.getDesiredChannelHeight(index)
    }

    onMount(() => {
        signalSetView.createPlayer(100)
        signalSetView.sendPlayerToController(circuitController)
        restart()
    })

    /**
     * @type {SVGElement | null}
     */
    let playBarGroup
    let playing = false

    /**
     * @type {HTMLDivElement}
     */
    let container

    function playPause() {
        playing = !playing
        if (playing) {
            play()
        }
        else {
            pause()
        }
    }

    function restart() {
        signalSetView.resetPlayer()
        playBarGroup = container.querySelector("#signal-svg-play-bar")
        setPlayBarProgress()
    }

    function play() {

    }

    function pause() {
        
    }

    function setPlayBarProgress(frame = 0) {
        playBarGroup?.setAttribute('transform', `translate(${labelOffset + signalSetView.getDesiredFrameWidth() * frame}, 0)`)
    }

</script>

<div class="signal-viewer-container" bind:this={container}>
    <div class="button-container">
        <button on:click={playPause} id="signal-play-button">
            ⏩︎
        </button>
        <button on:click={restart} id="signal-restart-button">
            Restart
        </button>
    </div>

    <div class="svg-container">
        <ResizingSvg>
            {#each channelSvgs as channel, index}
                <g transform='translate({labelOffset}, {channelSvgHeight(index)})'>
                    {@html channel}
                </g>
                <g font-size="10px" transform='translate(0, {channelSvgHeight(index)  + channelSvgHeight(1) / 2})'>
                    <text>{labels[index]}</text>
                </g>
            {/each}
            <g id="signal-svg-play-bar">
                <path d="M -4 0 L 4 0 L 0 8 L 0 {signalSetView.getDesiredHeight()} L 0 8 Z" stroke="var(--grid-color)" stroke-width="1px" fill="none"/>
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
