import type { ConnectionValue } from "$lib/circuit_types/GateType"
import { CustomEventTarget, type CustomEventListener } from "$lib/misc_types/CustomEventSystem"
import type { SignalKeyFrame } from "./Signal"

export type SignalSetViewEventKey = "restart" | "play" | "pause" | "complete" | "done" | "step"

export interface SignalSetViewEvent<T> extends SignalKeyFrame<T> {}

export type SignalSetViewEventListener<T> = CustomEventListener<SignalSetViewEvent<T>, SignalSetViewEventKey>

export class SignalSetViewEventTarget<T> extends CustomEventTarget<SignalSetViewEvent<T>, SignalSetViewEventKey> {}

export class CircuitSignalSetViewEventTarget extends SignalSetViewEventTarget<ConnectionValue[]> {}