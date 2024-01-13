import type { CircuitController } from "$lib/circuit_types/CircuitController";
import { TestSignalSet, type SignalSet, type Signal } from "./Signal";

export class SignalSetController {
    private signalSet:SignalSet<boolean>
    private height=20
    private frameWidth = 3
    private frameTime = 250

    constructor(
        signalSet:SignalSet<boolean>=TestSignalSet
    ) {
        this.signalSet = signalSet
    }

    drawChannels(pathParams:string=`stroke-width="1px" stroke="black" fill="none"`) {
        let points = new Array(...this.signalSet.points())
        const channelCount = this.channelCount()
        let paths = new Array<string>(
            channelCount
        ).fill("")
        let lastValues = new Array<boolean>(
            channelCount
        ).fill(false)

        for (let i = 0; i < points.length; i++) {
            const p = points[i]
            for (let j = 0; j < paths.length; j++) {
                const baseHeight = (this.height + 2) * j
                paths[j] += `L ${
                    p.frame * this.frameWidth
                } ${
                    (this.toSigStrengthRev(lastValues[j]) * this.height) + baseHeight
                } L ${
                    p.frame * this.frameWidth
                } ${
                    (this.toSigStrengthRev(p.value[j]) * this.height) + baseHeight
                }`
                lastValues[j] = p.value[j]
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

    toSigStrengthRev<T>(x:T) {
        switch (typeof x) {
            case "boolean":
                return x ? 0:1
            case "number":
                return 1 - x
            case "string":
                return 1 - Number(x)
        }

        return 1 - 0
    }

    toSignal() {
        return this.signalSet.toSignal()
    }

    private currentFrame = 0
    private currentValue:boolean[] = []
    private nextSignal = 0
    private signal:Signal<boolean[]> = []
    private scrubIntervalId:number | undefined = undefined
    scrub() {
        this.currentFrame = 0
        this.currentValue

        this.nextSignal = 0
        this.signal = this.toSignal()

        this.scrubIntervalId = setInterval(this.scrubStep.bind(this), 250)
        setTimeout(
            () => {
                clearInterval(this.scrubIntervalId) 
            }, 
            this.frameCount() * this.frameTime * 2
        )
    }

    private scrubStep() {
        const keyFrame = this.signal[this.nextSignal]
        const update = this.currentFrame >= keyFrame.frame
        console.log(this.currentFrame, update, keyFrame.frame)
        if (update) {
            //this.send(keyFrame.value, circuitController)
            this.nextSignal++
        }
        this.currentFrame++

        if (this.currentFrame >= this.frameCount()) {
            clearInterval(this.scrubIntervalId)
        }
    }
}