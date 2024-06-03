<script>
    import { CircuitController } from "$lib/circuit_types/CircuitController";

    import CircuitDiv from "../CircuitDiv.svelte";

    /**
     * @type {CircuitController}
     */
    export let circuitController;

    /**
     * @type {[number, number]}
     */
    export let position;

    export let smooth = true;

    export let variant = 0;
    const variants = [
        `
            <div style="justify-content:center;">
                <p>click me!</p>
                <p>|</p>
                <p>V</p>
            </div>
        `,
        `
            <div style="justify-content:center;">
                <p style="rotate:180deg;">V</p>
                <p>|</p>
                <p>click me!</p>
            </div>
        `,
    ];

    /**
     * @type {CircuitDiv}
     */
    let container;

    /**
     * @param {[number, number]} newPosition
     */
    export function setPosition(newPosition) {
        position = newPosition;
        container.setPosition(newPosition);
    }

    /**
     * @param {import("$lib/circuit_types/CircuitController").ConnectionIndex} index
     */
     export function setPositionToConnectionPoint(index) {
        const offset1 = circuitController.getConnectionPoint(index)
        const gPos = circuitController.getGatePosition(index.id)
        if (!gPos || !offset1) return
        /**
         * @type {[number, number]}
         */
        const offset2 = [(gPos[0] + offset1[0] / 10) - 0.5, (gPos[1] + offset1[1] / 10) - 1]
        setPosition(offset2)
    }

    export function hide() {
        container.hide();
    }

    export function show() {
        container.show();
    }
</script>

<CircuitDiv
    bind:this={container}
    circuitController={circuitController}
    position={position}
    size={[0.75, 0.75]}
    active={true}
    bob={true}
    smooth={smooth}
>
    {@html variants[variant]}
</CircuitDiv>
