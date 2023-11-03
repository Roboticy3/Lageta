<!-- home page, give list of assignments and freeplay -->

<script>

    let name = 'Lageta'

    let count = 0;

    function increment() {
        count += 1;
    }
</script>

<h1>Welcome to {name}!</h1>
<a href='/freeplay'>freeplay</a>

<button on:click={increment}>
    {count}
</button>
