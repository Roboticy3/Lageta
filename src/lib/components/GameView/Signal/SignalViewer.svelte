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
        ["Live", `stroke="var(--circuit-color)" stroke-width="1" stroke-dasharray="2 1" `],
    ])

    /**
     * @type {CircuitSignalSetView}
     */
    export let signalSetView

    /**
     * @type {CircuitSignalSetViewEventTarget | null}
     */
    export let eventTarget = null
    $: {
        eventTarget?.addEventListener("step", onStep)
        eventTarget?.addEventListener("restart", onRestart)
        eventTarget?.addEventListener("update", onUpdate)
        eventTarget?.addEventListener("done", onDone)
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

    export let liveOnly = false

    /**
     * @type {CircuitController | null}
     */
    export let circuitController = null

    /**
     * @type {import("$lib/circuit_types/CircuitController").ConnectionIndex[]}
     */
    export let liveChannelSources = circuitController?.getOutputPoints() || []

    /**
     * @type {CircuitSignalSetView | null}
     */
    let liveSignalSetView = null
    
    /**
     * @type {string[]}
     */
    let liveChannelSvgs = []
    /**
     * @param {number} to
     */
     export function updateLiveChannelSvgs(to) {
        console.log("updating live channels ", to, channels, liveSignalSetView)
        if (liveSignalSetView) {
            const view = liveSignalSetView
            liveChannelSvgs = channels.map(channel => {
                if (channel.type === "Live")
                    return view.drawChannel(channel.idx, to, channelTypeParams.get("Live") || "")
                return ""
            })
        }
        console.log("drawing paths ", liveChannelSvgs)
        liveChannelSvgs = liveChannelSvgs
    }

    /**
     * @param {{frame:number}} param0
    */
    function onStep({frame}) {        
        updateLiveChannelSvgs(frame - 1)
    }

    /**
     * @param {{frame:number}} param0
    */
    function onUpdate({frame}) {
        const liveValues = liveChannelSources.map(
            source => circuitController?.getConnectionValue(source)
        )
        liveSignalSetView?.push(liveValues, frame - 1)
    }

    /**
     * @param {import("$lib/signal_types/SignalSetViewEvent").CircuitSignalSetViewEvent} param0
    */
    function onDone({frame}) {
        onUpdate({frame:frame})
        onStep({frame:frame + 1})
    }

    function onRestart() {
        liveSignalSetView = new CircuitSignalSetView(
            liveChannelSources.map(
                source => circuitController?.getConnectionValue(source)
            )
        )
        updateLiveChannelSvgs(0)
    }

    onMount(() => {
        onRestart()
    })

</script>

{#if !liveOnly}
    {#each channelSvgs as channelSvg, index}
        <g fill="none" transform="translate(0, {(signalSetView.getDesiredChannelHeight()) * index})">
            {@html channelSvg}
        </g>
    {/each}
{/if}
{#each liveChannelSvgs as channelSvg, index}
    <g fill="none" transform="translate(0, {(signalSetView.getDesiredChannelHeight()) * index})">
        {@html channelSvg}
    </g>
{/each}
<slot />