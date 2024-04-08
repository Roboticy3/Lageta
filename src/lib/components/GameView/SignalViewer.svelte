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

    /**
     * @type {CircuitController}
    */
    export let circuitController

</script>

<div class="signal-viewer-container">
    <div class="button-container">
        blahblahblah
    </div>
    <div class="svg-container">
        <ResizingSvg ancestry={2}>
            {#each channelSvgs as channel, index}
                <g transform='translate(0, {signalSetView.getDesiredChannelHeight(index)})'>
                    {@html channel}
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
        overflow:hidden;
    }

    .svg-container {
        
        grid-column: 3;
    }
</style>
