<script>
    import { GateType, Buf, Gate, all_gates} from '$lib/circuit_types/Gate'
    import { onMount } from 'svelte';

    import { getGateSvgContents, ConnectionSvg, buildSvg, wireSvg, getGateSvg } from '../GateSvgs.svelte';

    import { CircuitController } from '$lib/circuit_types/CircuitController';
    
    //@ts-ignore
    import { GameViewParameters } from '$lib/level_types/GameViewParameters';

    /**
     * @type {GameViewParameters}
    */
    export let params

    /**
     * @type {SVGElement} circuit
     */
    let circuit;

    /**
     * @type {HTMLDivElement | null}
     */
    let circuitContainer;

    /**
     * 
     * @param {DragEvent} e
     */
     let preventDefault = (e) => {
        e.preventDefault()
    }

    /**
     * @type {Array<String>}
     */
    let svgGates = []
    /**
     * @type {Array<String>}
     */
    let svgWires = []
    
    let gridController = new CircuitController(params.grid)

    //the svg string of the current connection, previews the connection being made
    let activeSvgWire=""
    //the svg string of all the visible connection points
    let svgConnectionPoints = ""

    //update the svg, try to call whenever the grid changes
    export function updateSvg() {
        svgGates = gridController.drawGates(getGateSvgContents)
        svgConnectionPoints = gridController.drawConnectionPoints(ConnectionSvg)
        svgWires = gridController.drawWires(wireSvg)
        clearActiveSvgConnection()
    }

    function clearActiveSvgConnection() {
        activeSvgWire = ""
    }
    
    let mountCircuit = () => {
        addDragEventListeners()
        updateViewBox()
        updateSvg()
    }
    onMount(mountCircuit)

    function updateViewBox() {
        if (circuitContainer === null) {
            return
        }

        let offsetX = circuitContainer.offsetWidth;
        let offsetY = circuitContainer.offsetHeight;
        circuit.setAttribute('viewBox', `0 0 ${offsetX} ${offsetY}`)
        circuit.setAttribute('width', `${offsetX}`)
    }

    window.addEventListener('resize', (e) => {
        updateViewBox()
    })

    //when the user clicks and drags on the circuit panel, they can either be dragging a connection or a gate
    //each of these are handled by their own functions, dragStartGate and dragStartConnection
    /**
     * @param {DragEvent} e
     */
    function onDragStart(e) {

        const result = gridController.query(e.offsetX, e.offsetY)
        const gate = result.gate
        console.log(result, e.offsetX, e.offsetY)
        if (gate === undefined) {
            preventDefault(e)
            return
        }

        const tString = result.type

        const d = e.dataTransfer
        if (d === null) {
            preventDefault(e)
            return
        }

        giveGateData(gate, d)

        switch (tString) {
            case "Gate":
                dragStartGate(e, d, gate)
                return
            case "Input":
            case "Output":
                if (result.connectionIndex === undefined) {
                    console.log("no index found for query result ", result)
                    return
                }
                dragStartConnection(e, gate, tString, result.connectionIndex)
                return
        }

        preventDefault(e)

        return
    }

    //burn the necessary data from a gate into dataTransfer
    /**
     * @param {Gate} gate
     * @param {DataTransfer} d
     */
    function giveGateData(gate, d) {
        const gType = gate.type
        d.setData('SourceGate', `${gType.name}-${gate.id}`) 
        d.setData('GateName', gType.name)
    }

    /**
     * @param {DragEvent} e
     * @param {DataTransfer} d
     * @param {Gate} gate
     */
    function dragStartGate(e, d, gate) {
        const gType = gate.type
        if (!gType.moveable) {
            console.log("gate type ", gType, " is not moveable")
            return
        }
        const [x, y] = [gate.x || 0, gate.y || 0]

        d.setData("type","Gate")

        const target_id = `gateshelf.${gType.name}`
        let svg = document.getElementById(target_id)
        if (!svg) {
            console.log("shelf button ", target_id, " not found!")
            return
        }
        d.setData('ShelfButtonId', target_id)

        const gateOffset = gridController.indexToOffset(gate.x || 0, gate.y || 0)
        const localOffset = gridController.unprojectOffset(e.offsetX, e.offsetY)
        const offset = [
            localOffset[0] - gateOffset[0],
            localOffset[1] - gateOffset[1]
        ]
        d.setData('offset', `${offset[0]}|${offset[1]}`)
        
        d.setDragImage(svg, 0, 0)

        window.addEventListener("drop", windowDropEV)
        window.addEventListener("dragover", preventDefault)
    }

    /**
     * @param {DragEvent} e
     * @param {Gate} gate
     * @param {number} connectionIndex
     * @param {"Input" | "Output"} type
     */
    function dragStartConnection(e, gate, type, connectionIndex) {

        const d = e.dataTransfer
        if (d === null) {
            return
        }

        const toType = gridController.flipConnectionType(type)

        const offset = gridController.getConnectionPoint({id:gate.id, type:type, index:connectionIndex})
        d.setData('offset', `${offset[0]}|${offset[1]}`) 
        
        if (type === "Input") {
            const from = gridController.getConnectedTo(
                gate.id || 0, connectionIndex
            )
            if (from !== undefined) {
                const newGate = gridController.getGate(from[0])
                if (newGate !== undefined) {
                    giveGateData(newGate, d)
                    dragStartConnection(e, newGate, "Output", from[1])
                    gridController.removeConnection({
                        id:gate.id, 
                        type:"Input", 
                        index:connectionIndex
                    })
                    updateSvg()
                    return
                }
            }
        }

        var parser = new DOMParser();
        const svg = parser.parseFromString(ConnectionSvg(), "image/svg+xml").children[0];
        if (svg === undefined) {
            return
        }
        
        d.setData("type",type)
        d.setData("ConnectionIndex",connectionIndex.toString())
        d.setDragImage(svg, 0, 0)

        svgConnectionPoints = gridController.drawConnectionPoints(
            ConnectionSvg, gridController.flipConnectionType(type)
        )
    }
    
    /**
     * Add evs for dragging related to the circuit
     */
    function addDragEventListeners() {
        if (circuitContainer == null) {
            console.log(" not found!!")
            return
        }

        circuitContainer.addEventListener("dragover", circuitDragEV)

        circuitContainer.addEventListener("dragenter", preventDefault)
        circuitContainer.addEventListener("dragleave", preventDefault)

        circuitContainer.addEventListener("drop", circuitDropEV)


    }

    /**
     * @param {DragEvent} e
     */
    function circuitDragEV(e) {
        preventDefault(e)

        const d = e.dataTransfer
        if (d === null) {
            console.log("dataTransfer not found!")
            return
        }

        const type = d.getData("type")
        if (type === "") {
            console.log("drag type not found!")
            return
        }

        switch (type) {
            case "Input":
            case "Output":
                circuitDragConnection(e, d)
        }
    }

    /**
     * 
     * @param {DragEvent} e
     * @param {DataTransfer} d
     */
    function circuitDragConnection(e, d) {
        const fromData = d.getData("offset")
        if (fromData === "") {
            console.log("from offset not found!")
            return
        }
        const fromS = fromData.split("|").map(Number)
        const localOffset = gridController.unprojectOffset(e.offsetX, e.offsetY)
        activeSvgWire = wireSvg(
            [fromS[0], fromS[1]], 
            localOffset
        )
    }

    /**
     * Event for dropping an object in the circuit
     * @param {DragEvent} e
     */
    function circuitDropEV(e) {

        const d = e.dataTransfer
        if (d === null) {
            return
        }

        preventDefault(e)

        const type = d.getData("type")
        if (type === "") {
            console.log("drag type not found!")
            return
        }

        switch (type) {
            case "Input":
            case "Output":
                circuitDropConnection(e, d, type)
                break
            case "Gate":
                circuitDropGate(e, d)
                break
        }
    }

    /**
     * watch for drops outside of the panel to remove gates
     * records drops inside the panel too but does nothing, leving it to circuitDropEV
     * @param {DragEvent} e
     */
    function windowDropEV(e) {
        window.removeEventListener("drop", windowDropEV)
        window.removeEventListener("dragover", preventDefault)
        
        preventDefault(e)

        const dataTransfer = e.dataTransfer
        if (!dataTransfer) {
            updateSvg()
            clearActiveSvgConnection()
            return
        }

        
        const source = dataTransfer.getData('SourceGate')

        if (source != "" && !inCircuitPanel(e.pageX, e.pageY)) {
            gridController.removeGate(source, svgGates);
        }

        updateSvg()
        clearActiveSvgConnection()
    }

    /**
     * @param {DragEvent} e
     * @param {DataTransfer} d
     */
    function circuitDropGate(e, d) {
        const id = d.getData('ShelfButtonId')
        const name = d.getData('GateName')
        if (id === '' || name === '') {
            updateSvg()
            return
        }

        let gType = all_gates.get(name) || Buf

        const offsetString = d.getData('offset')
        if (offsetString === "") {
            updateSvg()
            return
        }
        let offset = offsetString.split('|').map(Number)

        const source = d.getData('SourceGate')
        if (source !== "") {
            gridController.moveGate(
                source, 
                e.offsetX,
                e.offsetY
            )
        }
        else {
            gridController.addGate(
                gType, 
                e.offsetX,
                e.offsetY
            )
        }

        updateSvg()
    }

    /**
     * 
     * @param {DragEvent} e
     * @param {DataTransfer} d
     * @param {"Input" | "Output"} fromType
     * 
     * @todo dropping a connection on nothing should delete it, currently does not
     */
    function circuitDropConnection(e, d, fromType) {
        const target = gridController.query(e.offsetX, e.offsetY)
        const toType = target.type

        const gateId = Number(d.getData("SourceGate").split("-")[1])
        if (Number.isNaN(gateId)) {
            console.log("gate not found from id ", gateId, "!")
            updateSvg()
            return
        }

        const connectionIndex = Number(d.getData("ConnectionIndex"))
        if (connectionIndex === null) {
            console.log(connectionIndex, " not found!")
            updateSvg()
            return
        }

        const toId = target.gate?.id || 0

        if (toType === fromType) {
            console.log("can't connect ", fromType, " with ", toType)
            updateSvg()
            return
        }

        let result
        switch (toType) {
            case "Output":
                result = gridController.addConnection(
                    toId, 
                    target?.connectionIndex || 0, 
                    gateId, 
                    connectionIndex
                )
                break
            case "Input":
                result = gridController.addConnection(
                    gateId, 
                    connectionIndex, 
                    toId, 
                    target?.connectionIndex || 0
                )
                break
            default:
                break
        }

        updateSvg()
    }

    /**
     * listen for click events on the circuit
     * @param {MouseEvent} e
     */
    function clickHandler(e) {
        const result = gridController.query(e.offsetX, e.offsetY)
        //console.log(result)
    }

    /**
     * Check if the offset is in the circuit panel,
     * more reliable than getting targets from events
     * @param {number} offsetX
     * @param {number} offsetY
     */
    function inCircuitPanel(offsetX, offsetY) {
        if (circuitContainer === null) {
            return false
        }

        if (offsetX >= circuitContainer.offsetLeft && 
            offsetX < circuitContainer.offsetLeft + circuitContainer.offsetWidth &&
            offsetY >= circuitContainer.offsetTop && 
            offsetY < circuitContainer.offsetTop + circuitContainer.offsetHeight) 
        {
            return true
        }

        return false
    }

</script>

<div
    draggable="true" 
    class="circuit-container" 
    id="circuitContainer" 
    role="application"
    bind:this={circuitContainer}
    on:dragstart={onDragStart}
    on:click={clickHandler}>

    <svg 
        stroke="black" 
        stroke-width=".5pt" 
        fill="none" 
        bind:this={circuit}
        class="circuit-svg">
        <g transform={gridController.getMatrixSvg()}>

            {#each svgWires as wire}
                {@html wire}
            {/each}

            {#each gridController.gridCellsSvg() as svg}
            {@html svg}
            {/each}

            {#each svgGates as svg}
            {@html svg}
            {/each}

            {@html svgConnectionPoints}
            {@html activeSvgWire}
        </g>
    </svg>

    <slot />
</div>

<style>
    .circuit-container {
        grid-row: 2;
        grid-column: 1 / 2;
        background-color: white;  
        padding: 0%;
    }

    .circuit-svg {
        pointer-events: none;
        display: flex;
    }
</style>
