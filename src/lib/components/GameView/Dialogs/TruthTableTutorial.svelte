<script>
    import { TruthTable } from "$lib/circuit_types/TruthTable";
    import { getGateType, Or3 } from "$lib/dat/GateTypes/GateTypes";
    import TruthTableView from "../TruthTableView.svelte";

</script>
<div>You've unlocked Truth Tables!</div>
<p>Truth Tables automatically display cases wherever they can. They can be found beneath the instructions in most levels (if the instructions are too long, you will have to scroll down to see it).</p>
<p>Here's an example of a Truth Table for a 3-Input Or Gate:</p>
<div style="width:75%;">
    <TruthTableView 
        truthTable={new TruthTable(getGateType(Or3))} 
        customLabels={["Input 1", "Input 2", "Input 3", "Output"]}
    />
</div>
