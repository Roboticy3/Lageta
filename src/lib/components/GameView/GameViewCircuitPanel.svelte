<script>
    import { GateType, Buf, Gate, all_gates, copyGate } from '$lib/circuit_types/Gate'
    import { onMount } from 'svelte';

    import { getGateSvgContents, ConnectionSvg, buildSvg } from '../GateSvgs.svelte';

    import { CircuitController } from '$lib/circuit_types/CircuitController';
    import { Connection } from '$lib/circuit_types/GateGraph';

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

    let left = 0;
    let top = 0;

    /**
     * @type {Array<String>}
     */
     let svgGates = []
    let gridController = new CircuitController()

    //the svg string of the current connection, previews the connection being made
    let activeSvgConnection=""
    //the svg string of all the visible connection points
    let svgConnections = ""
    
    let mountCircuit = () => {
        addDragEventListeners()
        updateViewBox()
    }
    onMount(mountCircuit)

    function updateViewBox() {
        if (circuitContainer === null) {
            return
        }

        let offsetX = circuitContainer.offsetWidth;
        let offsetY = circuitContainer.offsetHeight;
        circuit.setAttribute('viewBox', `${left} ${top} ${offsetX - left} ${offsetY - top}`)
        circuit.setAttribute('width', `${offsetX}`)
    }

    window.addEventListener('resize', (e) => {
        updateViewBox()
    })

    /**
     * @param {DragEvent} e
     */
    function onDragStart(e) {

        const result = gridController.query(e.offsetX, e.offsetY)
        const gate = result.gate
        if (gate === undefined) {
            return
        }
        const tString = result.type

        switch (tString) {
            case "Gate":
                dragStartGate(e, gate)
                break
            case "Input":
            case "Output":
                if (result.connectionIndex === undefined) {
                    console.log("no index found for query result ", result)
                    return
                }
                dragStartConnection(e, result.connectionIndex, tString)
                break
        }

        return
    }

    /**
     * @param {DragEvent} e
     * @param {Gate} gate
     */
    function dragStartGate(e, gate) {
        const dataTransfer = e.dataTransfer
        const gType = gate.type
        const [x, y] = [gate.x || 0, gate.y || 0]

        if (dataTransfer === null) {
            console.log("datatransfer not found!")
            return
        }

        const target_id = `gateshelf.${gType.name}`
        let svg = document.getElementById(target_id)

        if (!svg) {
            console.log("shelf button ", target_id, " not found!")
            return
        }
        dataTransfer.setData("type","Gate")

        dataTransfer.setData('ShelfButtonId', target_id)
        dataTransfer.setData('GateName', gType.name)

        const gateOffset = gridController.indexToOffset(gate.x || 0, gate.y || 0)
        const localOffset = [
            e.offsetX - gateOffset[0],
            e.offsetY - gateOffset[1]
        ]
        dataTransfer.setData('offset', `${localOffset[0]}|${localOffset[1]}`)

        dataTransfer.setData('SourceGate', `${gType.name}-${gate.id}`)     
        
        dataTransfer.setDragImage(svg, localOffset[0], localOffset[1])

        window.addEventListener("drop", windowDropEV)
        window.addEventListener("dragover", preventDefault)
    }

    /**
     * @param {DragEvent} e
     * @param {number} connectionIndex
     * @param {"Input" | "Output"} type
     */
    function dragStartConnection(e, connectionIndex, type) {

        const dataTransfer = e.dataTransfer
        if (dataTransfer === null) {
            return
        }

        const toType = gridController.flipConnectionType(type)
        
        var parser = new DOMParser();
        const svg = parser.parseFromString(ConnectionSvg(), "image/svg+xml").children[0];
        if (svg === undefined) {
            return
        }

        dataTransfer.setData('offset', `${e.offsetX}|${e.offsetY}`)
        
        dataTransfer.setData("type",type)
        dataTransfer.setDragImage(svg, 0, 0)

        svgConnections = gridController.drawConnectionPoints(
            ConnectionSvg, gridController.flipConnectionType(type)
        )
    }

    /**
     * Add evs for dragging related to the circuit
     */
    function addDragEventListeners() {
        if (circuit == null) {
            console.log(" not found!!")
            return
        }

        circuit.addEventListener("dragover", circuitDragEV)

        circuit.addEventListener("dragenter", preventDefault)
        circuit.addEventListener("dragleave", preventDefault)

        circuit.addEventListener("drop", circuitDropEV)
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
        const fromS = fromData.split("|")
        activeSvgConnection = gridController.drawWire(
            [Number(fromS[0]), Number(fromS[1])], 
            [e.offsetX, e.offsetY]
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
            activeSvgConnection = ""
            return
        }

        const source = dataTransfer.getData('SourceGate')

        if (source != "" && !inCircuitPanel(e.pageX, e.pageY)) {
            gridController.removeGate(source, svgGates);
        }

        updateSvg()
        activeSvgConnection = ""
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

        let gType = all_gates.get(name) || new GateType()

        const offsetString = d.getData('offset')
        if (offsetString === "") {
            updateSvg()
            return
        }
        const offset = offsetString.split('|')
        const gateOffset = [
            left + e.offsetX - Number(offset[0]) * .5,
            top + e.offsetY - Number(offset[1]) * .5
        ]

        const source = d.getData('SourceGate')
        if (source !== "") {
            gridController.moveGate(
                source, 
                gateOffset[0],
                gateOffset[1],
                svgGates,
                getGateSvgContents
            )
        }
        else {
            const offset = offsetString.split('|')
            const gate2 = copyGate(gType)
            gridController.addGate(
                gate2, 
                gateOffset[0],
                gateOffset[1],
                svgGates,
                getGateSvgContents
            )
        }

        updateSvg()
    }

    /**
     * 
     * @param {DragEvent} e
     * @param {DataTransfer} d
     * @param {"Input" | "Output"} fromType
     */
    function circuitDropConnection(e, d, fromType) {
        const target = gridController.query(e.offsetX, e.offsetY)
        const toType = target.type

        switch ([fromType, toType]) {
            case ["Input", "Output"]:
                break
            case ["Input", "Output"]:
                break
            default:
                break
        }

        activeSvgConnection = ""
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

    function updateSvg() {
        svgGates = svgGates
        svgConnections = gridController.drawConnectionPoints(ConnectionSvg)
    }

</script>

<div 
    draggable="true" 
    class="circuit-container" 
    id="circuitContainer" 
    role="application"
    bind:this={circuitContainer}
    on:dragstart={onDragStart}
    on:mouseup={clickHandler}>
    <svg stroke="black" stroke-width=".5pt" fill="none" bind:this={circuit}>
        {#each gridController.gridCellsSvg() as svg}
        {@html svg}
        {/each}
        {#each svgGates as svg}
        {@html svg}
        {/each}
        {@html svgConnections}
        {@html activeSvgConnection}
    </svg>
</div>

<style>
    .circuit-container {
        grid-row: 2;
        grid-column: 1 / 2;
        background-color: white;  
        padding: 0%;
    }
</style>
