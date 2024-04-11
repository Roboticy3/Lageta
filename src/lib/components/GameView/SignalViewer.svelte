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
    signalSetView.createPlayer(100)

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
</script>

<div class="signal-viewer-container">
    <div class="button-container">
        <button>
            ⏩︎
        </button>
        <button>
            ⏸︎
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
        -webkit-text-fill-color: var(--main-bg-color);
        -webkit-text-stroke-width: 1px;
        -webkit-text-stroke-color: var(--grid-color);

        font-size: larger;
    }

    .button-container button:hover {
        font-size: xx-large;
        -webkit-text-fill-color: var(--secondary-bg-color);
    }
</style>
