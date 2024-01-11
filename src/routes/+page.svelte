<!-- home page, give list of assignments and freeplay -->

<script>
    import { Freeplay } from "$lib/level_types/Level";

    let name = 'Lageta'

    let count = 0;

    function increment() {
        count += 1;
    }



</script>

<h1>Welcome to {name}!</h1>
<ul class="menu">
    <a href='/level/Freeplay'>freeplay</a>
    <a href='/campaign'>campaign</a>
</ul>


<button on:click={increment}>
    {count}
</button>

<style>
    .menu {
        display: flex;
        flex-direction: column;
    }
</style>
