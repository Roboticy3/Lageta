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

    let [width, height] = [0, 0]

    function correct() {
        if (svg) parent = svg.parentElement
        if (!parent || !svg) return

        width = parent.offsetWidth
        height = parent.offsetHeight
        const ratio = width / height

        if (lockWidth) {
            width = lockWidth
            svg.setAttributeNS('http://www.w3.org/2000/svg','width', '100%')
            if (lockHeight === undefined) height = width / ratio
        }
        if (lockHeight) {
            height = lockHeight
            svg.setAttributeNS('http://www.w3.org/2000/svg','height', '100%')
            if (lockWidth === undefined) width = height * ratio
        }
    }

    onMount(() => {
        window.addEventListener('resize', correct)
        correct()
    })
</script>

<svg 
    bind:this={svg}
    viewBox="{offsetX} {offsetY} {width} {height}" 
>
    <slot />
</svg>