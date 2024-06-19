<script>
    import ResizingSvg from "$lib/components/Misc/ResizingSvg.svelte";
    import { CircuitSignalSetView } from "$lib/signal_types/SignalSetView";
    import { onMount } from "svelte";

    /**
     * @type {number[]}
     */
     export let channels

    /**
     * @type {CircuitSignalSetView}
     */
    export let signalSetView

    export let height = 20
    export let margin = 4

    /**
     * @type {string[]}
     */
    let inputChannelSvgs = []
    /**
     * @type {string[]}
     */
    let outputChannelSvgs = []
    function updateChannelSvgs(to=signalSetView.getLength(), extraParams="") {
        for (const channel of channels) {
            const channelSvg = signalSetView.drawChannel(channel, to, extraParams)
            switch (signalSetView.getChannelType(channel)) {
                case "Input": 
                    inputChannelSvgs.push(channelSvg)
                    break
                case "Output":
                    outputChannelSvgs.push(channelSvg)
                    break
            }
        }
        inputChannelSvgs = inputChannelSvgs
        outputChannelSvgs = outputChannelSvgs
    }

    onMount(() => {
        updateChannelSvgs()
        console.log("inputs: ", inputChannelSvgs, "outputs: ", outputChannelSvgs)
    })

</script>

{#each inputChannelSvgs as inputChannelSvg, index}
    <g fill="none" stroke="black" stroke-width="1" transform="translate(0, {(height + margin) * index})">
        {@html inputChannelSvg}
    </g>
{/each}
{#each outputChannelSvgs as outputChannelSvg, index}
    <g fill="none" stroke="black" stroke-width="1" transform="translate(0, {(height + margin) * (index + inputChannelSvgs.length)})">
        {@html outputChannelSvg}
    </g>
{/each}
<slot />