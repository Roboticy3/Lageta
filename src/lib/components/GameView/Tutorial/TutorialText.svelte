<script>
    import { createEventDispatcher, onMount, tick } from "svelte";

    const dispatch = createEventDispatcher();

    export let showButton = true;
    export let availableButton = true;
    export let position = [50, 50];

    /**
     * @type {[number, number] | undefined}
     */
    export let initialPosition = [50, 100];

    /**
     * @param {number} pX
     * @param {number} pY
     */
    export function setPosition(pX, pY) {
        position[0] = pX;
        position[1] = pY;
    }

    onMount(async () => {
        console.log("placing tutorial text")

        if (!initialPosition) return

        setTimeout(() => {
            initialPosition = undefined
        }, 100)
    })
</script>

<div
    class="tutorial-container"
    style="position:absolute; left:{initialPosition?.at(0) || position[0]}%; top:{initialPosition?.at(1) || position[1]}%;"
>
    <div
        style="left:-50%; position:relative; display:flex; flex-direction:column"
    >
        <div class="tutorial-text">
            <slot />
        </div>
        {#if showButton === true}
            <button
                class="tutorial-continue {availableButton ? '' : 'unavailable'}"
                on:click={() => {
                    dispatch("continue", "ev");
                }}
                data-testid="continue"
            >
                Continue
            </button>
        {/if}
    </div>
</div>

<style>
    .tutorial-container {
        pointer-events: none;
        transition:
            left 1s,
            top 1s;
    }

    .tutorial-text {
        font-size: min(3vh, 2vw);
        box-sizing: border-box;
    }

    .tutorial-continue {
        pointer-events: initial;
        display: inline-flex;
        align-self: center;
    }

    .unavailable {
        filter: blur(2px) brightness(50%);
        pointer-events: none;
    }
</style>
