import { GateType, GateTypeController } from "./GateType"

/**
 * Represent a truth table in a matrix
 */
export class TruthTable {
    readonly params:TruthTableParameters

    readonly matrix:boolean[][]

    readonly columnLabels:string[]

    constructor(
        params:TruthTableParameters
    ) {
        this.params = params

        if (params instanceof GateTypeController) {
            this.matrix = TruthTable.gateTypeToMatrix(params.model)
            this.columnLabels = params.view.inputLabels.concat(params.view.outputLabels)
        }
        else {
            this.matrix = params.matrix || []
            this.columnLabels = params.columnLabels || []
        }
    }

    static gateTypeToMatrix(gateType:GateType) {
        const rows = Math.pow(2, gateType.sizeIn)
        const result = []
        for (let r = 0; r < rows; r++) {
            const rowResult = new Array(gateType.sizeIn)
            //fill the first half of the matrix with inputs
            for (let c = 0; c < gateType.sizeIn; c++) {
                const fac = Math.pow(2, c)
                rowResult[c] = (Math.floor(r / fac) % 2 === 1)
            }
            rowResult.push(...(gateType.f({override:rowResult}).override))
            result[r] = rowResult
        }
        return result
    }

    getWidth() {
        return this.columnLabels.length
    }

    getHeight() {
        return this.matrix.length
    }
}

export type TruthTableParameters = {
    sizeIn?:number,
    intermediate?:number,
    sizeOut?:number,
    matrix?:boolean[][],
    columnLabels?:string[]
} | GateTypeController