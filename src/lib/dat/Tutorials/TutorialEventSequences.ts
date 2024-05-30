import type { TutorialEventSequence } from "$lib/tutorial_types/TutorialEventSequence"
import { OutputLabelledPrebaked, getGateType } from "../GateTypes/GateTypes"

export function EventSequenceTutorial(state:any): TutorialEventSequence {return [
    {
        //wait for a dragstart and check that it's being drawn from the correct point
        //place the output gate and move the indicator over to its connection point
        eventName:"dragstart",f:async (evt) => {
            if (
                evt.to.contentEquals({id:0,type:"Output",index:0}) && 
                state.circuitController
            ) {
                state.circuitController.addGateAtCell(getGateType(OutputLabelledPrebaked[1]), 8, 2) 
                state.circuitController.setDesiredOutputs([true])
                state.indicator?.setPosition([7.75, 1.25])
                return true
            }
        }
    },
    {
        //wait for a drop on the circuit and check that the output is true to confirm that a wire has been drawn
        //show the input checkbox a little early to let the user play with it if they like, however the next event only allows the user to continue if they've undone their damage
        eventName:"drop",f: async (evt) => {
            if (
                state.circuitController && 
                state.circuitController.getOutputs()[0] === true
            ) {
                state.indicator?.hide()
                state.showInputCheckboxes = true
                return true
            }
        }
    },
    {
        //wait for continue to be clicked, make sure that the output is true to confirm that the input checkbox is checked
        //make the desired output "blue" and show the indicator over the input checkbox
        eventName:"continue",f: async (evt) => {
            if (
                state.circuitController &&
                state.circuitController.getOutputs()[0] === true
            ) {
                state.circuitController.setDesiredOutputs([false])
                state.indicator?.show()
                state.indicator?.setPosition([0.65, 0.75])
                return true
            }
        }
    },
    {
        //wait for the circuit to change and check that the output is false to confirm the user has clicked the input checkbox
        eventName:"changed",f: async (evt) => {
            if (
                state.circuitController &&
                state.circuitController.getOutputs()[0] === false
            ) {
                return true
            } 
        }
    },
    {
        //wait for continue to be pressed and check that the output is false to confirm both that there is a wire and that the input is false
        //make the desired output "grey" and move the indicator to it to ask the user to disconnect the wire
        eventName:"continue",f: async (evt) => {
            if (
                state.circuitController &&
                state.circuitController.getOutputs()[0] === false
            ) {
                state.circuitController.setDesiredOutputs([undefined])
                state.indicator?.setPosition([7.75, 1.25])
                return true
            } 
        }
    },
    {
        //wait for a drag to start and check that the output is undefined to confirm the wire earlier has been picked up
        eventName:"dragstart",f: async (evt) => {
            if (
                state.circuitController &&
                state.circuitController.getOutputs()[0] === undefined
            ) {   
                state.indicator?.hide()        
                return true
            } 
        }
    },
    {
        //wait for a drop and make sure the output is undefined to confirm there isn't a wire
        eventName:"drop",f: async (evt) => {
            if (
                state.circuitController &&
                state.circuitController.getOutputs()[0] === undefined
            ) { 
                state.circuitController.setDesiredOutputs()              
                return true
            } 
        }
    },
    {
        //wait for the circuit to change and check that the output matches the input to confirm that there's a wire
        //also enable the shelf, which is part of the existing circuit but has been hidden until now
        eventName:"changed",f:async (evt) => {
            if (
                state.circuitController &&
                state.circuitController.getOutputs()[0] === state.circuitController.getInputs()[0]
            ) {   
                return true
            } 
        }
    },
    {
        //wait for the GameView transition to finish before sending a continue event
        //reset the rendererParams to show everything
        eventName:"continue",f:async (evt) => {
            state.rendererParams = {}
            return true 
        }
    },
]}