import { StickerType } from "../../circuit_types/sticker/Sticker"

export const TruthTableTool = {
    name:"TruthTable",
    data:{}
}

export const CowSticker = new StickerType(
    "Cow",
    "https://purepng.com/public/uploads/large/purepng.com-cowmeatcowanimalgodmilkbuffalo-981524635397i1xu4.png" //royalty free cow
)

export const FrogSticker = new StickerType(
    "Frog",
    "https://cdn.pixabay.com/photo/2016/05/25/17/53/frog-1415516_1280.png", 
    {license: "Pixabay"}
)

export const BoredomSticker = new StickerType(
    "Boredom",
    "https://media1.tenor.com/m/G7VbtYRypMkAAAAd/filosofia.gif",
    {license: "Tenor"}
)

export const StickersTool = {
    name:"Stickers",
    data:{
        stickers: [
            CowSticker,
            FrogSticker,
            BoredomSticker
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