<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { createCustomEvent } from "$lib/misc_types/CustomEventSystem";
    import { CircuitSignalSetView } from "$lib/signal_types/SignalSetView";
    import { CircuitSignalSetViewEventTarget } from "$lib/signal_types/SignalSetViewEvent";
    import Led from "./Led.svelte";

    /**
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {CircuitSignalSetView}
     */
    export let signalSetView

    /**
     * @type {any}
     */
    export let visible = true

    /**
     * @type {CircuitSignalSetViewEventTarget | null}
     */
    export let eventTarget = null
    $: { if (eventTarget) {
        eventTarget.addEventListener("play", onPlay)
        eventTarget.addEventListener("pause", onPause)
        eventTarget.addEventListener("step", onStep)
        eventTarget.addEventListener("done", onDone)
        eventTarget.addEventListener("restart", onRestart)
    }}

    let circuitValid = true
    let playing = false
    let failuerLedOn = false
    /**
     * @type {NodeJS.Timeout | null}
     */
    let failureFlashInterval = null
    $: if (!failureFlashInterval && !circuitValid && playing) {
        failureFlashInterval = setInterval(() => {
            console.log(failureFlashInterval)
            failuerLedOn = !failuerLedOn
        }, 125)
    }
    $: if (!playing && failureFlashInterval) {
        console.log("STOP FLASHING")
        clearInterval(failureFlashInterval)
        failureFlashInterval = null
    }

    //stop the user from using InputCheckBoxes while the signal is playing to avoid interrupting the verification process
    function onPlay() {
        playing = true
        document.querySelectorAll(`[id^="input-checkbox-"]`).forEach((n) => n.setAttribute('disabled','disabled'))
    }
    function onPause() {
        playing = false
        document.querySelectorAll(`[id^="input-checkbox-"]`).forEach((n) => n.removeAttribute('disabled'))
    }

    function onDone() {
        if (signalSetView.isCircuitValid()) {
            circuitController.complete()
            dispatchSignalEvent("complete")
        }
    }

    function onStep() {
        circuitValid = signalSetView.isCircuitValid()
        console.log("checking circuit valid ", circuitValid)
    }

    export function isCircuitValid() {
        return circuitValid
    }

    function onRestart() {
        circuitValid = true
    }

    /**
     * @param {import("$lib/signal_types/SignalSetViewEvent").SignalSetViewEventKey} type
     * @param {Object | undefined} [options]
     */
    function dispatchSignalEvent(type, options) {
        eventTarget?.dispatchEvent(
            createCustomEvent(
                {...{
                    frame:signalSetView.getPlayerFrame() || 0,
                    value:signalSetView.getPlayerValue() || []
                }, ...(options || {})},
                type,
                null
            )
        )
    }

    const root = document.documentElement; 
    const styles = getComputedStyle(root);
    const failureColor = styles.getPropertyValue('--failure-color');
    const verificationColor = styles.getPropertyValue('--verification-color');

</script>

{#if visible}
    <div class="error-container">
        <div>STATUS: </div>
        <Led on={failuerLedOn} color={failureColor}/>
        <Led color={verificationColor}/>
    </div>
    
{/if}

<style>

    .error-container {
        display:flex;
        width:100%;
        height:100%;
        align-items: center;
    }

    .failure {
        animation: tilt-shaking var(--animation-speed)
    }

    @keyframes tilt-shaking {
        0% { transform: rotate(0deg) scale(1); }
        25% { transform: rotate(5deg) scale(1.2); }
        50% { transform: rotate(0eg) scale(1.25); }
        75% { transform: rotate(-5deg) scale(1.2); }
        100% { transform: rotate(0deg) scale(1); }
    }
</style>