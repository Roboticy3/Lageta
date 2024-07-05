<script>
    import { onMount } from "svelte";

    /**
     * @type {string[]}
     */
    export let newGates

    /**
     * @type {string[]}
     */
    export let newLevels

</script>

<div class="container">
    <div class="title-container">
        <div class="title">
            You Win!
        </div>
        <h2>
            You unlocked:
        </h2>
    </div>
    <div class="rewards-container">
        <div>
            <h2>New Gates:</h2>
            {#each newGates as gate}
                <div>{gate}</div>
            {/each}
        </div>
        <div>
            <h2>New Levels:</h2>
            {#each newLevels as level}
                <div>{level}</div>
            {/each}
        </div>
    </div>
    <div class="to-level-select">
        <button 
            on:click={() => {window.location.pathname = "/campaign"}}
        >
            See Level Select Screen
        </button>
    </div>
</div>

<style>

    .container {

        display:flex;
        flex-direction: column;
        justify-content:space-between;
    }

    .title-container {
        align-items: center;

        display:flex;
        flex-direction: column;
    }

    .title {
        margin: 1em;
        font-size: min(5vw, 5vh);
        color:var(--text-color);
        text-shadow: 0.06em 0.06em var(--connection-color-on), -0.06em -0.06em var(--connection-color-off);
    }

    .rewards-container {
        display:flex;
        justify-content:space-between;
        flex-direction:row;

        text-align: center;
    }

    .to-level-select {
        display: inline-flex;
        align-self: center;
    }
</style>