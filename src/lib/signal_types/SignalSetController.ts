import type { CircuitController } from "$lib/circuit_types/CircuitController";
import { TestSignalSet, SignalSet, type Signal, type SignalKeyFrame, bookend, SignalPlayer, type SignalFrameReader, type SignalPointResult } from "./Signal";

export class SignalSetController {
    private readonly signalSet:SignalSet
    private height=20
    private frameWidth = 3
    frameTime = 250

    constructor(
        signalSet:SignalSet
    ) {
        this.signalSet = signalSet
    }

    drawChannels(to=this.signalSet.length, pathParams=`stroke-width="1px" stroke="black" fill="none"`): Array<string> {
        return Array<string>(this.channelCount()).fill("").map((_, i) => {
            return this.drawChannel(i, to, pathParams)
        })
    }

    drawChannel(channel:number, to:number, pathParams:string) {
        const signal = this.signalSet.block[channel]
        let keyFrame = signal[0]
        let lastFrame = {
            value:this.signalSet.defaultValue,
            frame:0
        }
        let path = ""

        let i = 1
        while (i < signal.length && keyFrame.frame < to) {
            path += this.getPathElementsFrom(keyFrame, lastFrame.value, channel)
            lastFrame = keyFrame
            keyFrame = signal[i]
            i++
        }
        console.log(channel, i, keyFrame, lastFrame)

        path += this.getPathElementsFrom(
            keyFrame, lastFrame.value, channel
        )
    
        const baseHeight = this.getDesiredChannelHeight(channel)
        path = `<path ${pathParams} d="
            M 0 ${baseHeight + this.toHeightRev(this.signalSet.defaultValue)}
            ${path}
            L ${this.getDesiredFrameWidth(to)} ${baseHeight + this.toHeightRev(keyFrame.value)}
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
        return bookend(this.signalSet.toSignal())
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

        console.log(this.circuitIsValid)

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
}

