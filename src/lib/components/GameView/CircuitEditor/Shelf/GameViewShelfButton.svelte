<script>
    import { onMount } from "svelte";
    
    import CircuitDraggable from "$lib/components/GameView/CircuitEditor/CircuitDraggable.svelte";
    import HeavyButton from "$lib/components/Misc/HeavyButton.svelte";

    /**
     * @type {CircuitDraggable}
     */
    export let circuitDraggable

    /**
     * @type {string}
     */
    export let name

    $: id = `gateshelf.${name}`
    $: title = `ShelfButton.${name}`

    let render = ""

    /**
     * @type {(e:any) => any}
     */
    export let onMouseDown

    export let highlight = () => {
        circuitDraggable.setContentsToName(name)
    }

    export let unhighlight = () => {
        circuitDraggable.resolveContents()
    }

    const buttonStyle = 
`
    display: block;
    align-self: center;
    height:100%;
    min-width:3vw;
    max-width:5vw;
`
    const buttonHoverStyle =
`
    height:105%;
`

</script>

<HeavyButton 
    style={buttonStyle}
    hoverStyle={buttonHoverStyle}
    id={id} 
    on:mousedown={onMouseDown}
    on:mouseenter={highlight}
    on:focusin={highlight}
    on:mouseleave={unhighlight}
    on:focusout={unhighlight}
>
    <slot />
</HeavyButton>
