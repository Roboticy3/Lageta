import type { CircuitController } from "$lib/circuit_types/CircuitController";
import type { ConnectionValue } from "$lib/circuit_types/GateType";
import type { WinCondition } from "$lib/circuit_types/WinCondition";
import { createCustomEvent } from "$lib/misc_types/CustomEventSystem";
import { SignalSet, Signal, type SignalKeyFrame, SignalPlayer, type SignalFrameReader, type SignalPointResult, ConnectionValueSignalSet } from "./Signal";
import { CircuitSignalSetViewEventTarget, SignalSetViewEventTarget, type SignalSetViewEventKey } from "./SignalSetViewEvent";

export class SignalSetView<T> {
    readonly signalSet:SignalSet<T>
    readonly height=20

    private target:EventTarget | null

    constructor(
        from:SignalSet<T> | number | T[],
        target:EventTarget | null = null,
        signalSetViewEventTarget:SignalSetViewEventTarget<T[]> | undefined = undefined
    ) {
        if (from instanceof SignalSet) {
            this.signalSet = from
        }
        else if (typeof from === "number") {
            this.signalSet = this.initBlankChannels(from)
        }
        else {
            this.signalSet = this.initChannelsWithValue(from)
        }

        this.target = target

        this.signalSetViewEventTarget = signalSetViewEventTarget || new SignalSetViewEventTarget<T[]>()
    }

    private initBlankChannels(from:number) {
        let start = Array<Signal<T>>(from)
        for (let i = 0; i < from; i++) {
            start[i] = new Signal()
        }
        return new SignalSet<T>(
            start,
            0
        )
    }

    private initChannelsWithValue(from:T[]) {
        let start = Array<Signal<T>>(from.length)
        for (let i = 0; i < from.length; i++) {
            start[i] = new Signal(
                [{value:from[i],frame:0}]
            )
        }
        return new SignalSet<T>(
            start,
            0
        )
    }

    drawChannel(channel:number, to:number, pathParams:string) {}

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
    
    toSignal() {
        const s = this.signalSet.toSignal()
        s.bookend()
        return s
    }

    push(values:T[], frame:number) {
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
    
    protected player:SignalPlayer<T> | undefined = undefined
    createPlayer(frameTime=250) {
        this.player = new SignalPlayer(
            this.signalSet,
            frameTime
        )
    }

    startPlayer(iter: SignalFrameReader<T> | undefined, reset:boolean = false) {
        if (this.player) {
            this.player.scrub(
                iter ? (currentValue, currentFrame, update, done) => {
                    iter(currentValue, currentFrame, update, done)
                    this.scrubDispatch(currentValue, currentFrame, update, done)
                } : this.scrubDispatch, 
                reset
            )
            this.dispatchSignalEvent("play")
        } 
    }

    private readonly scrubDispatch:SignalFrameReader<T> = (currentValue, currentFrame, update, done) => {
        this.dispatchSignalEvent("step")
        if (done) this.dispatchSignalEvent("done")
    }

    pausePlayer() {
        if (this.player) {
            this.player.abortScrub()
            this.dispatchSignalEvent("pause")
        }
    }

    getPlayerValue() {
        if (this.player) return this.player.getCurrentValue()
    }

    getPlayerFrame() {
        if (this.player) return this.player.getCurrentFrame()
    }

    isPlayerActive() {
        return this.player !== undefined
    }

    resetPlayer() {
        if (this.player) {
            this.player.resetScrub()
            this.dispatchSignalEvent("restart")
        }
    }

    setPlayer(player:SignalPlayer<T>) {
        this.player = player
    }

    private signalSetViewEventTarget

    private createSignalEvent(type:SignalSetViewEventKey) {
        if (!this.player) return undefined

        return createCustomEvent(
            {
                frame:this.player.getCurrentFrame(),
                value:this.player.getCurrentValue()
            },
            type, this.target
        )
    }

    private dispatchSignalEvent(type:SignalSetViewEventKey) {
        const evt = this.createSignalEvent(type)
        if (!evt) {
            throw Error(`SignalSetView tried to throw a signal event with no player!`)
        }          
        this.signalSetViewEventTarget.dispatchEvent(evt)
    }

    setTarget(newTarget:EventTarget) {
        this.target = newTarget
    }

    setEventTarget(newEventTarget:SignalSetViewEventTarget<T[]>) {
        this.signalSetViewEventTarget = newEventTarget
    }
}

export class CircuitSignalSetView extends SignalSetView<ConnectionValue> implements WinCondition {

    frameWidth = 3
    frameTime = 250

    drawChannel = (channel:number, to:number, pathParams:string) => {
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

    sendPlayerToController(circuitController:CircuitController | CircuitSignalSetView) {
        if (this.player) circuitController.setPlayer(this.player)
    }
    
    private circuitIsValid = true
    private signalChangeListeners:Set<(cond: ConnectionValue[]) => any> = new Set()
    getCondition(): ConnectionValue[] {
        if (this.player?.isScrubbing())
            return this.player.getCurrentValue()
        return []
    }
    addListener(listener: (cond: ConnectionValue[]) => any): boolean {
        if (this.signalChangeListeners.has(listener)) return false
        this.signalChangeListeners.add(listener)
        return true
    }
    removeListener(listener: (cond: ConnectionValue[]) => any): boolean {
        return this.signalChangeListeners.delete(listener)
    }
    dispatch(cond:ConnectionValue[]) {
       this.signalChangeListeners.forEach((l) => {l(cond)})     
    }

    isCircuitValid() { return this.circuitIsValid }

    private validateWithOutputs(outputs:ConnectionValue[]) {
        if (this.circuitIsValid === false) return

        const expectedOutputs = this.getPlayerValue()?.slice(this.signalSet.inputs)
        if (expectedOutputs === undefined) {
            this.circuitIsValid = false
            return
        }
        console.log("validating ", outputs, " against ", expectedOutputs)
        
        this.circuitIsValid = expectedOutputs.every((v, i) => {return v === outputs[i]})
    }

    private ourIterTemplate(
        iter: SignalFrameReader<ConnectionValue>,
        circuitController:CircuitController,
        currentValue: ConnectionValue[], 
        currentFrame: number, 
        update: boolean, 
        done: boolean
    ) {
        iter(currentValue, currentFrame, update, done)
        if (update) {
            this.validateWithOutputs(circuitController.getOutputs())
            this.dispatch(currentValue.slice(this.getInputSize()))
        }
        console.log("playing signal, valid: ", this.circuitIsValid)
    }

    playVerify(circuitController:CircuitController, iter: SignalFrameReader<ConnectionValue>, reset:boolean = false) {
        const ourIter = (this.ourIterTemplate).bind(this, iter, circuitController)
        this.startPlayer(ourIter, reset)
    }

    forceValidate() {
        this.circuitIsValid = true
    }

    resetPlayer(): void {
        super.resetPlayer()
        this.circuitIsValid = true
    }
   
}

