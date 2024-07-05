<script>
    import { TruthTable } from "$lib/circuit_types/TruthTable";

    /**
     * @type {TruthTable}
     */
    export let truthTable

    /**
     * @type {string[] | null}
     */
    export let customLabels = null

    /**
     * @param {boolean} value
     */
    function booleanToLabel(value) { 
        let color = ""
        switch (value) {
            case true: 
                color = `<div style="color:var(--connection-color-on);">1</div>`
                break
            case false: 
                color = `<div style="color:var(--connection-color-off);">0</div>`
                break
        }
        return color
    }
</script>

<div 
    class="truth-table" 
    style="
        grid-template-columns:repeat({truthTable.getWidth()}, 1fr);
        grid-template-rows:repeat({truthTable.getHeight() + 1}, 1fr);
    "
>

{#each customLabels || truthTable.columnLabels as columnLabel, i}
    <div style="grid-column:{i + 1}; grid-row:1;">{columnLabel}</div>
{/each}

{#each truthTable.matrix as row, i}
    {#each row as v, j}
        <div style="grid-column:{j + 1}; grid-row:{i + 2};">{@html booleanToLabel(v)}</div>
    {/each}
{/each}

</div>

<style>
    .truth-table {
        display:grid;
        text-align: center;
    }
</style>