<script>
    import { browser } from "$app/environment";
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";
    import { ProgressStorage } from "$lib/storage_types/ProgressStore";

    /**
     * @type {string[]}
     */
    let passedTutorials = []
    $: {
        if (browser) passedTutorials = (new ProgressStorage()).getPassedTutorials()
        console.log(passedTutorials)
    }
</script>
<ul>
{#each passedTutorials as tutorial} 
    <li><HeavyButton>{tutorial}</HeavyButton></li>
{/each}
</ul>