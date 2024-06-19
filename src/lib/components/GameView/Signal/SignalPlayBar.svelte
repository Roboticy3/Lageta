<script>
    import { CircuitSignalSetView } from "$lib/signal_types/SignalSetView";
    import { CircuitSignalSetViewEventTarget } from "$lib/signal_types/SignalSetViewEvent";


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
    }

    /**
     * 
     * @param {{frame:number}} param0
     */
    function onStep({frame}) {
        setPlayBarProgress(frame)
    }

    function onRestart() {
        setPlayBarProgress(0)
    }

    /**
     * @type {SVGGElement}
     */
    let playBarGroup

    function setPlayBarProgress(frame = 0) {
        let adjustedFrame = frame - 1
        if (frame === 0) adjustedFrame = 0
        else if (frame === signalSetView.getLength()) adjustedFrame = signalSetView.getLength()
        const frameWidth = signalSetView.getDesiredFrameWidth()
        const translateX = frameWidth * (adjustedFrame)
        console.log("moving play bar to frame ", frame)
        if (playBarGroup) playBarGroup.style.translate = `${translateX}px`
        
    }

</script>

<g id="signal-svg-play-bar" bind:this={playBarGroup}>
    <path d="M -4 -8 L 4 -8 L 0 0 L 0 {signalSetView.getDesiredHeight()} L 0 0 Z" stroke="var(--circuit-color)" stroke-width="1px" fill="none"/>
</g>