import { createGate, type ConnectionValue, type GateType } from "$lib/circuit_types/Gate"

export type SignalKeyFrame<T> = {
    frame:number,
    value:T
}

export type Signal<T> = Array<SignalKeyFrame<T>>

export function bookend<T>(s:Signal<T>) {
    const last = s[s.length - 1]
    const bookend = {
        frame:2147483647,
        value:last.value
    }
    s.push(bookend)
    return s
}

export class SignalSet implements Iterable<Array<boolean>>{
    readonly block:Array<Signal<boolean>>
    readonly length:number
    readonly inputs:number
    readonly outputs:number

    readonly defaultValue:boolean

    constructor(
        block:Array<Signal<boolean>> = [],
        length:number = 0,
        defaultValue:boolean = false,
        solverOrInputChannels:GateType | number = 0
    ) {
        this.block = block
        this.length = length
        const start = this.getInitial()
        this.currentIndex = start[0]
        this.currentValue = start[1]

        this.defaultValue = defaultValue

        if (typeof solverOrInputChannels === "number") {
            this.inputs = solverOrInputChannels
            this.outputs = block.length - solverOrInputChannels
            return
        }
        const solver = solverOrInputChannels
        const gate = createGate(solver)
        this.inputs = solver.sizeIn
        this.outputs = solver.sizeOut

        let extendedBlock = gate.execute(this.getInitialValue()).map((v) => {
            return [{
                value:v || false,
                frame:0
            }] as Signal<boolean>
        })
        
        for (let point of this.points()) {
            //run a function to add output keyframes based on the solver
            //these keyframes will go into the extended block, which will then get pushed onto the main block
            //I can see how this should work when I write it on paper, but I have no idea how to express it as code
            const output = gate.execute(point.value)
            for (let i = 0; i < output.length; i++) {
                extendedBlock[i].push({
                    value:output[i] || false,
                    frame:point.frame
                })
            }
        }
        
        this.block.push(...extendedBlock)
    }

    private currentIndex:Array<number>
    private currentValue:Array<boolean>
    private currentFrame=0
    private getInitial():[Array<number>,Array<boolean>] {
        return [
            this.getInitialIndex(),
            this.getInitialValue()
        ]
    }

    private getInitialIndex() {
        return new Array<number>(
            this.block.length
        ).fill(-1)
    }

    getInitialValue() {
        return this.currentValue = new Array<boolean>(
            this.block.length
        ).fill(this.defaultValue)
    }
    
    reset() {
        const start = this.getInitial()
        this.currentIndex = start[0]
        this.currentValue = start[1]
        this.currentFrame = 0
        console.log(this.currentIndex, this.currentValue, this.block.length)
    }

    nextKeyFrame() {
        let index = Array.from(this.currentIndex)
        let value = Array.from(this.currentValue)

        let availableChannels = new Set<number>(
            (new Array(this.block.length)).keys()
        ) //set of channels that can contain the next frame
        
        const xp = index.map((v, i) => {
            //if a channel has finished, delete it from the available set
            if (v + 1 >= this.block[i].length) {
                availableChannels.delete(i)
            }
            return v + 1
        })
        //if no channels are left, return the "default" index of all -1's
        if (availableChannels.size === 0) {
            return {
                done:true,
                value:{
                    value:value,
                    frame:this.currentFrame
                }
            }
        }

        const channelCount = availableChannels.size

        //search each channel for the keyframe on the next index with the earliest frame
        let nearest = new Array<number>(channelCount)
        let currentKeyFrame = {
            frame:this.length,
            value:this.defaultValue
        } as SignalKeyFrame<boolean>
        for (let i of availableChannels) {
            const candidate = this.block[i][xp[i]]
            //if the keyframe comes before the current nearest, replace the current nearest
            if (currentKeyFrame.frame > candidate.frame) {
                nearest[0] = i
                currentKeyFrame = this.block[i][xp[i]]
            }
        }
        //update the current frame
        this.currentFrame = currentKeyFrame.frame

        //search the channels again for keyframes on the same frame as the nearest
        let nearestCount = 0
        for (let i of availableChannels) {
            const candidate = this.block[i][xp[i]]
            if (candidate.frame === currentKeyFrame.frame) {
                nearest[nearestCount] = i
                nearestCount++
            }
        }

        //replace the current index with the next index only with in the channels with the nearest keyframes
        for (let i = 0; i < nearestCount; i++) {
            const ni = nearest[i]
            index[ni] = xp[ni]
            value[ni] = this.block[ni][xp[ni]].value
        }

        this.currentIndex = index
        this.currentValue = value

        return {
            done:false,
            value:{
                value:value,
                frame:currentKeyFrame.frame
            }
        }
    }

