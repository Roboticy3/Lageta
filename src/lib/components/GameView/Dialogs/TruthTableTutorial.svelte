<script>
    import { TruthTable } from "$lib/circuit_types/TruthTable";
    import { getGateType, Not, Or3 } from "$lib/dat/GateTypes/GateTypes";
    import TruthTableView from "../TruthTableView.svelte";

</script>
<div>You've unlocked Truth Tables!</div>
<p>Truth Tables automatically display every combination of <span style="color:var(--connection-color-on);">high</span>/<span style="color:var(--connection-color-off);">low</span> inputs, paired with expected outputs, wherever they can. They can be found beneath the instructions in most levels, and when you hover over gates of certain types.</p>
<p>Here's an example of a Truth Table for a Not Gate:</p>
<div style="width:75%;">
    <TruthTableView 
        truthTable={new TruthTable(getGateType(Not))} 
        customLabels={["Input", "Output"]}
        truthTableData={{}}
    />
</div>
<p>If you ever get stuck on a level, consult a nearby Truth Table to see how outputs relate to inputs.</p>

