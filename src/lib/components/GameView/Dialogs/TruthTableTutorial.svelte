<script>
    import { TruthTable } from "$lib/circuit_types/TruthTable";
    import { getGateType, Not, Or3 } from "$lib/dat/GateTypes/GateTypes";
    import TruthTableView from "../TruthTableView.svelte";

</script>
<div>You've unlocked Truth Tables!</div>
<p>Truth Tables automatically display every combination of <span style="color:var(--connection-color-on);">high</span>/<span style="color:var(--connection-color-off);">low</span> inputs, paired with the correct outputs, wherever they can. They can be found beneath the instructions in most levels (if the instructions are too long, you will have to scroll down to see it), and when you hover over gates of certain types.</p>
<p>Truth Tables will not display if they have too many rows, or the circuit/gate has behavior that is too complex for a truth table to model.</p>
<p>Here's an example of a Truth Table for a Not Gate:</p>
<div style="width:75%;">
    <TruthTableView 
        truthTable={new TruthTable(getGateType(Not))} 
        customLabels={["Input", "Output"]}
        truthTableData={{}}
    />
</div>
