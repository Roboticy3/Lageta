<script>
    import { createEventDispatcher, onMount, tick } from "svelte";

    const dispatch = createEventDispatcher()

    export let showButton = true
    export let availableButton = true
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
    <div style="left:-50%; position:relative; display:flex; flex-direction:column">
        <div class="tutorial-text">
            <slot />
        </div>
        {#if showButton === true}
            <button 
                class="tutorial-continue {availableButton ? '':'unavailable'}"
                on:click={() => {dispatch('continue', 'ev')}}
                data-testid="continue"
            >
                Continue
            </button>
        {/if}
    </div>
</div>

<style>
    .tutorial-container {
        pointer-events:none;
        transition: left 1s, top 1s;
        animation-name: --position-anim;
        animation-duration: 1s;
    }

    .tutorial-text {
        font-size:large;
        scale:1.5;
        padding:5%;
        box-sizing: border-box;
    }

    .tutorial-continue {
        pointer-events:initial;
        display:inline-flex;
        align-self:center;
    }

    .unavailable {
        filter:blur(2px) brightness(50%);
        pointer-events: none;
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