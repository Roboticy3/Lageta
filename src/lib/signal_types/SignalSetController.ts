import type { CircuitController } from "$lib/circuit_types/CircuitController";
import { TestSignalSet, SignalSet, type Signal, type SignalKeyFrame, bookend } from "./Signal";

export class SignalSetController<T extends boolean | number | string> {
    private readonly signalSet:SignalSet<T>
    private height=20
    private frameWidth = 3
    frameTime = 250

    private readonly signal:Signal<T[]>

    constructor(
        signalSet:SignalSet<T>
    ) {
        this.signalSet = signalSet
        this.signal = this.toSignal()
    }

    drawChannels(pathParams:string=`stroke-width="1px" stroke="black" fill="none"`) {
        let points = new Array(...this.signalSet.points())
        const channelCount = this.channelCount()
        let paths = new Array<string>(
            channelCount
        ).fill("")
        let lastValues = new Array<T>(
            channelCount
        ).fill(this.signalSet.defaultValue)

        for (let i = 0; i < points.length; i++) {
            const p = points[i]
            for (let j = 0; j < paths.length; j++) {
                const baseHeight = (this.height + 2) * j
                paths[j] += `L ${
                    p.frame * this.frameWidth
                } ${
                    (this.toHeightRev(lastValues[j])) + baseHeight
                } L ${
                    p.frame * this.frameWidth
                } ${
                    (this.toHeightRev(p.value[j])) + baseHeight
                } `
                lastValues[j] = p.value[j]
            }
        }

        for (let j = 0; j < paths.length; j++) {
            const baseHeight = (this.height + 2) * j
            paths[j] = `<path ${pathParams} d="M 0 ${baseHeight + this.height} ${paths[j]} L ${this.getDesiredWidth()} ${baseHeight + this.toHeightRev(points[points.length - 1].value[j])}" />`
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

    getFrameWidth() {
        return this.frameWidth
    }

    channelCount() {
        return this.signalSet.block.length
    }

    frameCount() {
        return this.signalSet.length
    }

    toSigStrengthRev(x:T) {
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

    toHeightRev(x:T) {
        return this.toSigStrengthRev(x) * this.height
    }

    toSignal() {
        return bookend(this.signalSet.toSignal())
    }

    private currentKeyFrame:SignalKeyFrame<T[]> = {
        value:[],
        frame:0
    }
    private currentFrame = 0
    private nextSignal = 0
    private scrubIntervalId:number | undefined = undefined
    private scrubbing = false
    scrub(iter:SignalFrameReader<T> | undefined = undefined, reset:boolean = true) {
        if (reset || this.currentFrame >= this.signalSet.length) this.resetScrub()

        this.scrubIntervalId = setInterval(
            this.scrubStep.bind(this, iter), this.frameTime
        )
        this.scrubbing = true
    }

    private resetScrub() {
        this.currentKeyFrame = {
            value:this.signalSet.getInitialValue(),
            frame:0
        }
        this.currentFrame = 0

        this.nextSignal = 0

        if (this.scrubIntervalId) clearInterval(this.scrubIntervalId)
        this.scrubIntervalId = undefined
        this.scrubbing = false
    }

    private scrubStep(iter:SignalFrameReader<T> | undefined = undefined) {
        const nextKeyFrame:SignalKeyFrame<T[]> | undefined = this.signal[this.nextSignal]
        const nextFrame = nextKeyFrame.frame

        const update = this.currentFrame >= nextFrame
        if (update) {
            this.nextSignal++
            this.currentKeyFrame = nextKeyFrame
        }
        this.currentFrame++

        const done = this.currentFrame >= this.frameCount() || !this.scrubbing
        const result = iter?.call(iter, 
            this.currentKeyFrame.value, 
            this.currentFrame, 
            update,
            done) || false

        if (done || result) {
            clearInterval(this.scrubIntervalId)
            this.scrubbing = false
        }
    }

    abortScrub() {
        this.scrubbing = false
    }

    scrubTo(frame:number, reset:boolean = true) {
        if (reset || this.currentFrame >= this.signalSet.length) this.resetScrub()
        this.currentFrame = frame

        for (let keyFrame of this.signal) {
            this.nextSignal++
            if (keyFrame.frame > frame) {
                break
            }
            this.currentKeyFrame = keyFrame
        }

        return this.currentKeyFrame
    }
}

export type SignalFrameReader<T> = (currentValue:T[], currentFrame:number, update:boolean, done:boolean) => boolean | void