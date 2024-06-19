
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { CircuitSignalSetView } from "$lib/signal_types/SignalSetView";
    import { CircuitSignalSetViewEventTarget } from "$lib/signal_types/SignalSetViewEvent";
    import SignalShelf from "../Signal/SignalShelf.svelte";
    import SignalViewer from "../Signal/SignalViewer.svelte";

    const labels = [
        `<span style="color:var(--verification-color)">Desired Output</span>`,
        `<span style="color:var(--circuit-color)">Measured Output</span>`,
    ]

    /**
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {CircuitSignalSetViewEventTarget | null}
     */
    export let signalSetViewEventTarget

    /**
     * @type {CircuitSignalSetView}
     */
    export let signalSetView

</script>

<SignalShelf 
    circuitController={circuitController} 
    signalSetView={signalSetView} 
    labels={labels}
    bind:signalSetViewEventTarget={signalSetViewEventTarget}
>
    <g fill="none" transform="translate(0, 0)">
        <SignalViewer 
            signalSetView={signalSetView}
            channels={[{type:"Expected",idx:signalSetView.getInputSize()}]}
        />
    </g>
    <g fill="none" transform="translate(0, {signalSetView.getDesiredChannelHeight(1)})">
        <SignalViewer 
            bind:eventTarget={signalSetViewEventTarget}
            signalSetView={signalSetView}
            circuitController={circuitController}
            liveOnly={true}
            channels={[{type:"Live",idx:0}]}
        />
    </g>
</SignalShelf>