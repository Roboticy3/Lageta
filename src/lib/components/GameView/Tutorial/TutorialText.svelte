<script>
    export let button = true
    export let position = [50, 50]
</script>

<div style="position:absolute; left:{position[0]}%; top:{position[1]}%;">
    <div class="tutorial-text">
        <slot />
        {#if button }
            <button>Continue</button>
        {/if}
    </div>
</div>

<style>
    .tutorial-text {
        position:relative;
        left:-50%;
        display:flex;
        flex-direction: column;
        justify-content: center;
        font-size: xx-large;
    }
</style>