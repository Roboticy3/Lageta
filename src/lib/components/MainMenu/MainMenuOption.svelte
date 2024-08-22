<script>
    import { goto, invalidateAll } from "$app/navigation";
    import { Buf, getGateType, wrapGateTypeViewInSvgHeader } from "$lib/dat/GateTypes/GateTypes";
    import { CowSticker, Sticker } from "$lib/dat/Tools/Tools";
    import StickerViewer from "../GameView/CircuitEditor/Sticker/StickerViewer.svelte";
    import HeavyButton from "../Misc/HeavyButton.svelte";
    import ResizingSvg from "../Misc/ResizingSvg.svelte";

    export let vType = getGateType(Buf).view
    export let sticker = CowSticker

    export let spriteMode = "Gate"

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
    {#if spriteMode === "Gate"}
        {@html wrapGateTypeViewInSvgHeader(
            vType.gridWidth, vType.gridHeight, 
            vType.draw(), `height="20px"`
        )}
    {:else if spriteMode === "Sticker"}
        <div style="height:20px;">
            <StickerViewer sticker={sticker}/>
        </div>
    {/if}
    
    <div class="option-text">
        <slot />
    </div>
</HeavyButton>
