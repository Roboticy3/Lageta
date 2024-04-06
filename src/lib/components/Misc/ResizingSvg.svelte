<script>
    import { onMount } from "svelte";

    export let [offsetX, offsetY] = [0, 0]

    /**
     * @type {[number | undefined, number | undefined]}
     */
    export let [lockWidth, lockHeight] = [undefined, undefined]

    /**
     * @type {SVGSVGElement}
     */
    let svg
    /**
     * @type {HTMLElement | null}
     */
    let parent

    let [baseWidth, baseHeight] = [0, 0]
    let [width, height] = [0, 0]

    function correct() {
        if (svg) parent = svg.parentElement
        if (!parent || !svg) return

        baseWidth = parent.offsetWidth
        baseHeight = parent.offsetHeight
        const ratio = baseWidth / baseHeight

        if (lockWidth) {
            width = lockWidth
            svg.setAttributeNS('http://www.w3.org/2000/svg','width', '100%')
        }
        else {
            width = baseWidth + 0
        }
        if (lockHeight) {
            height = lockHeight
            svg.setAttributeNS('http://www.w3.org/2000/svg','height', '100%')
        }
        else { 
            height = baseHeight + 0
        }

        if (!lockWidth) {
            width = height * ratio
        }
        if (!lockHeight) {
            height = width / ratio
        }

        console.log("setting svg size", width, height)
    }

    onMount(() => {
        window.addEventListener('resize', correct)
        correct()
    })
</script>

<svg 
    bind:this={svg}
    viewBox="{offsetX} {offsetY} {width} {height}" 
    height={height}
    width={width}
>
    <slot />
</svg>