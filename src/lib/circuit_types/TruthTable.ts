import type { CircuitController } from "./CircuitController";
import { Buf, GateType, type ConnectionValue } from "./Gate";
import type { GateGrid } from "./GateGrid";

export const truthTableRowLimit = 6

/**
 * TruthTable representation of a GateType. Since GateTypes are meant to be static, the contents of a TruthTable are as well
 * call setLabels to change the labels of the TruthTable from another script, otherwise TruthTable objects are externally immutable
 */
export class TruthTable {
    private readonly source:GateType

    private block:string[] = [] //I'd rather this be a string but I can't replace individual characters for some reason
    //there is a real tutorial out there suggesting to write your own replace method that splits the string in two and adds it back together with the replacement
    //the internet is wild

    readonly colCount:number
    readonly rowCount:number

    private trueString:string
    private falseString:string

    constructor(
        source:GateType,
        columnLabels:string[] | undefined = undefined,
        trueString:string = "True",
        falseString:string = "False"
    ) {
        this.source = source

        this.colCount = this.source.sizeIn + this.source.sizeOut
        this.rowCount = Math.pow(2, this.source.sizeIn) + 1 //add an extra row at the top for labels

        this.trueString = trueString
        this.falseString = falseString

        if (columnLabels !== undefined && columnLabels.length !== this.colCount) {
            columnLabels = undefined
        }

        this.fill(columnLabels)
    }

    /**
     * function invoked by constructor to fill the TruthTable's block, assumes the other properties are already set properly
     * @param columnLabels array of column labels, assumed to be the correct length
     */
    private fill(columnLabels:string[] | undefined) {
        if (this.source instanceof GateType) {
            if (this.source.sizeIn > truthTableRowLimit) {
                throw RangeError("sizeIn is greater than 5, this truth table would have too many rows (max 2^5 = 32)")
            }

            this.block = new Array<string>(this.rowCount * this.colCount) //big array
            this.block.fill(this.falseString)

            //fill the first row with the names of the columns
            if (columnLabels === undefined)
            {
                for (let j = 0; j < this.source.sizeIn; j++) {
                    this.block[j] = "Input " + String(j + 1)
                }
                for (let j = 0; j < this.source.sizeOut; j++) {
                    this.block[this.source.sizeIn + j] = "Output " + String(j + 1)
                }
            }
            //if column labels were supplied, use those instead
            else {
                for (let j = 0; j < this.colCount; j++) {
                    this.block[j] = columnLabels[j]
                }
            }
            

            //fill the rest of the block
            this.fillInputs()

            this.fillOutputs()
        }
    }

    private fillInputs() {
        let sum:number = 0

        while (sum < this.rowCount - 1) {
            let i = (sum + 1) * this.colCount
            let temp = sum
            let j = this.source.sizeIn - 1

            while (temp !== 0){

                if (temp % 2 === 1) {
                    this.block[i + j] = this.trueString
                }

                temp = Math.floor(temp / 2)
                j--
            }

            sum++
        }
    }

    private fillOutputs() {
        for (let i = this.colCount; i < this.block.length; i += this.colCount) {
            
            const input = this.block
                .slice(i, i + this.source.sizeIn)
                .map((s:string) => {return this.entryToBool(s)})
            
            const output = this.source
                .execute([], input)
                .map((x:ConnectionValue) => {return this.boolToEntry(x || false)})
            
            for (let j = 0; j < this.source.sizeOut; j++) {
                const index = i + this.colCount - this.source.sizeOut + j
                this.block[index] = output[j]
            }

        }
    }

    setLabels(
        columnLabels:string[] | undefined = undefined,
        trueString:string = "True",
        falseString:string = "False"
    ) {
        if (columnLabels !== undefined && columnLabels.length !== this.colCount) {
            columnLabels = undefined
        }

        for (let i = this.colCount; i < this.block.length; i++) {
            const cur = this.block[i]
            this.block[i] = cur === this.trueString ? trueString : falseString
        }

        this.trueString = trueString
        this.falseString = falseString
    }

    test(circuitController:CircuitController | undefined, id:number) {
        if (circuitController === undefined) return false
        const gate = circuitController.getGate(id)
        if (gate === undefined) return false
        const gType = gate.type
        if (gType !== this.source) return false

        for (let i = this.colCount - this.source.sizeOut; i < this.block.length; i += this.colCount) {
            const cmp = new Array<boolean>(this.source.sizeOut)
            for (let j = 0; j < this.source.sizeOut; j++) {
                cmp[j] = this.block[i + j] === this.trueString
            }

            circuitController
        }

        return true
    }

    entryToBool(entry:string) {
        return entry === this.trueString
    }

    boolToEntry(bool:boolean) {
        return bool ? this.trueString:this.falseString
    }

    unpack() {
        return this.block
    }

    getName() {
        return this.source.name
    }

    getInSize() {
        return this.source.sizeIn
    }

    getOutSize() {
        return this.source.sizeOut
    }
}