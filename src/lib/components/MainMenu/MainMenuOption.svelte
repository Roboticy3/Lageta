<script>
    import { goto } from "$app/navigation";
    import { Buf, getGateType, wrapGateTypeViewInSvgHeader } from "$lib/dat/GateTypes/GateTypes";

    export let vType = getGateType(Buf).view

    export let path = ""

    /**
     * @param {MouseEvent} e
     */
    function onClick(e) {
        goto(path)
    }
</script>

<button class="option" on:click={onClick}>
    {@html wrapGateTypeViewInSvgHeader(vType.gridWidth, vType.gridHeight, vType.draw())} 
    <div class="option-text">
        <slot />
    </div>
</button>

<style>
    .option {
        display:flex;
        justify-content:space-between;
        flex-direction:row;
        background:none;
        height:20px;
    }
    .option:hover {
        background:var(--secondary-bg-color);
    }
    .option-text {
        font-family: monospace;
    }
</style>