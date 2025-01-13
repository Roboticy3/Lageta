
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";

    import { getCircuitDivRect } from "$lib/circuit_types/CircuitDiv";
    import { onMount, tick } from "svelte";

    export let active = false

    /**
     * @type {[number, number]}
     */
    export let position

    /**
     * @type {[number, number] | null}
     */
    export let size

    $: setOffset({
        left:position[0], 
        top:position[1], 
        width:size ? size[0]:0, 
        height:size ? size[1]:0})

    export let bob = false

    export let smooth = false

    export let hidden = false

    export let flash = false

    export let border = false

    export let extraStyle = ""

    /**
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {HTMLDivElement}
     */
    let container

    let rect = {
        top:0,
        left:0,
        width:0,
        height:0
    }

    /**
     * 
     * @param {import("$lib/circuit_types/CircuitDiv").Rect} gridRect
     */
    export function setOffset(gridRect) {
        const newRect = getCircuitDivRect(gridRect, circuitController)
        if (newRect) {
            rect = newRect
            //console.log("set a circuitdiv offset to", rect)
        }
    }

    export function setOffsetNoArgs() {

        setOffset({
        left:position[0], 
        top:position[1], 
        width:size? size[0]:0, 
        height:size? size[1]:0})


    }

    let resizeObserver = null

    onMount(async () => {
        if (container?.parentElement) {
            resizeObserver = new ResizeObserver(() => {
                requestAnimationFrame(setOffsetNoArgs)
            })
            resizeObserver.observe(container.parentElement)
        }

        await tick()

        setOffsetNoArgs()
    })

    export function activate() {
        active = true
    }
    export function deactivate() {
        active = false
    }

    export function isActive() {
        return active
    }

    export function getPosition() {
        return position
    }

    export function hide() {
        hidden = true
    }
    
    export function show() {
        hidden = false
    }
</script>

<div 
    class="circuit-div {hidden ? 'hidden':''} {active ? '':'unavailable'} {bob ? 'bobbing-circuit-div':''} {smooth ? 'smooth-circuit-div':''} {flash ? 'flash':''} {border ? 'ridge':''}" 
    style="left:{rect.left}px; top:{rect.top}px; {size? `width:${rect.width}px; height:${rect.height}px;`:""} {extraStyle}" 
    bind:this={container}
>
    <slot/>
</div>

<style>
    .circuit-div {
        position:absolute;
        opacity: 100%;  
        text-align:center;
        font-size: min(2vh, 1vw);  
        background-color: var(--main-bg-color);
        
        color:black;
        overflow: hidden;
    }

    .bobbing-circuit-div {
        animation:bob-y calc(var(--animation-speed) * 2) alternate infinite ease-in-out;
    }

    .smooth-circuit-div {
        transition: left var(--animation-speed), top var(--animation-speed), opacity var(--animation-speed);
    }

    .hidden {
        opacity: 0%;
    }

    @keyframes bob-y {
        0% {
            transform:translateY(0%);
        }
        100% {
            transform:translateY(10%);
        }
    }
</style>