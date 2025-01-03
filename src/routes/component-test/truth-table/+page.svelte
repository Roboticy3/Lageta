<script>
    import { randomTruthTable } from "$lib/circuit_types/TruthTable";
    import TruthTableView from "$lib/components/GameView/TruthTableView.svelte";

</script>
<TruthTableView truthTable={randomTruthTable({sizeIn:8,sizeOut:4}, 0.5, "Random")} truthTableData={{}}/>