import { CircuitController } from "$lib/circuit_types/CircuitController"

export class WireRenderer {
    private intersectLineRect(a:[number, number], b:[number, number], ra:[number, number], rb:[number, number]) {

    }

    //i desparately need a vector library
    private pointDistanceToLine(p:[number, number], u:[number, number], uv:[number, number]) {
        const up = [p[0] - u[0], p[1] - u[1]]
        const upDotUv = up[0] * uv[0] + up[1] * uv[1]
        const uvDotUv = uv[0] * uv[0] + uv[1] * uv[1]
        const scalarProject = upDotUv / uvDotUv
        const project = [scalarProject * uv[0], scalarProject * uv[1]]
        const reject = [up[0] - project[0], up[1] - project[1]]
        return Math.sqrt(reject[0] * reject[0] + reject[1] * reject[1])
    }

    /**
     * Check if there's a collision with a connection point on the path from u to v,
     * if so, avoid the collision and complete the path to w
     * @param param0 
     * @param circuitController 
     * @returns 
     */
    private processPointTriple(
        {u, v, w}:{u:[number, number], v:[number, number], w:[number, number]}, 
        circuitController:CircuitController, minStride:number
    ): [number, number][] 
    {
        const uv:[number, number] = [v[0] - u[0], v[1] - u[1]]
        //check if there's a collision with a gate
        const {cType, gPos} = circuitController.castLineOnGrid(u[0], u[1], uv[0], uv[1])

        //if not, return
        if (!cType || !gPos) return [u, v, w]

        let newPoints = new Array<[number, number]>(5)
        newPoints[0] = u

        //check for a "collision" against all the connection points under the gate
        //a point is considered colliding if it's closer than minStride to the line formed by uv from u
        //if a collision is found at a point, move back by minStride from the collision point and have the next point be there
        const gOffset = circuitController.indexToLocalOffset(gPos[0], gPos[1])
        for (let o of cType.view.inputOffsets) {
            const p:[number, number] = [o[0] + gOffset[0], o[1] + gOffset[1]]
            const distance = this.pointDistanceToLine(p, u, uv)
            if (distance < minStride) {
                newPoints[1] = [p[0] - uv[0] * minStride, p[1] - uv[1] * minStride]
                break
            }
        }
        if (!newPoints[1]) for (let o of cType.view.outputOffsets) {
            const p:[number, number] = [o[0] + gOffset[0], o[1] + gOffset[1]]
            const distance = this.pointDistanceToLine(p, u, uv)
            if (distance < minStride) {
                newPoints[1] = [p[0] - uv[0] * minStride, p[1] - uv[1] * minStride]
                break
            }
        }

        //if the next point was not set by the previous checks, there was no collision inside the gate, return
        if (!newPoints[1]) {
            return [u, v, w]
        }

        //place the next point along vw from newPoints[1], and connect it back up to w
        const vw:[number, number] = [w[0] - v[0], w[1] - v[1]]
        newPoints[2] = [newPoints[1][0] + vw[0] * minStride, newPoints[1][1] + vw[1] * minStride]
        newPoints[3] = [v[0] + vw[0] * minStride, v[1] + vw[1] * minStride]
        newPoints[4] = w

        return newPoints
    }

    private processWirePoints(
        points:[number, number][], circuitController:CircuitController,
        minStride:number
    ): [number, number][] {
        if (points.length < 3) return points

        let newPoints:[number, number][] = new Array(Math.ceil(points.length * 1.5))

        let i = 0
        let j = 0
        while (i < points.length - 2) {

            newPoints[j] = points[i]
            newPoints[j + 1] = points[i + 1]
            newPoints[j + 2] = points[i + 2]

            const processedPoints = this.processPointTriple(
                {u:newPoints[j], v:newPoints[j + 1], w:newPoints[j + 2]},
                circuitController, minStride
            )

            if (processedPoints.length === 5) {
                newPoints[j] = processedPoints[0]
                newPoints[j + 1] = processedPoints[1]
                newPoints[j + 2] = processedPoints[2]
                newPoints[j + 3] = processedPoints[3]
                newPoints[j + 4] = processedPoints[4]
                j += 2
            }

            i += 3
            j += 3
        }

        return points
    }

    pointsToSvgPath(points:[number, number][], extraParams=""): string {
        const p0 = points[0]
        let path = `<path d="M ${p0[0]} ${p0[1]}`
        for (let i = 1; i < points.length; i++) {
            const p = points[i]
            if (p) path += ` L ${p[0]} ${p[1]}`
        }
        path += `" ${extraParams} />`
        return path
    }

    drawWire(a:[number, number], b:[number, number], minStride:number, circuitController:CircuitController) {
        const [ax, ay, bx, by] = [a[0], a[1], b[0], b[1]]

        //if the points are too close together, fallback to a simple straight line
        if ((Math.abs(ax - bx) + Math.abs(ay - by)) < 2 * minStride) {
            return `<path d="M ${ax} ${ay} L ${bx} ${by}" style="pointer-events:none;"/>"`
        }
        const [hx, hy] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]

        //if ax is not enough to the left of bx, draw a wire that snakes around
        //otherwise, draw a wire that's horizontal at a and b, but vertical in between
        const shouldSnakeFrom = (hx - ax) < minStride
        const shouldSnakeTo = (bx - hx) < minStride

        const minStrideAX = ax + minStride
        const minStrideBX = bx - minStride
        const points:[number, number][] = shouldSnakeFrom ? 
            [
                [ax, ay], [minStrideAX, ay], [minStrideAX, hy], [hx, hy], 
                [minStrideBX, hy], [minStrideBX, by], [bx, by]
            ] 
            :
            [[ax, ay], [hx, ay], [hx, by], [bx, by]]

        return this.pointsToSvgPath(this.processWirePoints(points, circuitController, minStride))
    }
}