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

    let labelOffset = 40

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
        blahblahblah
    </div>
    <div class="svg-container">
        <ResizingSvg ancestry={2} minHeight={signalSetView.getDesiredHeight() * 2}>
            {#each channelSvgs as channel, index}
                <g transform='translate({labelOffset}, {channelSvgHeight(index)})'>
                    {@html channel}
                </g>
                <g transform='translate(0, {channelSvgHeight(index)  + channelSvgHeight(1) / 2})'>
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
        
        grid-column: 3;
    }
</style>
