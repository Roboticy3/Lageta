<script>
    //@ts-ignore
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { TestSignalSet } from "$lib/signal_types/Signal";
    import { SignalSetController } from "$lib/signal_types/SignalSetController";
    import { onMount } from "svelte";

    export let signalSetController = (new SignalSetController(TestSignalSet))
    let channelSvgs = signalSetController.drawChannels()
    signalSetController.createPlayer(100)

    /**
     * @type {CircuitController | null}
    */
    export let gridController
    if (gridController) signalSetController.sendPlayerToController(gridController)

    /**
     * @type {(() => void) | null}
     */
    export let updateSvg
    console.log(updateSvg)

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
     * @param {MouseEvent} e
     */
     function onClickSvg(e) {
        console.log(e)
    }

    /**
     * @type {"▶" | "⏸"}
     */
    let button = "▶"

    function onClickPlay() {
        if (gridController === null) {
            console.log("There should be a controller here!")
            return
        }
        let g = gridController
        const s = signalSetController

        if (!s.isPlayerActive()) {
            console.log("Player has not been created!")
            return
        }

        switch (button) {
            case "▶":
                button = "⏸"
                g.setInputs(s.getPlayerValue() || [])
                if (updateSvg) updateSvg()
                s.startPlayer((currentValue, currentFrame, update, done) => {
                    playFrame = currentFrame
                    fixPlayBar()
                    if (update) {
                        g.setInputs(currentValue)
                        console.log(g.getOutputs())
                        updateSvg?.call(updateSvg)
                    }
                    if (done) button = "▶"
                }, false)
                break;
            case "⏸":
                signalSetController.pausePlayer()
                if (updateSvg) updateSvg()
                button = "▶"
                break;
        }    
    }

    function onClickRestart() {
        button = "⏸"
        onClickPlay()
        signalSetController.resetPlayer()
        playFrame = 0
        playTranslateX = 0
        fixPlayBar()
        if (gridController) {
            console.log(signalSetController.getPlayerValue())
            gridController.setInputs(signalSetController.getPlayerValue() || [])
            if (updateSvg) updateSvg()
        }
         
    }

</script>


<div 
    class="signal-shelf-container"
    bind:this={container}>
    <svg 
        on:click={onClickSvg}
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

    <button on:click={onClickPlay}>{button}</button>
    <button on:click={onClickRestart}>Restart</button>
</div>
    

<style>
    .signal-shelf-container {
        display:flex;
        width:100%;
        height:25%;
        background-color: white;
        flex-direction: column;
    }
    .signal-shelf {
        margin:5%;
        margin-left:0;
    }
</style>