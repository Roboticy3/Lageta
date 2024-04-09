import type { CircuitController } from "$lib/circuit_types/CircuitController";
import type { ConnectionValue } from "$lib/circuit_types/GateType";
import { SignalSet, Signal, type SignalKeyFrame, SignalPlayer, type SignalFrameReader, type SignalPointResult, ConnectionValueSignalSet } from "./Signal";

type SignalSetDrawChannel = (channel:number, to:number, pathParams:string) => string
export class SignalSetView<T> {
    readonly signalSet:SignalSet<T>
    readonly height=20
    readonly drawChannel: SignalSetDrawChannel

    constructor(
        from:SignalSet<T> | number,
        drawChannel: SignalSetDrawChannel
    ) {
        if (from instanceof SignalSet) {
            this.signalSet = from
        }
        else {
            let start = Array<Signal<T>>(from)
            for (let i = 0; i < from; i++) {
                start[i] = new Signal()
            }
            this.signalSet = new SignalSet<T>(
                start,
                0
            )
        }

        this.drawChannel = drawChannel
    }


    drawChannels(
        to:number = this.signalSet.length, 
        pathParams:string = `stroke-width="1px" stroke="black" fill="none"`
    ) {
        return Array<string>(this.channelCount()).fill("").map((_, i) => {
            return this.drawChannel(i, to, pathParams)
        })
    }

    channelCount() {
        return this.signalSet.block.length
    }
}

export class CircuitSignalSetView extends SignalSetView<ConnectionValue> {

    constructor(
        from:ConnectionValueSignalSet | SignalSet<ConnectionValue> | number,
    ) {
        const drawChannel = (channel:number, to:number, pathParams:string) => {
            const signal = this.signalSet.block[channel]
            const defaultValue = this.getDefaultInputs()[channel]
    
            if (signal.unpack().length === 0) {
                return ""
            }
    
            let lastFrame = {
                value:defaultValue,
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
                M 0 ${this.toHeightRev(defaultValue)}
                ${path}
            "/>`
            return path
        }
        super(from, drawChannel)
    }

    frameWidth = 3
    frameTime = 250

    

    private getPathElementsFrom(p:SignalKeyFrame<ConnectionValue>, lastValue:ConnectionValue, channel:number) {
        return `L ${
            p.frame * this.frameWidth
        } ${
            (this.toHeightRev(lastValue))
        } L ${
            p.frame * this.frameWidth
        } ${
            (this.toHeightRev(p.value))
        } `
    }

    getDesiredWidth() {
        return this.frameCount() * this.frameWidth + 2
    }

    getDesiredFrameWidth(frame:number=1) {
        return this.frameWidth * frame
    }

    getDesiredHeight(overrideHeight?:number) {
        return ((overrideHeight || this.height) + 2) * this.channelCount()
    }

    getDesiredChannelHeight(channel:number, overrideHeight?:number) {
        return ((overrideHeight || this.height) + 2) * channel
    }

    channelCount() {
        return this.signalSet.block.length
    }

    frameCount() {
        return this.signalSet.length
    }

    toSigStrengthRev(x:ConnectionValue) {
        return x ? 0:1
    }

    toHeightRev(x:ConnectionValue) {
        return this.toSigStrengthRev(x) * this.height
    }

    toSignal() {
        const s = this.signalSet.toSignal()
        s.bookend()
        return s
    }

    private player:SignalPlayer<ConnectionValue> | undefined = undefined
    createPlayer(frameTime=250) {
        this.player = new SignalPlayer(
            this.signalSet,
            frameTime
        )
    }

    startPlayer(iter: SignalFrameReader<ConnectionValue> | undefined, reset:boolean) {
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

    sendPlayerToController(circuitController:CircuitController | CircuitSignalSetView) {
        if (this.player) circuitController.setPlayer(this.player)
    }

    setPlayer(player:SignalPlayer<ConnectionValue>) {
        this.player = player
    }

    private circuitIsValid = true
    validateControllerWith(circuitController:CircuitController, value:ConnectionValue[]=this.getPlayerValue() || []) {
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
        return this.signalSet.getInitialValue()
    }

    getLength() {
        return this.signalSet.length
    }

    push(values:boolean[], frame:number) {
        if (this.signalSet.length < frame) {
            this.signalSet.length = frame
        }

        for (let i = 0; i < this.signalSet.block.length; i++) {
            let signal = this.signalSet.block[i]
            const newSignal = new Signal([{
                value:values[i],
                frame:frame
            }])
            
            signal.push(newSignal)
        }
    }
}

