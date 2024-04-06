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

<ResizingSvg lockHeight={signalSetView.getDesiredHeight()}>
    <circle r="50" cx="10" cy="10" fill="red" />
</ResizingSvg>