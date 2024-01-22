import type { CircuitController } from "$lib/circuit_types/CircuitController";
import { TestSignalSet, SignalSet, type Signal, type SignalKeyFrame, bookend, SignalPlayer, type SignalFrameReader } from "./Signal";

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

    drawChannels(
        points=new Array(...this.signalSet.points()),
        pathParams:string=`stroke-width="1px" stroke="black" fill="none"`
    ) {
        const channelCount = this.channelCount()
        let paths = new Array<string>(
            channelCount
        ).fill("")
        let lastValues = new Array<boolean>(
            channelCount
        ).fill(this.signalSet.defaultValue)

        for (let i = 0; i < points.length; i++) {
            const p = points[i]
            for (let j = 0; j < paths.length; j++) {
                paths[j] += this.getPathElementsFrom(p, lastValues, j)
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
    

    private getPathElementsFrom(p:SignalKeyFrame<boolean[]>, lastValues:boolean[], channel:number) {
        const baseHeight = (this.height + 2) * channel
        return `L ${
            p.frame * this.frameWidth
        } ${
            (this.toHeightRev(lastValues[channel])) + baseHeight
        } L ${
            p.frame * this.frameWidth
        } ${
            (this.toHeightRev(p.value[channel])) + baseHeight
        } `
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

    toSigStrengthRev(x:boolean) {
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

