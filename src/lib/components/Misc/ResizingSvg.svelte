<script>
    import { onMount } from "svelte";

    export let [offsetX, offsetY] = [0, 0]

    export let ancestry = 2

    export let [minHeight, minWidth] = [0, 0]

    /**
     * @type {SVGElement}
     */
    export let svg
    /**
     * @type {SVGGraphicsElement}
     */
    let scaleGroup
    /**
     * @type {SVGGraphicsElement}
     */
    let contentGroup

    let [outerWidth, outerHeight] = [0, 0]

    /**
     * @type {HTMLElement | null}
     */
    let parent

    function correct() {
        if (svg) {
            parent = svg.parentElement
            for (let i = 1; i < ancestry; i++) {
                if (parent === null) break
                parent = parent.parentElement
            }
        }
        if (!parent || !svg || !scaleGroup || !contentGroup) return
        
        const outer = parent.getBoundingClientRect()
        outerHeight = Math.max(outer.height, minHeight)
        outerWidth = Math.max(outer.width, minWidth)

        const inner = contentGroup.getBBox()
        const scale = outerHeight / inner.height

        console.log(outer, inner)

        scaleGroup.setAttribute(
            "transform",
            `scale(${scale} ${scale})`
        )
    }

    onMount(() => {
        window.addEventListener('resize', correct)
        correct()
    })
</script>

<svg 
    bind:this={svg}
    viewBox="{offsetX} {offsetY} {outerWidth} {outerHeight}" 
>
    <g
        bind:this={scaleGroup}
    >
        <g bind:this={contentGroup}>
            <slot />
        </g>
    </g>
</svg>