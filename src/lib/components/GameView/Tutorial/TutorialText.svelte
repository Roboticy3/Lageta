<script>
    import { createEventDispatcher, onMount, tick } from "svelte";

    const dispatch = createEventDispatcher()

    export let showButton = true
    export let position = [50, 50]

    /**
     * @param {number} pX
     * @param {number} pY
     */
    export function setPosition(pX, pY) {
        position[0] = pX
        position[1] = pY
    }
</script>

<div class="tutorial-container" style="position:absolute; left:{position[0]}%; top:{position[1]}%;">
    <div class="tutorial-text">
        <slot />
    </div>
    {#if showButton }
        <button class="tutorial-continue" on:click={() => {dispatch('continue', 'ev')}}>Continue</button>
    {/if}
</div>

<style>
    .tutorial-container {
        pointer-events:none;
        display:flex;
        flex-direction: column;
        transition: left 1s, top 1s;
        animation-name: --position-anim;
        animation-duration: 1s;
    }

    .tutorial-text {
        position:relative;
        font-size:large;
        left:-50%;
        scale:1.5;
    }

    .tutorial-continue {
        position:relative;
        pointer-events:initial;
        display: inline-flex;
        align-self: center;
        left:-50%;
    }

    @keyframes --position-anim {
        0% {
            translate: 0 100%;
        }

        100% {
            translate: 0 0;
        }
    }
</style>