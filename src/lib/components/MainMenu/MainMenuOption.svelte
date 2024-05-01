<script>
    import { goto } from "$app/navigation";
    import { Buf, getGateType, wrapGateTypeViewInSvgHeader } from "$lib/dat/GateTypes/GateTypes";
    import ResizingSvg from "../Misc/ResizingSvg.svelte";

    export let vType = getGateType(Buf).view

    /**
     * @type {string | URL}
     */
     export let path

    /**
     * @type {string}
     */
     export let name

    /**
     * @param {MouseEvent} e
     */
    function onClick(e) {
        goto(path)
    }
</script>

<button class="option" on:click={onClick} title={name}>
    {@html wrapGateTypeViewInSvgHeader(vType.gridWidth, vType.gridHeight, vType.draw(), `height="20px"`)}
    
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
        height:10%;
    }
</style>