    nextFrame(): IteratorResult<Array<boolean>> {
        const xp = this.currentIndex.map((v, i) => {
            return v + 1
        })
        for (let i = 0; i < this.block.length; i++) {
            const keyFrame = this.block[i][xp[i]]
            if (keyFrame && keyFrame.frame <= this.currentFrame) {
                this.currentIndex[i] = xp[i]
                this.currentValue[i] = keyFrame.value
            }
        }
        
        this.currentFrame++

        return {
            done:this.currentFrame==this.length,
            value:Array.from(this.currentValue)
        }
    }

    [Symbol.iterator](): Iterator<Array<boolean>> {
        this.reset()
        const thisNext = this.nextFrame.bind(this)
        return {
            next:thisNext
        }
    }

    points(): Iterable<SignalPointResult<boolean>> {
        this.reset()
        const thisNext = this.nextKeyFrame.bind(this)
        return {
            [Symbol.iterator](): Iterator<SignalPointResult<boolean>> {
                return {
                    next:thisNext
                }
            }
        }
    }

    toSignal(): Signal<Array<boolean>> {
        let signal:Signal<Array<boolean>> = []
        for (let point of this.points()) {
            signal.push(point)
        }
        return signal
    }
}
export type SignalPointResult<T> = {
    value:Array<T>
    frame:number
}

export const TestSignalSet = new SignalSet(
    [
        [
            {frame:6,value:true},
            {frame:12,value:false}
        ],
        [
            {frame:3,value:true},
            {frame:8,value:false},
            {frame:9,value:true},
            {frame:12,value:false}
        ],
        [
            {frame:5,value:true},
            {frame:9,value:false},
        ],
        [
            {frame:3,value:true},
            {frame:13,value:false}
        ],
        [
            {frame:5,value:true},
            {frame:9,value:false},
            {frame:16,value:true}
        ]
    ],
    17,
    false,
    5
)

export class SignalPlayer {

    readonly length
    readonly initialValue
    readonly frameTime
    readonly signal

    constructor(
        signalSet:SignalSet,
        frameTime:number
    ) {
        this.length = signalSet.length
        this.initialValue = signalSet.getInitialValue()
        this.frameTime = frameTime
        this.signal = bookend(signalSet.toSignal())
    }

    private currentKeyFrame:SignalKeyFrame<boolean[]> = {
        value:[],
        frame:0
    }
    private currentFrame = 0
    private nextSignal = 0
    private scrubIntervalId:number | undefined = undefined
    private scrubbing = false
    scrub(iter:SignalFrameReader<boolean> | undefined = undefined, reset:boolean = true) {
        if (reset || this.currentFrame >= this.length) this.resetScrub()
        
        this.scrubbing = true

        this.scrubIntervalId = setInterval(
            this.scrubStep.bind(this, iter), this.frameTime
        )
    }

    resetScrub() {
        this.currentKeyFrame = {
            value:this.initialValue,
            frame:0
        }
        this.currentFrame = 0

        this.nextSignal = 0

        if (this.scrubIntervalId) clearInterval(this.scrubIntervalId)
        this.scrubIntervalId = undefined
        this.scrubbing = false
    }

    private scrubStep(iter:SignalFrameReader<boolean> | undefined = undefined) {
        const nextKeyFrame:SignalKeyFrame<boolean[]> | undefined = this.signal[this.nextSignal]
        const nextFrame = nextKeyFrame.frame

        const update = this.currentFrame >= nextFrame
        if (update) {
            this.nextSignal++
            this.currentKeyFrame = nextKeyFrame
        }
        this.currentFrame++

        const done = this.currentFrame >= this.length || !this.scrubbing
        const val = this.currentKeyFrame.value
        const result = iter?.call(iter, 
            val,
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
        if (reset || this.currentFrame >= this.length) this.resetScrub()
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

    getCurrentValue() {
        if (this.currentKeyFrame.value.length === 0) {
            return this.initialValue
        }
        return Array.from(this.currentKeyFrame.value)
    }

    isScrubbing() {
        return this.scrubbing
    }
}


export type SignalFrameReader<T> = (currentValue:T[], currentFrame:number, update:boolean, done:boolean) => boolean | void