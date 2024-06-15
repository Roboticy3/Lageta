
export class WireRenderer {
    private intersectLineRect(a:[number, number], b:[number, number], ra:[number, number], rb:[number, number]) {

    }

    drawWire(a:[number, number], b:[number, number], minStride:number, svgHead:SVGElement) {
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
        const pathPartA = shouldSnakeFrom ? 
            `M ${ax} ${ay} L ${minStrideAX} ${ay} L ${minStrideAX} ${hy} L ${hx} ${hy}`:
            `M ${ax} ${ay} L ${hx} ${ay}`
        const pathPartB = shouldSnakeTo ?
            `L ${minStrideBX} ${hy} L ${minStrideBX} ${by} L ${bx} ${by}`:
            `L ${hx} ${by} L ${bx} ${by}`
        return `<path d="${pathPartA} ${pathPartB}" style="pointer-events:none;"/>`
    }
}