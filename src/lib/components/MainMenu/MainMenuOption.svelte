<script>
    import { goto, invalidateAll } from "$app/navigation";
    import { Buf, getGateType, wrapGateTypeViewInSvgHeader } from "$lib/dat/GateTypes/GateTypes";
    import HeavyButton from "../Misc/HeavyButton.svelte";
    import ResizingSvg from "../Misc/ResizingSvg.svelte";

    export let vType = getGateType(Buf).view

    export let path = ""

    /**
     * @param {any} e
     */
    function onClick(e) {
        window.location.pathname = path
    }

    const buttonStyle = 
`
    display:flex;
    justify-content:space-between;
    flex-direction:row;
    background:none;
    height:10%;
`
</script>

<HeavyButton style={buttonStyle} on:click={onClick}>
    {@html wrapGateTypeViewInSvgHeader(vType.gridWidth, vType.gridHeight, vType.draw(), `height="20px"`)}
    
    <div class="option-text">
        <slot />
    </div>
</HeavyButton>
