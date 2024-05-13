<script>
    import { onMount } from "svelte";

    export let [offsetX, offsetY] = [0, 0]

    export let ancestry = 2

    export let [minHeight, minWidth] = [0, 0]

    /**
     * @type {SVGElement | null}
     */
    export let svg = null
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

    export function correct() {
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

        const scale = getCurrentScale()

        scaleGroup.setAttribute(
            "transform",
            `scale(${scale} ${scale})`
        )
    }

    function getCurrentScale() {
        const inner = contentGroup.getBBox()
        return Math.max(outerHeight / inner.height, outerHeight / inner.width)
    }

    /**
     * @param {[number, number]} offset
     */
    export function outerOffsetToInner(offset) {
        const scale = getCurrentScale()
        const normalized = [offset[0] / scale, offset[1] / scale]
        const translated = [normalized[0] + offsetX, normalized[1] + offsetY]
        return translated
    }

    /**
     * @param {[number, number]} offset
     */
    export function innerOffsetToOuter(offset) {
        const scale = getCurrentScale()
        const normalized = [offset[0] * scale, offset[1] * scale]
        const translated = [normalized[0] - offsetX, normalized[1] - offsetY]
        return translated
    }

    onMount(() => {
        window.addEventListener('resize', correct)
        window.addEventListener('load', correct)
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