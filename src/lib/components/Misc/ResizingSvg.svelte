<script>
    import { onMount } from "svelte";

    export let [offsetX, offsetY] = [0, 0]

    export let ancestry = 1

    /**
     * @type {SVGSVGElement}
     */
    let svg
    /**
     * @type {SVGGraphicsElement}
     */
    let scaleGroup
    /**
     * @type {SVGGraphicsElement}
     */
    let contentGroup

    let [width, height] = [0, 0]
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
        outerHeight = outer.height
        outerWidth = outer.width

        const inner = contentGroup.getBBox()
        const scale = outerHeight / inner.height
        width = inner.width
        height = inner.height
        console.log(inner, outer)

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