<script>
    import { Buf } from "$lib/circuit_types/Gate";

    //@ts-ignore
    import { TruthTable } from "$lib/circuit_types/TruthTable";

    /**
     * @type {TruthTable}
     */
    export let table = new TruthTable(Buf)
    console.log(table)

</script>

<div 
    class="truth-table" 
    style="min-width:{5 * table.colCount}%;"
    >
    {#each table.unpack() as s, i}
    <div class="truth-table-square" 
        style="grid-column: {(i % table.colCount) + 1}; grid-row: {Math.floor(i / table.colCount) + 1}"
        >
        {s}
    </div>
    {/each}

</div>

<style>
    .truth-table {
        display: grid;
        background-color: black;
        
        gap: 1px;
        padding: 1px;
    }

    .truth-table-square {
        background-color: white;
        padding: 2%;
    }
</style>