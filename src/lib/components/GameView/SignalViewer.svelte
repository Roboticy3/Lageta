<script>
    //@ts-ignore
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { CircuitSignalSetView } from "$lib/signal_types/SignalSetView";
    import { onMount } from "svelte";

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

    let height = 0
    let width = 0

    /**
     * @type {HTMLDivElement | null}
     */
    let svgContainer = null

    function updateSvg() {
        if (svgContainer === null) return
        width = svgContainer.offsetWidth
        height = svgContainer.offsetHeight
        console.log("signalviewer dimensions: ", width, height)
        const ratio = width / height

    }

    onMount(() => {
        updateSvg()
        window.addEventListener('resize', updateSvg)
    })

</script>

<div class="signal-container">
    <div class="svg-container" bind:this={svgContainer}>
        <svg viewBox="0 0 {signalSetView.getDesiredWidth()} {signalSetView.getDesiredHeight()}">
            {#each channelSvgs as channel, index}
                <g transform="translate(0, {signalSetView.getDesiredChannelHeight(index)})">
                    {@html channel}
                </g>
            {/each}
        </svg>
    </div>
</div>

<style>
    .signal-container {
        padding:5%;
    }


</style>