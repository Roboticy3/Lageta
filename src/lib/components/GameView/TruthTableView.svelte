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

    export let verticalSeparators = [truthTable.sizeIn]

    export let border = true

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

    /**
     * @param {number} row
     */
    function getBackgroundColorOfRow(row) {
        const even = (row % 2) === 0
        return even ? "var(--main-bg-color)" : "var(--secondary-bg-color)"
    }
</script>

<div 
    class="truth-table {border ? 'ridge':''}" 
    style="
        grid-template-columns:repeat({truthTable.getWidth()}, 1fr);
        grid-template-rows:repeat({truthTable.getHeight() + 1}, 1fr);
    "
>

    {#each truthTable.columnLabels as columnLabel, i}
        <div style="grid-column:{i + 1}; grid-row:1;">{customLabels?.at(i) || columnLabel}</div>
    {/each}

    <div class="title-bar" style="grid-column:1 / {truthTable.getWidth() + 1}; grid-row:1;"></div>

    {#each truthTable.matrix as row, i}
        {#each row as v, j}
            <div style="grid-column:{j + 1}; grid-row:{i + 2}; background-color:{getBackgroundColorOfRow(i)}">{@html booleanToLabel(v)}</div>
        {/each}
    {/each}

    {#each verticalSeparators as verticalSeparator} 
        <div class="column-bar" style="grid-column: {verticalSeparator + 1}; grid-row: 1 / {truthTable.getHeight() + 2};"></div>
    {/each}

</div>

<style>
    .truth-table {
        display:grid;
        text-align: center;
        background-color: var(--main-bg-color);

        min-width:100%;
    }

    .title-bar {
        border-bottom: 2px solid black;
    }

    .column-bar {
        border-left: 2px solid black;
        min-width: 1em;
    }
</style>