import type { TutorialEventSequence } from "$lib/tutorial_types/TutorialEventSequence"
import { OutputLabelledPrebaked, getGateType } from "../GateTypes/GateTypes"

export function EventSequenceTutorial(state:any): TutorialEventSequence {return [
    {
        //1: wait for a dragstart and check that it's being drawn from the correct point
        //place the output gate and move the indicator over to its connection point
        eventName:"dragstart",f:async (evt) => {
            if (
                evt.to.contentEquals({id:0,type:"Output",index:0}) && 
                state.circuitController
            ) {
                state.circuitController.addGateAtCell(getGateType(OutputLabelledPrebaked[1]), 8, 2) 
                state.circuitController.setDesiredOutputs([true])
                state.expectedOutput = true
                state.indicator?.setPosition([7.75, 1.25])
                return 1
            }
        }
    },
    {
        //2: wait for a drop on the circuit and check that the output is true to confirm that a wire has been drawn
        //show the input checkbox a little early to let the user play with it if they like, however the next event only allows the user to continue if they've undone their damage
        eventName:"drop",f: async (evt) => {
            if (
                state.circuitController && 
                state.circuitController.getOutputs()[0] === true
            ) {
                state.indicator?.hide()
                state.showInputCheckboxes = true
                return 1
            }
        }
    },
    {
        //3: wait for continue to be clicked, make sure that the output is true to confirm that the input checkbox is checked
        //make the desired output "blue" and show the indicator over the input checkbox
        eventName:"continue",f: async (evt) => {
            if (
                state.circuitController &&
                state.circuitController.getOutputs()[0] === true
            ) {
                state.circuitController.setDesiredOutputs([false])
                state.expectedOutput = false
                state.indicator?.show()
                state.indicator?.setPosition([0.65, 0.75])
                return 1
            }
        }
    },
    {
        //4: wait for the circuit to change and check that the output is false to confirm the user has clicked the input checkbox
        eventName:"changed",f: async (evt) => {
            if (
                state.circuitController &&
                state.circuitController.getOutputs()[0] === false
            ) {
                return 1
            } 
        }
    },
    {
        //5: wait for continue to be pressed and check that the output is false to confirm both that there is a wire and that the input is false
        //make the desired output "grey" and move the indicator to it to ask the user to disconnect the wire
        eventName:"continue",f: async (evt) => {
            if (
                state.circuitController &&
                state.circuitController.getOutputs()[0] === false
            ) {
                state.circuitController.setDesiredOutputs([undefined])
                state.expectedOutput = undefined
                state.indicator?.setPosition([7.75, 1.25])
                return 1
            } 
        }
    },
    {
        //6: wait for a drag to start and check that the output is undefined to confirm the wire earlier has been picked up
        eventName:"dragstart",f: async (evt) => {
            if (
                state.circuitController &&
                state.circuitController.getOutputs()[0] === undefined
            ) {   
                state.indicator?.hide()        
                return 1
            } 
        }
    },
    {
        //7: wait for a drop and make sure the output is undefined to confirm there isn't a wire
        eventName:"drop",f: async (evt) => {
            if (
                state.circuitController &&
                state.circuitController.getOutputs()[0] === undefined
            ) { 
                state.circuitController.setDesiredOutputs()             
                return 1
            } 
        }
    },
    {
        //8: wait for the circuit to change and check that the output matches the input to confirm that there's a wire
        //also enable the shelf, which is part of the existing circuit but has been hidden until now
        eventName:"changed",f:async (evt) => {
            if (
                state.circuitController &&
                state.circuitController.getOutputs()[0] === state.circuitController.getInputs()[0]
            ) {   
                return 1
            } 
        }
    },
    {
        //9: wait for the GameView transition to finish before sending a continue event
        //reset the rendererParams to show everything
        eventName:"continue",f:async (evt) => {
            state.rendererParams = {}
            return 1 
        }
    },
    {
        //10: wait for the user to press continue
        eventName:"continue",f:async (evt) => {
            return 1
        }
    },
    {
        //11: wait for the user to press play on the signal
        eventName:"play",f:async (evt) => {
            return 1
        }
    },
    {
        //12: wait for the signal to get a certain frame before telling the player what's going on
        eventName:"step",f:async (evt) => {
            if (
                state.circuitController &&
                evt.frame >= 50
            ) {
                return 1
            }
        }
    },
    {
        //13: wait for the user to accept the text
        eventName:"continue",f:async (evt) => {
            return 1
        }
    },
]}