import type { ConnectionIndex } from "./CircuitController"

export interface CircuitRendererIDSpace {

    connectionPointIdString(index:ConnectionIndex): string;

    connectionPointLabelIdString(index:ConnectionIndex): string;

    connectionPointDesiredValueIdString(index:ConnectionIndex): string;
    
    gateIdString(id:number): string;
    
    wireIdString(index:[number, number]): string;

    headIdString(): string;
}

export class CircuitRendererIDStandard implements CircuitRendererIDSpace {
    connectionPointIdString(index:ConnectionIndex) {
        return `point-${index.type.toLowerCase()}-${index.id}-${index.index}`
    }

    connectionPointLabelIdString(index: ConnectionIndex): string {
        return `point-label-${index.type.toLowerCase()}-${index.id}-${index.index}`
    }

    connectionPointDesiredValueIdString(index:ConnectionIndex) {
        return `point-target-${index.type.toLowerCase()}-${index.id}-${index.index}`
    }
    
    gateIdString(id:number) {
        return `gate-${id}`
    }
    
    wireIdString(index:[number, number]) {
        return `wire-${index[0]}-${index[1]}`
    }

    headIdString(): string {
        return 'circuit-svg-head'
    }
}