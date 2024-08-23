
export class Sticker {
    readonly name:string
    readonly url:string

    constructor(
        name:string,
        url:string
    ) {
        this.name = name
        this.url = url
    }

    static fromJSON(json:string) {
        try {
            const ob = JSON.parse(json)
            return Sticker.fromObject(ob)
        }
        catch (e) {
            return undefined
        }   
    }

    static fromObject(ob:any) {
        if (!ob.name || !ob.url) return undefined
        return new Sticker(ob.name, ob.url)
    }
}

export const TruthTableTool = {
    name:"TruthTable",
    data:{}
}

export const CowSticker = new Sticker(
    "Cow",
    "https://purepng.com/public/uploads/large/purepng.com-cowmeatcowanimalgodmilkbuffalo-981524635397i1xu4.png" //royalty free cow
)

export const StickersTool = {
    name:"Stickers",
    data:{
        stickers: [
            CowSticker
        ]
    }
}

//Since tools are mostly handled by other code, they store generic objects
export const all_tools = new Map([
    [TruthTableTool.name, TruthTableTool],
    [StickersTool.name, StickersTool]
])

export function getToolParams(toolName:string): ToolParameters | undefined {
    return all_tools.get(toolName)
}

export type ToolParameters = {
    name:string,
    data:any
}