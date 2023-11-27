import type { CircuitController } from "./CircuitController";
import { GateGraph } from "./GateGraph";
import { GateGrid } from "./GateGrid";
import { writable, get } from "svelte/store";

export class CircuitStore {

    private grid:GateGrid
    private name:string

    constructor(
        circuitController:CircuitController,
        circuitName:string
    ) {
        this.grid = circuitController.gateGrid
        this.name = circuitName
    }

    save(name:string | undefined) {
        if (name !== undefined) {
            this.name = name
        }

        const existing = localStorage.getItem(this.name)
        if (existing !== null) {
            console.log(this.name, " already exists in storage!")
            return false
        }

        localStorage.setItem(this.name, this.serializeCircuit())
        console.log(localStorage)

        return true
    }

    load(name:string | undefined) {
        if (name !== undefined) {
            this.name = name
        }

        const existing = localStorage.getItem(this.name)
        if (existing === null) {
            console.log(this.name, " not found in storage")
            return false
        }

        if (name !== undefined) {
            this.name = name
        }


        const grid = this.deserializeCircuit(existing)
        if (grid === undefined) {
            return false
        }

        return true
    }

    private serializeCircuit() {
        return ""
    }

    private deserializeCircuit(json:string) {
        const graph = new GateGraph()
        const grid = new GateGrid(graph)
        return grid
    }
}