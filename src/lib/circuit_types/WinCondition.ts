import type { ConnectionValue } from "./GateType"

export interface WinCondition {
    getCondition(): ConnectionValue[]
    addListener(listener:(cond:ConnectionValue[]) => any): boolean
    removeListener(listener:(cond:ConnectionValue[]) => any): boolean
    dispatch(cond:ConnectionValue[]): void
}