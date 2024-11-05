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
    export let position = [0, 0];

    export let smooth = true;

    export let variant = 0;
    const variants = [
        `
            <div style="
                justify-content:center; 
                font-size:min(1.5vh, 1.5vw);
            ">
                <div>Click below!</div>
                <div>V</div>
            </div>
        `,
        `
            <div style="justify-content:center; font-size:min(1.5vh, 1.5vw);">
                <div style="rotate:180deg;">V</div>
                <div>Click above!</div>
            </div>
        `,
    ];

    /**
     * @type {CircuitDiv}
     */
    let container;

    /**
     * @param {import("$lib/circuit_types/CircuitController").ConnectionIndex} index
     */
    export function setPositionToConnectionPoint(index) {
        const offset = circuitController.getConnectionPoint(index)
        const gPos = circuitController.getGatePosition(index.id)
        if (!gPos || !offset) return
        /**
         * @type {[number, number]}
         */
        position = [(gPos[0] + offset[0] / 10) - 0.5, (gPos[1] + offset[1] / 10) - 1.5]
        console.log("set indicator position to ", position)
        
    }

    /**
     * @param {[number, number]} newPosition
     */
     export function setPosition(newPosition) {
        position = newPosition
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
