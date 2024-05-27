import { randomInt } from "crypto";

export interface GameViewIDSpace {
    idString(componentName:string): string;
}

/**
 * GameView id names are too generic, so I made an ID standard for them that prefixes the ids with a large random number
 */
export class GameViewIDStandard implements GameViewIDSpace {
    static prefix:number = 0
    private readonly thisPrefix:number

    constructor() {
        this.thisPrefix = randomInt(8999999999) + 1000000000
        GameViewIDStandard.prefix = this.thisPrefix
    }
    
    idString(componentName: string): string {
        return GameViewIDStandard.idStringWithPrefix(this.thisPrefix, componentName)
    }

    static idStringFromLastSpace(componentName:string): string {
        return GameViewIDStandard.idStringWithPrefix(GameViewIDStandard.prefix, componentName)
    }

    private static idStringWithPrefix(prefix:number, componentName:string): string {
        return `${prefix}-${componentName}`
    }
}