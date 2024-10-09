import { StickerType } from "../../circuit_types/sticker/Sticker"

export const TruthTableTool = {
    name:"TruthTable",
    data:{}
}

export const CowSticker = new StickerType(
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