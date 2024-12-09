<script>
    import { browser } from "$app/environment";
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
    let failureLedOn = false
    let validLedOn = false
    /**
     * @type {NodeJS.Timeout | null}
     */
    let failureFlashInterval = null
    $: if (!failureFlashInterval && !circuitValid && playing) {
        failureFlashInterval = setInterval(() => {
            console.log(failureFlashInterval)
            failureLedOn = !failureLedOn
        }, 125)
    } else if (playing) {
        validLedOn = circuitValid
    }
    $: if (!playing && failureFlashInterval) {
        console.log("STOP FLASHING")
        clearInterval(failureFlashInterval)
        failureFlashInterval = null
    } else if (!playing) {
        validLedOn = false
        failureLedOn = false
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

    
    let failureColor = "#00000"
    let verificationColor = "#00000"
    $: if (browser) {
        const root = document.documentElement; 
        const style = getComputedStyle(root)
        failureColor = style.getPropertyValue('--failure-color');
        verificationColor = style.getPropertyValue('--verification-color');
    }

</script>

{#if visible}
    <div class="error-container">
        <div>STATUS: </div>
        <div style="height:2em; width:2em;">
            <Led on={failureLedOn} color={failureColor}/>
        </div>
        <div style="height:2em; width:2em;">
            <Led on={validLedOn} color={verificationColor}/>
        </div>
    </div>
    
{/if}

<style>

    .error-container {
        display:flex;
        width:100%;
        height:100%;
        align-items: center;
    }
</style>