import type { ConnectionValue, GateType } from "$lib/circuit_types/Gate"

type SignalKeyFrame = {
    frame:number,
    value:boolean
}

type Signal = Array<SignalKeyFrame>

export class SignalSet implements Iterable<Array<boolean>>{
    readonly block:Array<Signal>
    readonly length:number
    readonly inputs:number
    readonly outputs:number

    constructor(
        block:Array<Signal>,
        length:number,
        solverOrInputChannels:GateType | number = 1
    ) {
        this.block = block
        this.length = length
        const start = this.getInitial()
        this.currentIndex = start[0]
        this.currentValue = start[1]

        if (typeof solverOrInputChannels === "number") {
            this.inputs = solverOrInputChannels
            this.outputs = block.length - solverOrInputChannels
            return
        }
        const solver = solverOrInputChannels
        this.inputs = solver.sizeIn
        this.outputs = solver.sizeOut

        let extendedBlock = new Array(solver.sizeOut)
            .fill(new Array<SignalKeyFrame>())
        
        let last = new Array<ConnectionValue>(solver.sizeOut)
        for (let i = 0; i < length; i++) {
            //run a function to add output keyframes based on the solver
            //these keyframes will go into the extended block, which will then get pushed onto the main block
            //I can see how this should work when I write it on paper, but I have no idea how to express it as code
        }
    }

    private currentIndex:Array<number>
    private currentValue:Array<boolean>
    private currentFrame=0
    private getInitial():[Array<number>,Array<boolean>] {
        return [
            new Array<number>(
                this.block.length
            ).fill(-1),
            this.currentValue = new Array<boolean>(
                this.block.length
            ).fill(false)
        ]
    }
    
    reset() {
        const start = this.getInitial()
        this.currentIndex = start[0]
        this.currentValue = start[1]
        this.currentFrame = 0
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
            value:false
        } as SignalKeyFrame
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

    points(): Iterable<SignalPointResult> {
        this.reset()
        const thisNext = this.nextKeyFrame.bind(this)
        return {
            [Symbol.iterator](): Iterator<SignalPointResult> {
                return {
                    next:thisNext
                }
            }
        }
    }
}
type SignalPointResult = {
    value:Array<boolean>
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
    5
)
