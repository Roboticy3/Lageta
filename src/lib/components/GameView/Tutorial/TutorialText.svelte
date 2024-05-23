<script>
    import { onMount, tick } from "svelte";

    export let button = true
    export let position = [50, 50]

    export let style = ""

    /**
     * @param {number} pX
     * @param {number} pY
     */
    export function setPosition(pX, pY) {
        position[0] = pX
        position[1] = pY
    }
</script>

<div style="position:absolute; left:{position[0]}%; top:{position[1]}%;">
    <div style={style}>
        <div class="tutorial-text">
            <slot />
            {#if button }
                <button>Continue</button>
            {/if}
        </div>
    </div>
</div>

<style>
    .tutorial-text {
        transition: left 1s, top 1s;
        animation-name: --position-anim;
        animation-duration: 1s;
        position:relative;
        left:-50%;
        display:flex;
        flex-direction: column;
        justify-content: center;
        font-size: xx-large;
    }

    @keyframes --position-anim {
        0% {
            transform:translateY(100%);
        }

        100% {
            transform:translateY(0%);
        }
    }
</style>