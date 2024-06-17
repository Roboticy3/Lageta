import { CircuitController } from "$lib/circuit_types/CircuitController"

export class WireRenderer {
    private intersectLineRect(a:[number, number], b:[number, number], ra:[number, number], rb:[number, number]) {

    }

    //i desparately need a vector library
    private projectPointOntoLine(p:[number, number], u:[number, number], v:[number, number]) {
        const uv = [v[0] - u[0], v[1] - u[1]]
        const up = [p[0] - u[0], p[1] - u[1]]
        const upDotUv = up[0] * uv[0] + up[1] * uv[1]
        const uvDotUv = uv[0] * uv[0] + uv[1] * uv[1]
        const uvL = Math.sqrt(uvDotUv)
        const scalarProject = upDotUv / uvDotUv
        if (scalarProject >= 0.01 && scalarProject <= 0.99) 
            return [scalarProject * uv[0], scalarProject * uv[1]]
    }

    private tryCollidePointOnLine(
        p:[number, number], u:[number, number], v:[number, number], 
        minStride:number) : [number, number][] | undefined
    {
        const project = this.projectPointOntoLine(p, u, v)
        if (!project) return undefined
        const pAligned:[number, number]= [u[0] + project[0], u[1] + project[1]]
        const reject:[number, number] = [p[0] - pAligned[0], p[1] -  pAligned[1]]
        const distance = Math.sqrt(reject[0] * reject[0] + reject[1] * reject[1])
        if (distance < minStride) {
            return [pAligned, reject]
        }
    }

    private cutLineBeforeConnectionPoint(
        u:[number, number], v:[number, number],
        circuitController:CircuitController, minStride:number
    ): [number, number][] | undefined {
        const uv:[number, number] = [v[0] - u[0], v[1] - u[1]]
        const uvDotUv = uv[0] * uv[0] + uv[1] * uv[1]
        const uvL = Math.sqrt(uvDotUv)
        const uvN:[number, number] = [uv[0] / uvL, uv[1] / uvL]
        //check if there's a collision with a gate
        const {cType, gPos} = circuitController.castLineOnGrid(u[0], u[1], uv[0], uv[1])

        //if not, return
        if (!cType || !gPos) return undefined


        //check for a "collision" against all the connection points under the gate
        //a point is considered colliding if it's closer than minStride to the line formed by uv from u
        //if a collision is found at a point, move back by minStride from the collision point and have the next point be there
        const gOffset = circuitController.indexToLocalOffset(gPos[0], gPos[1])
        for (let o of cType.view.inputOffsets) {
            const p:[number, number] = [o[0] + gOffset[0], o[1] + gOffset[1]]
            const result = this.tryCollidePointOnLine(p, u, v, minStride)
            if (result) {
                const pAligned = result[0]
                return [[pAligned[0] - uvN[0] * minStride, pAligned[1] - uvN[1] * minStride], result[0], result[1]]
            }
        }
        for (let o of cType.view.outputOffsets) {
            const p:[number, number] = [o[0] + gOffset[0], o[1] + gOffset[1]]
            const result = this.tryCollidePointOnLine(p, u, v, minStride)
            if (result) {
                const pAligned = result[0]
                return [[pAligned[0] - uvN[0] * minStride, pAligned[1] - uvN[1] * minStride], result[0], result[1]]
            }
        }
    }

    /**
     * Check if there's a collision with a connection point on the path from u to v,
     * if so, avoid the collision and complete the path to w
     * @returns 
     */
    private processPointTriple(
        u:[number, number], v:[number, number], w:[number, number], 
        circuitController:CircuitController, minStride:number
    ): [number, number][] 
    {
        
        let newPoints = new Array<[number, number]>(5)

        const result = this.cutLineBeforeConnectionPoint(
            u, v, circuitController, minStride
        )
        //if the next point was not set by the previous checks, there was no collision inside the gate, return
        if (result === undefined) {
            return [u, v, w]
        }
        const cut = result[0]

        newPoints[0] = u
        newPoints[1] = cut

        //place the next point along vw from newPoints[1], and connect it back up to w
        const vw:[number, number] = [w[0] - v[0], w[1] - v[1]]
        const vwL = Math.sqrt(vw[0] * vw[0] + vw[1] * vw[1])
        const vwN = [vw[0] / vwL, vw[1] / vwL]
        newPoints[2] = [newPoints[1][0] + vwN[0] * minStride, newPoints[1][1] + vwN[1] * minStride]
        newPoints[3] = [v[0] + vwN[0] * minStride, v[1] + vwN[1] * minStride]
        newPoints[4] = w

        return newPoints
    }

