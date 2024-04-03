<script>
    //@ts-ignore
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { TestSignalSet } from "$lib/signal_types/Signal";
    import { SignalSetController } from "$lib/signal_types/SignalSetController";
    import { onMount } from "svelte";

    /**
     * @type {SignalSetController}
     */
    export let signalSetController
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

    export let labelWidth = 30

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

    /**
     * @type {string[]}
     */
    let labels = []
    function fixLabels() {
        if (gridController === null) return
        labels = gridController.getInputLabels()
        labels.push(...gridController.getOutputLabels())
        console.log(labels)
    }

    function fixSvg() {
        fixPlayBar()
        fixSvgHeader()
        fixLabels()
    }

    onMount(fixSvg)

    window.addEventListener('resize', fixSvg)

    /**
     * @type {"▶" | "⏸"}
     */
    let button = "▶"

    function onClickPlay() {
        if (gridController === null) {
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
                if (playFrame === signalSetController.frameCount()) {
                    onClickRestart()
                }
                button = "⏸"
                s.startPlayer(scrubStep.bind(scrubStep, g), false)
                g.setInputs(s.getPlayerValue() || [])
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

    /**
     * @param {number} channel
     */
    function getChannelHeight(channel) {
        return signalSetController.getDesiredChannelHeight(channel)
    }

</script>


<div 
    class="signal-shelf-container"
    bind:this={container}>
    <svg 
        viewBox="{offset - 4} -10 {width + 4} {height}"
        width="100%"
        class="signal-shelf">
        <g transform="translate({playTranslateX + labelWidth} 0)" >
            {@html playBar}
        </g>
        {#each labels as label, i} 
            <text 
                y={getChannelHeight(i) + signalSetController.height / 2} 
                x=0
                font-size={signalSetController.height / 4}
            >
                {label}
            </text>
        {/each}
        <g transform="translate({labelWidth} 0)">
            {#each channelSvgs as svg, i}
                <g transform="translate(0, {getChannelHeight(i)})">
                    {@html svg}
                </g>
            {/each}
            <g transform="translate(0, {getChannelHeight(signalSetController.getInputSize())})" >
                {#each outputSvgs as svg, i}
                    <g transform="translate(0, {getChannelHeight(i)})">
                        {@html svg}
                    </g>
                {/each}
            </g>
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