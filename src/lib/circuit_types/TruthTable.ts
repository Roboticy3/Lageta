import { Buf, GateType } from "./Gate";
import type { GateGrid } from "./GateGrid";

export const truthTableRowLimit = 6

export class TruthTable {
    private readonly source:TruthTableSource

    private block:string[] = [] //I'd rather this be a string but I can't replace individual characters for some reason
    //there is a real tutorial out there suggesting to write your own replace method that splits the string in two and adds it back together with the replacement
    //the internet is wild

    readonly colCount:number
    readonly rowCount:number


    constructor(
        source:TruthTableSource
    ) {
        this.source = source
        this.colCount = this.source.sizeIn + this.source.sizeOut
        this.rowCount = Math.pow(2, this.source.sizeIn) + 1 //add an extra row at the top for labels

        this.fill()
    }

    private fill() {
        if (this.source instanceof GateType) {
            if (this.source.sizeIn > truthTableRowLimit) {
                throw RangeError("sizeIn is greater than 5, this truth table would have too many rows (max 2^5 = 32)")
            }

            this.block = new Array<string>(this.rowCount * this.colCount) //big array
            this.block.fill('F')

            //fill the first row with the names of the columns
            for (let j = 0; j < this.source.sizeIn; j++) {
                this.block[j] = String(j)
            }
            for (let j = 0; j < this.source.sizeOut; j++) {
                this.block[this.source.sizeIn + j] = this.source.name.substring(0, 1) + String(j)
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
                    this.block[i + j] = 'T'
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
                .map(this.entryToBool)
            
            const output = this.source
                .execute(input)
                .map(this.boolToEntry)
            
            for (let j = 0; j < this.source.sizeOut; j++) {
                const index = i + this.colCount - this.source.sizeOut + j
                this.block[index] = output[j]
            }

        }
    }

    entryToBool(entry:string) {
        return entry === "T"
    }

    boolToEntry(bool:boolean) {
        return bool ? "T":"F"
    }

    unpack() {
        return this.block
    }
}

export type TruthTableSource = GateType