    private processPointDouble(
        u:[number, number], v:[number, number],
        circuitController:CircuitController, minStride:number
    ) {
        let newPoints = new Array<[number, number]>(6)

        const result = this.cutLineBeforeConnectionPoint(
            u, v, circuitController, minStride
        )
        if (result === undefined) {
            return [u, v]
        }
        const cut = result[0]
        const reject = result[2]

        newPoints[0] = u
        newPoints[1] = cut

        //get the normalized vector from u to v
        const uv:[number, number] = [v[0] - u[0], v[1] - u[1]]
        const uvDotUv = uv[0] * uv[0] + uv[1] * uv[1]
        const uvL = Math.sqrt(uvDotUv)
        const uvN:[number, number] = [uv[0] / uvL, uv[1] / uvL]

        //get a perpendicular vector
        const perpUv:[number, number] = [uv[1], -uv[0]]
        const perpUvL = Math.sqrt(perpUv[0] * perpUv[0] + perpUv[1] * perpUv[1])
        let perpUvN = [perpUv[0] / perpUvL, perpUv[1] / perpUvL]

        //flip the perpendicular vector if its not pointing towards the connection point
        const perpUvDotReject = reject[0] * perpUv[0] + reject[1] * perpUv[1]
        if (perpUvDotReject >= 0) perpUvN = [-perpUvN[0], -perpUvN[1]]

        newPoints[2] = [newPoints[1][0] + perpUvN[0] * minStride, newPoints[1][1] + perpUvN[1] * minStride]
        newPoints[3] = [newPoints[2][0] + uvN[0] * 2 * minStride, newPoints[2][1] + uvN[1] * 2 * minStride]
        newPoints[4] = [newPoints[3][0] - perpUvN[0] * minStride, newPoints[3][1] - perpUvN[1] * minStride]
        newPoints[5] = v

        return newPoints
    }

    static readonly passes:(2 | 3)[] = [3, 2]

    private processWirePointsSinglePass(
        points:[number, number][], circuitController:CircuitController,
        minStride:number, pass:number
    ) {
        const passType = WireRenderer.passes[pass]
        if (points.length < passType) return points

        const newPoints:[number, number][] = []

        let i = 0

        switch (passType) {
            case 3: 
                while (i < points.length - 2) {
                    const processedPoints = this.processPointTriple(
                        points[i], points[i + 1], points[i + 2],
                        circuitController, minStride
                    )
        
                    newPoints.push(...processedPoints)
                    i += 3
                } 
                break
            case 2: 
                while (i < points.length - 1) {
                    const processedPoints = this.processPointDouble(
                        points[i], points[i + 1],
                        circuitController, minStride
                    )
        
                    newPoints.push(...processedPoints)
                    i += 2
                } 
                break
        }
        
        while (i < points.length) {
            newPoints.push(points[i])
            i++
        }

        return newPoints
    }

    private processWirePoints(
        points:[number, number][], circuitController:CircuitController,
        minStride:number
    ): [number, number][] {

        let newPoints = points

        for (let i = 0; i < WireRenderer.passes.length; i++) {
            newPoints = this.processWirePointsSinglePass(
                newPoints, circuitController, minStride, i
            )
        }

        return newPoints
    }

    pointsToSvgPath(points:[number, number][], extraParams=""): string {
        const p0 = points[0]
        let path = `<path d="M ${p0[0]} ${p0[1]}`
        for (let i = 1; i < points.length; i++) {
            const p = points[i]
            if (p) path += ` L ${p[0]} ${p[1]}`
        }
        path += `" ${extraParams} style="pointer-events:none;" />`
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

        const minStrideAX = ax + minStride
        const minStrideBX = bx - minStride
        const points:[number, number][] = shouldSnakeFrom ? 
            [
                [ax, ay], [minStrideAX, ay], [minStrideAX, hy], 
                [minStrideBX, hy], [minStrideBX, by], [bx, by]
            ] 
            :
            [[ax, ay], [hx, ay], [hx, by], [bx, by]]

        return this.pointsToSvgPath(this.processWirePoints(points, circuitController, minStride))
    }
}