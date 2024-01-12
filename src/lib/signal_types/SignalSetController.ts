import { TestSignalSet, type SignalSet } from "./Signal";

export class SignalSetController {
    private signalSet:SignalSet
    private height=20
    private frameWidth = 3

    constructor(
        signalSet:SignalSet=TestSignalSet
    ) {
        this.signalSet = signalSet
    }

    drawChannels(pathParams:string=`stroke-width="1px" stroke="black" fill="none"`) {
        let points = new Array(...this.signalSet.points())
        let paths = new Array<string>(
            this.signalSet.block.length
        ).fill("")

        for (let i = 0; i < points.length; i++) {
            const p = points[i]
            for (let j = 0; j < paths.length; j++) {
                const baseHeight = (this.height + 2) * j
                paths[j] += `L ${p.frame * this.frameWidth} ${(p.value[j] ? 0:this.height) + baseHeight} `
            }
        }

        for (let j = 0; j < paths.length; j++) {
            const baseHeight = (this.height + 2) * j
            paths[j] = `<path ${pathParams} d="M 0 ${baseHeight + this.height} ${paths[j]}" />`
        }

        return {
            paths:paths,
            header:`-2 -2 ${this.getDesiredWidth()} ${this.getDesiredHeight()}`
        }
    }

    getDesiredWidth() {
        return this.frameCount() * this.frameWidth + 2
    }

    getDesiredHeight() {
        return (this.height + 2) * this.channelCount()
    }

    channelCount() {
        return this.signalSet.block.length
    }

    frameCount() {
        return this.signalSet.length
    }


}