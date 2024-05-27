import type { TutorialEventSequence } from "$lib/tutorial_types/TutorialEventSequence"
import { OutputLabelledPrebaked, getGateType } from "../GateTypes/GateTypes"

export function EventSequenceTutorial(state:any): TutorialEventSequence {return [
    {
        eventName:"dragstart",f:(evt) => {
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
        eventName:"drop",f:(evt) => {
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
        eventName:"continue",f:(evt) => {
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
        eventName:"changed",f:(evt) => {
            if (
                state.circuitController &&
                state.circuitController.getOutputs()[0] === false
            ) {
                return true
            } 
        }
    },
    {
        eventName:"continue",f:(evt) => {
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
        eventName:"dragstart",f:(evt) => {
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
        eventName:"drop",f:(evt) => {
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
        eventName:"changed",f:(evt) => {
            if (
                state.circuitController &&
                state.circuitController.getOutputs()[0] === state.circuitController.getInputs()[0]
            ) {               
                return true
            } 
        }
    },
]}