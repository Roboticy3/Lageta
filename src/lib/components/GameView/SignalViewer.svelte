<script>
    //@ts-ignore
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { SignalSetController } from "$lib/signal_types/SignalSetController";
    import { onMount } from "svelte";

    export let signalSetController = (new SignalSetController())
    let channelSvgs = signalSetController.drawChannels()
    signalSetController.frameTime = 100

    /**
     * @type {CircuitController | null}
    */
    export let gridController

    /**
     * @type {(() => void) | null}
     */
    export let updateSvg

    let [width, height] = [0, 0]

    /**
     * @type {HTMLDivElement}
     */
    let container

    function fixSvgHeader() {
        width = signalSetController.getDesiredWidth() + 10
        height = signalSetController
            .getDesiredHeight() + 10

        const aspect = width / height

        if (container === null) {
            return
        }
        const containerAspect = container.offsetWidth / container.offsetHeight

        if (aspect > containerAspect) {
            width = height * containerAspect
        }
    }

    let playBar = ""
    let playFrame = 0
    let playTranslateX = 0
    function fixPlayBar() {
        playTranslateX = playFrame * signalSetController.getFrameWidth()
        playBar = `<path d="M -4 -8 L 4 -8 L 0 0 L 0 ${height} L 0 0 Z" \
            stroke="salmon" stroke-width="2px" fill="salmon" />`
        fixOffset()
    }

    let offset = 0
    function fixOffset() {
        offset = Math.max(playTranslateX - width, 0)
    }

    function fixSvg() {
        fixPlayBar()
        fixSvgHeader()
    }

    onMount(fixSvg)

    window.addEventListener('resize', fixSvg)

    /**
     * @type {"▶" | "⏸"}
     */
    let button = "▶"

    function onPressPlay() {
        console.log(button)
        switch (button) {
            case "▶":
                button = "⏸"
                signalSetController.scrub((currentValue, currentFrame, update, done) => {
                    playFrame = currentFrame
                    fixPlayBar()
                    if (update) {
                        gridController?.setInputs(currentValue)
                        updateSvg?.call(updateSvg)
                    }
                    if (done) button = "▶"
                }, false)
                break;
            case "⏸":
                signalSetController.abortScrub()
                button = "▶"
                break;
        }
        
    }

</script>


<div 
    class="signal-shelf-container"
    bind:this={container}>
    <svg 
        viewBox="{offset - 4} -10 {width + 4} {height}"
        width="100%"
        class="signal-shelf">
        <g transform="translate({playTranslateX} 0)" >
            {@html playBar}
        </g>
        {#each channelSvgs.paths as svg}
            {@html svg}
        {/each}
    </svg>

    <button on:click={onPressPlay}>{button}</button>
</div>
    

<style>
    .signal-shelf-container {
        display:flex;
        width:50%;
        height:50%;
        background-color: white;
        flex-direction: column;
    }
    .signal-shelf {
        margin:5%;
        margin-left:0;
    }
</style>