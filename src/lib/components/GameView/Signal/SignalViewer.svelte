<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import ResizingSvg from "$lib/components/Misc/ResizingSvg.svelte";
    import { CircuitSignalSetView } from "$lib/signal_types/SignalSetView";
    import { CircuitSignalSetViewEventTarget } from "$lib/signal_types/SignalSetViewEvent";
    import { onMount } from "svelte";

    /**
     * @type {{type:"Given" | "Expected" | "Live", idx:number}[]}
     */
    export let channels
    const channelTypeParams = new Map([
        ["Given", `stroke="var(--circuit-color)" stroke-width="1" `],
        ["Expected", `stroke="var(--verification-color)" stroke-width="1" `],
        ["Live", `stroke="var(--circuit-color)" stroke-width="1" stroke-dasharray="1" `],
    ])

    /**
     * @type {CircuitSignalSetView}
     */
    export let signalSetView

    /**
     * @type {CircuitSignalSetViewEventTarget | null}
     */
    export let eventTarget
    $: {
        eventTarget?.addEventListener("step", onStep)
        eventTarget?.addEventListener("restart", onRestart)
    }

    export let frameLength = signalSetView.getLength()
    $: updateChannelSvgs(frameLength)

    /**
     * @type {string[]}
     */
    let channelSvgs = []
    export function updateChannelSvgs(to=frameLength) {
        channelSvgs = channels.map(channel => {
            return signalSetView.drawChannel(channel.idx, to, channelTypeParams.get(channel.type) || "")
        })

        if (to === 0) throw Error("how")
    }

    /**
     * @type {import("$lib/circuit_types/CircuitController").ConnectionIndex[]}
     */
    export let liveChannelSources = []

    let liveSignalSetView = new CircuitSignalSetView(
        liveChannelSources.map(
            source => circuitController?.getConnectionValue(source)
        )
    )

    /**
     * @type {CircuitController | null}
     */
    export let circuitController = null

    export let liveFrameLength = 0
    $: updateLiveChannelSvgs(liveFrameLength)

    let liveChannelSvgs = []
    export function updateLiveChannelSvgs(to=liveFrameLength) {
        liveChannelSvgs = channels.map(channel => {
            if (channel.type === "Live")
                return liveSignalSetView.drawChannel(channel.idx, to, channelTypeParams.get("Live") || "")
            return ""
        })
    }

    /**
     * @param {import("$lib/signal_types/SignalSetViewEvent").CircuitSignalSetViewEvent} param0
    */
    function onStep({frame, value}) {
        
    }

    function onRestart() {

    }

</script>

{#each channelSvgs as channelSvg, index}
    <g fill="none" transform="translate(0, {(signalSetView.getDesiredChannelHeight()) * index})">
        {@html channelSvg}
    </g>
{/each}
<slot />