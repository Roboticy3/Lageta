import type { ConnectionValue } from "$lib/circuit_types/GateType"
import { CustomEventTarget, type CustomEventListener } from "$lib/misc_types/CustomEventSystem"
import type { SignalKeyFrame } from "./Signal"

export const SIGNALSETVIEWEVENTKEYS = ["restart", "play", "pause", "complete", "done", "step"] as const;
type SignalSetViewEventKeyTuple = typeof SIGNALSETVIEWEVENTKEYS;
export type SignalSetViewEventKey = SignalSetViewEventKeyTuple[number]

export interface SignalSetViewEvent<T> extends SignalKeyFrame<T> {}

export type SignalSetViewEventListener<T> = CustomEventListener<SignalSetViewEvent<T>, SignalSetViewEventKey>

export class SignalSetViewEventTarget<T> extends CustomEventTarget<SignalSetViewEvent<T>, SignalSetViewEventKey> {}

export class CircuitSignalSetViewEventTarget extends SignalSetViewEventTarget<ConnectionValue[]> {}

export interface CircuitSignalSetViewEvent extends SignalSetViewEvent<ConnectionValue[]>{}