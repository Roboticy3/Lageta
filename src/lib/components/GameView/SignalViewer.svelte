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
        playTranslateX = playFrame * signalSetController.getDesiredFrameWidth()
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
                s.startPlayer(scrubStep.bind(scrubStep, g), false)
                break;
            case "⏸":
                signalSetController.pausePlayer()
                if (updateSvg) updateSvg()
                button = "▶"
                break;
        }    
    }

    let outputSignalSetController = new SignalSetController(
        signalSetController.getOutputSize()
    )
    let outputSvgs = outputSignalSetController.drawChannels()

    function resetOutputSvgs() {
        outputSignalSetController = new SignalSetController(
            signalSetController.getOutputSize()
        )
        outputSvgs = outputSignalSetController.drawChannels()
    }

    /**
     * @param {CircuitController} g
     * @param {boolean[]} currentValue
     * @param {number} currentFrame
     * @param {boolean} update
     * @param {boolean} done
     */
    function scrubStep(g, currentValue, currentFrame, update, done) {
        playFrame = currentFrame
        fixPlayBar()
        if (update) {
            const result = signalSetController.validateControllerWith(g, currentValue)
            
            console.log(result)
            outputSignalSetController.push(result, currentFrame - 1)

            updateSvg?.call(updateSvg)
        }
        outputSvgs = outputSignalSetController.drawChannels(
           currentFrame,
            `stroke-width="1px" stroke="red" fill="none"`
        )
        if (done) {
            button = "▶"
            if (playFrame === signalSetController.frameCount()) {
                if (signalSetController.validatedWithController()) {
                    g.complete()
                }
                //onClickRestart()
            }
        }
    }

    function onClickRestart() {
        button = "⏸"
        onClickPlay()
        signalSetController.resetPlayer()
        resetOutputSvgs()
        playFrame = 0
        playTranslateX = 0
        fixPlayBar()
        if (gridController) {
            signalSetController.forceValidate()
            gridController.setInputs(signalSetController.getDefaultInputs())
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
        {#each channelSvgs as svg}
            {@html svg}
        {/each}
        <g transform="translate(0, {
            signalSetController
            .getDesiredChannelHeight(
                signalSetController
                .getInputSize()
            )
        })" >
            {#each outputSvgs as svg}
            {@html svg}
            {/each}
        </g>
    </svg>

    <button on:click={onClickPlay}>{button}</button>
    <button on:click={onClickRestart}>Restart</button>
</div>
    

<style>
    .signal-shelf-container {
        display:flex;
        width:100%;
        height:50%;
        background-color: white;
        flex-direction: column;
    }
    .signal-shelf {
        margin:5%;
        margin-left:0;
    }
</style>