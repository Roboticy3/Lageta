import { CircuitController } from "./CircuitController"

export type Rect = {
    readonly left:number,
    readonly top:number,
    readonly width:number,
    readonly height:number
}

export function getCircuitDivRect(gridRect:Rect, circuitController:CircuitController): Rect | undefined {
    const transform = circuitController.getMatrix()
    if (!transform) return

    const localStart = circuitController.indexToLocalOffset(gridRect.left, gridRect.top)
    const start = circuitController.projectOffset(
        localStart[0],
        localStart[1]
    )

    const gridEnd = [gridRect.left + gridRect.width, gridRect.top + gridRect.height]
    const localEnd = circuitController.indexToLocalOffset(gridEnd[0], gridEnd[1])

    const end = circuitController.projectOffset(
        localEnd[0],
        localEnd[1]
    )

    return {
        left:start[0],
        top:start[1],
        width:end[0] - start[0],
        height:end[1] - start[1]
    }
}