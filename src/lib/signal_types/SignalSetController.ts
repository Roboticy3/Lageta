import type { CircuitController } from "$lib/circuit_types/CircuitController";
import { TestSignalSet, SignalSet, Signal, type SignalKeyFrame, SignalPlayer, type SignalFrameReader, type SignalPointResult } from "./Signal";

export class SignalSetController {
    private readonly signalSet:SignalSet
    private height=20
    private frameWidth = 3
    frameTime = 250

    constructor(
        from:SignalSet | number
    ) {
        if (from instanceof SignalSet) {
            this.signalSet = from
        }
        else {
            this.signalSet = new SignalSet(
                Array<Signal<boolean>>(from).fill(new Signal()),
                0
            )
        }
    }

    drawChannels(to=this.signalSet.length, pathParams=`stroke-width="1px" stroke="black" fill="none"`): Array<string> {
        return Array<string>(this.channelCount()).fill("").map((_, i) => {
            return this.drawChannel(i, to, pathParams)
        })
    }

    drawChannel(channel:number, to:number, pathParams:string) {
        const signal = this.signalSet.block[channel]

        if (signal.unpack().length === 0) {
            return ""
        }

        let lastFrame = {
            value:this.signalSet.defaultValue,
            frame:0
        }
        let path = ""

        for (let i = 0; i < signal.unpack().length; i++) {
            const keyFrame = signal.unpack()[i]
            if (keyFrame.frame > to) break

            path += this.getPathElementsFrom(keyFrame, lastFrame.value, channel)
            lastFrame = keyFrame
        }

        path += this.getPathElementsFrom(
            {value:lastFrame.value, frame:to},
            lastFrame.value,channel
        )
    
        const baseHeight = this.getDesiredChannelHeight(channel)
        path = `<path ${pathParams} d="
            M 0 ${baseHeight + this.toHeightRev(this.signalSet.defaultValue)}
            ${path}
        "/>`
        return path
    }

    private getPathElementsFrom(p:SignalKeyFrame<boolean>, lastValue:boolean, channel:number) {
        const baseHeight = (this.height + 2) * channel
        return `L ${
            p.frame * this.frameWidth
        } ${
            (this.toHeightRev(lastValue)) + baseHeight
        } L ${
            p.frame * this.frameWidth
        } ${
            (this.toHeightRev(p.value)) + baseHeight
        } `
    }

    getDesiredWidth() {
        return this.frameCount() * this.frameWidth + 2
    }

    getDesiredFrameWidth(frame:number=1) {
        return this.frameWidth * frame
    }

    getDesiredHeight() {
        return (this.height + 2) * this.channelCount()
    }

    getDesiredChannelHeight(channel:number) {
        return (this.height + 2) * channel
    }

    channelCount() {
        return this.signalSet.block.length
    }

    frameCount() {
        return this.signalSet.length
    }

    toSigStrengthRev(x:boolean) {
        return x ? 0:1
    }

    toHeightRev(x:boolean) {
        return this.toSigStrengthRev(x) * this.height
    }

    toSignal() {
        const s = this.signalSet.toSignal()
        s.bookend()
        return s
    }

    private player:SignalPlayer | undefined = undefined
    createPlayer(frameTime=250) {
        this.player = new SignalPlayer(
            this.signalSet,
            frameTime
        )
    }

    startPlayer(iter: SignalFrameReader<boolean> | undefined, reset:boolean) {
        if (this.player) this.player.scrub(iter, reset)
    }

    pausePlayer() {
        if (this.player) this.player.abortScrub()
    }

    getPlayerValue() {
        if (this.player) return this.player.getCurrentValue()
    }

    isPlayerActive() {
        return this.player !== undefined
    }

    resetPlayer() {
        if (this.player) this.player.resetScrub()
        this.circuitIsValid = true
    }

    sendPlayerToController(circuitController:CircuitController | SignalSetController) {
        if (this.player) circuitController.setPlayer(this.player)
    }

    setPlayer(player:SignalPlayer) {
        this.player = player
    }

    private circuitIsValid = true
    validateControllerWith(circuitController:CircuitController, value:boolean[]=this.getPlayerValue() || []) {
        const inputs = value.slice(0, this.signalSet.inputs)
        circuitController.setInputs(inputs)

        const outputsStart = value.length - this.signalSet.outputs
        const outputs = value.slice(-this.signalSet.outputs, value.length)
        const result = circuitController.getOutputs()
        
        if (this.circuitIsValid) {for (let i = 0; i < value.length - outputsStart; i++) {
            if (outputs[i] !== result[i]) {
                this.circuitIsValid = false
                break
            }
        }}

        return result
    }
    
    validatedWithController() {
        return this.circuitIsValid
    }

    forceValidate() {
        this.circuitIsValid = true
    }

    getInputSize() {
        return this.signalSet.inputs
    }

    getOutputSize() {
        return this.signalSet.outputs
    }

    getDefaultInputs() {
        return Array<boolean>(this.getInputSize()).fill(this.signalSet.defaultValue)
    }

    getLength() {
        return this.signalSet.length
    }

    push(values:boolean[], frame:number) {
        if (this.signalSet.length < frame) {
            this.signalSet.length = frame
        }

        for (let i = 0; i < values.length; i++) {
            this.signalSet.block[i].unpack().push({
                value:values[i],
                frame:frame
            })
        }
    }
}

