<script>
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";
import { createEventDispatcher, onMount, tick } from "svelte";

    const dispatch = createEventDispatcher();

    export let showButton = true;
    export let unavailable = false;
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

    const tutorialContinueStyle =
`
    pointer-events: initial;
    display: inline-flex;
    align-self: center;
`
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
            <HeavyButton
                style={tutorialContinueStyle}
                bind:unavailable={unavailable}
                on:click={() => {
                    dispatch("continue", "ev");
                }}
                
            >
                Continue
            </HeavyButton>
        {/if}
    </div>
</div>

<style>
    .tutorial-container {
        pointer-events: none;
        transition:
            left var(--animation-speed),
            top var(--animation-speed);
    }

    .tutorial-text {
        font-size: min(3vh, 2vw);
        box-sizing: border-box;
    }

</style>
