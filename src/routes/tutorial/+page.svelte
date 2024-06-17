<script>
    import { browser } from "$app/environment";
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
    <li><button>{tutorial}</button></li>
{/each}
</ul>