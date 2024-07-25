
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
}

export const TruthTableTool = {
    name:"TruthTable",
}

export const StickersTool = {
    name:"Stickers",
    stickers: [
        new Sticker(
            "Cow",
            "https://purepng.com/public/uploads/large/purepng.com-cowmeatcowanimalgodmilkbuffalo-981524635397i1xu4.png" //royalty free cow
        ),
    ]
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
    name:string
}