<script>
    import { onMount, tick } from "svelte";
    import { compose, scale, translate } from "transformation-matrix";

    export let [offsetX, offsetY] = [0, 0]

    export let ancestry = 1

    export let [minHeight, minWidth] = [0, 0]

    /**
     * @type {SVGElement | null}
     */
    export let svg = null

    /**
     * @type {SVGGraphicsElement}
     */
    let contentGroup

    let [outerWidth, outerHeight] = [0, 0]
    
    let innerScale = 0

    /**
     * @type {HTMLElement | null}
     */
    let parent

    function ancestor() {
        parent = svg?.parentElement || null
        for (let i = 1; i < ancestry; i++) {
            if (parent === null) break
            parent = parent.parentElement
        }
        return parent
    }

    export function correct() {

        if (!parent || !svg || !contentGroup) return
        
        const outer = parent.getBoundingClientRect()
        outerWidth = Math.max(outer.width, minWidth) 
        outerHeight = Math.max(outer.height, minHeight)

        innerScale = getCurrentScale()


    }

    function getCurrentScale() {
        const inner = contentGroup.getBBox()
        return Math.min(outerHeight / inner.height, outerWidth / inner.width)
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

    /**
     * @type {ResizeObserver | null}
     */
    let resizeObserver = null

    onMount(async () => {
        
        const a = ancestor()
        if (a) {
            resizeObserver = new ResizeObserver(correct)
            resizeObserver.observe(a)
        }

        await tick()

        correct()
    })

    export function getMatrix() {
        return compose(translate(offsetX, offsetY),scale(innerScale))
    }
</script>
<svg 
    bind:this={svg}
    viewBox="{offsetX} {offsetY} {outerWidth + offsetX} {outerHeight + offsetY}" 
    style="position:absolute;"
>
    <g
        transform={`scale(${innerScale} ${innerScale})`}
    >
        <g bind:this={contentGroup}>
            <slot />
        </g>
    </g>
</svg>
