<script>
    import ResizingSvg from "$lib/components/Misc/ResizingSvg.svelte";
    import { CircuitSignalSetView } from "$lib/signal_types/SignalSetView";
    import { CircuitSignalSetViewEventTarget } from "$lib/signal_types/SignalSetViewEvent";
    import { onMount } from "svelte";

    /**
     * @type {{type:"Given" | "Expected" | "Live", idx:number}[]}
     */
    export let channels
    const channelTypeParams = new Map([
        ["Given", `stroke="var(--circuit-color)", stroke-width="1"`],
        ["Expected", `stroke="var(--verification-color)", stroke-width="1"`],
        ["Live", `stroke="var(--circuit-color)", stroke-width="1" stroke-dasharray="1"`],
    ])

    /**
     * @type {Map<import("$lib/circuit_types/CircuitController").ConnectionIndex, number>}
     */
    export let liveChannelSources = new Map()

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
    <g fill="none" stroke="black" stroke-width="1" transform="translate(0, {(signalSetView.getDesiredChannelHeight()) * index})">
        {@html channelSvg}
    </g>
{/each}
<slot />