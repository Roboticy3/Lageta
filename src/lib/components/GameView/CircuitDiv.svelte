
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
     * @type {[number, number]}
     */
    export let size

    $: setOffset({
        left:position[0], 
        top:position[1], 
        width:size[0], 
        height:size[1]})

    export let bob = false

    export let smooth = false

    export let hidden = false

    export let flash = false

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

    function setOffsetNoArgs() {setOffset({
        left:position[0], 
        top:position[1], 
        width:size[0], 
        height:size[1]}
    )}

    let resizeObserver = null

    onMount(async () => {
        if (container?.parentElement) {
            resizeObserver = new ResizeObserver(setOffsetNoArgs)
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
    class="circuit-div {hidden ? 'hidden':''} {active ? '':'unavailable'} {bob ? 'bobbing-circuit-div':''} {smooth ? 'smooth-circuit-div':''} {flash ? 'flash-circuit-div':''}" 
    style="left:{rect.left}px; top:{rect.top}px; width:{rect.width}px; height:{rect.height}px;" 
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
        border-radius: 10%;
        border: 4px ridge black;
        color:black;
        overflow: hidden;
    }

    .bobbing-circuit-div {
        animation-name:bob-y;
        animation-duration: calc(var(--animation-speed) * 2);
        animation-iteration-count:infinite;
        animation-direction: alternate;
        animation-timing-function: ease-in-out;
    }

    .smooth-circuit-div {
        transition: left var(--animation-speed), top var(--animation-speed), opacity var(--animation-speed);
    }

    .flash-circuit-div {
        animation:tilt-shaking var(--animation-speed);
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

    @keyframes tilt-shaking {
        0% { transform: rotate(0deg) scale(1); }
        25% { transform: rotate(5deg) scale(1.2); }
        50% { transform: rotate(0eg) scale(1.25); }
        75% { transform: rotate(-5deg) scale(1.2); }
        100% { transform: rotate(0deg) scale(1); }
    }
</style>