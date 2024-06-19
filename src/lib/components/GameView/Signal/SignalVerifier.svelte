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
     * @type {CircuitSignalSetViewEventTarget | null}
     */
    export let eventTarget = null
    $: {
        eventTarget?.addEventListener("play", onPlay)
        eventTarget?.addEventListener("pause", onPause)
        eventTarget?.addEventListener("step", onStep)
        eventTarget?.addEventListener("done", onDone)
        eventTarget?.addEventListener("restart", onRestart)
    }

    let isCircuitValid = true
    let playing = false

    //stop the user from using InputCheckBoxes while the signal is playing to avoid interrupting the verification process
    function onPlay() {
        playing = true
        document.querySelectorAll("input").forEach((n) => n.setAttribute('disabled','disabled'))
    }
    function onPause() {
        playing = false
        document.querySelectorAll("input").forEach((n) => n.removeAttribute('disabled'))
    }

    function onDone() {
        if (signalSetView.isCircuitValid()) {
            circuitController.complete()
            dispatchSignalEvent("complete")
        }
    }

    function onStep() {
        isCircuitValid = signalSetView.isCircuitValid()
        console.log("checking circuit valid ", isCircuitValid)
    }

    function onRestart() {
        isCircuitValid = true
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

{#if playing}
    {#if isCircuitValid}
        <span style="color:var(--verification-color);">Correct!</span> 
        <p>Keep playing to <span style="color:var(--verification-color);">verify</span> the <span style="color:var(--circuit-color);">circuit</span>!</p>
    {:else}
        <span style="color:var(--failure-color);">Incorrect!</span> 
        <p>Restart the <span style="color:var(--circuit-color);">signal</span> and edit your <span style="color:var(--circuit-color);">circuit</span> to try again.</p>
    {/if}
{/if}
