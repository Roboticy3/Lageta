<script>
    import { SignalSetController } from "$lib/signal_types/SignalSetController";
    import { onMount } from "svelte";

    export let signalSetController = (new SignalSetController())
    let channelSvgs = signalSetController.drawChannels()

    let [width, height] = [0, 0]

    /**
     * @type {HTMLDivElement}
     */
    let container

    function fixSvgHeader() {
        width = signalSetController
            .getDesiredWidth()
        height = signalSetController
            .getDesiredHeight()

        const aspect = width / height

        if (container === null) {
            return
        }
        const containerAspect = container.offsetWidth / container.offsetHeight

        if (aspect > containerAspect) {
            width = height * containerAspect
        }
    }

    onMount(() => {
        fixSvgHeader()
    })

    window.addEventListener('resize', fixSvgHeader)

</script>


<div 
    class="signal-shelf-container"
    bind:this={container}>
    <svg 
        viewBox="-2 -2 {width} {height}"
        width="50%"
        class="signal-shelf">
        {#each channelSvgs.paths as svg}
            {@html svg}
        {/each}
    </svg>
</div>
    

<style>
    .signal-shelf-container {
        display:flex;
        width:50%;
        height:50%;
        background-color: white;
    }
    .signal-shelf {
        margin:5%;
        margin-left:0;
    }
</style>