
<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";
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

    export let bob = false

    export let smooth = false

    export let hidden = false

    /**
     * @type {CircuitController}
     */
    export let circuitController

    /**
     * @type {HTMLDivElement}
     */
    let container

    let start = [0, 0]
    let end = [0, 0]

    export function setOffset() {

        const localStart = circuitController.indexToOffset(position[0], position[1])
        const transform = circuitController.getMatrix()
        if (!transform) return

        start = circuitController.projectOffset(
            localStart[0],
            localStart[1]
        )

        const gridEnd = [position[0] + size[0], position[1] + size[1]]
        const localEnd = circuitController.indexToOffset(gridEnd[0], gridEnd[1])

        end = circuitController.projectOffset(
            localEnd[0],
            localEnd[1]
        )
    }

    let resizeObserver = null

    onMount(async () => {
        if (container?.parentElement) {
            resizeObserver = new ResizeObserver(setOffset)
            resizeObserver.observe(container.parentElement)
        }

        await tick()

        setOffset()
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

    /**
     * @param {[number, number]} newPosition
     */
    export function setPosition(newPosition) {
        position = newPosition
        setOffset()
        console.log(start, end)
    }

    export function hide() {
        hidden = true
    }
    
    export function show() {
        hidden = false
    }
</script>

<div 
    class="circuit-div {hidden ? 'hidden':''} {active ? '':'unavailable'} {bob ? 'bobbing-circuit-div':''} {smooth ? 'smooth-circuit-div':''}" 
    style="left:{start[0]}px; top:{start[1]}px; width:{end[0] - start[0]}px; height:{end[1] - start[1]}px;" 
    bind:this={container}
>
    <slot/>
</div>

<style>
    .circuit-div {
        position:absolute;
        background-color: var(--main-bg-color);
        border-radius: 10%;
        border: 4px ridge black;
        text-align:center;
        font-size: min(2vh, 2vw);
        color:black;
        overflow: hidden;
        opacity: 100%;
        
    }

    .bobbing-circuit-div {
        animation-name:bob-y;
        animation-duration: 1s;
        animation-iteration-count:infinite;
        animation-direction: alternate;
        animation-timing-function: ease-in-out;
    }

    .smooth-circuit-div {
        transition: left 1s, top 1s, opacity 1s;
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