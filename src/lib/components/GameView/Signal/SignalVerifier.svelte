<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
    import { createCustomEvent } from "$lib/misc_types/CustomEventSystem";
    import { CircuitSignalSetView } from "$lib/signal_types/SignalSetView";
    import { CircuitSignalSetViewEventTarget } from "$lib/signal_types/SignalSetViewEvent";

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

</script>

{#if playing && visible}
    {#if circuitValid}
        <div class="success">
            <span style="color:var(--verification-color);">Correct!</span> 
            <p>Keep playing to <span style="color:var(--verification-color);">verify</span> the <span style="color:var(--circuit-color);">circuit</span>!</p>
        </div>
    {:else}
        <div class="failure">
            <span style="color:var(--failure-color);">Incorrect!</span> 
            <p>Restart the <span style="color:var(--circuit-color);">signal</span> and edit your <span style="color:var(--circuit-color);">circuit</span> to try again.</p>
        </div>
    {/if}
{/if}

<style>

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