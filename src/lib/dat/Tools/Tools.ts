
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

//Since tools are mostly handled by other code, they store generic objects
export const all_tools = new Map([
    ["TruthTable", {}],
    ["Probes", {count:6}],
    ["Stickers", {stickers:[
        new Sticker(
            "Cow",
            "https://purepng.com/public/uploads/large/purepng.com-cowmeatcowanimalgodmilkbuffalo-981524635397i1xu4.png" //royalty free cow
        ),
    ]}]
])

export function getToolParams(toolName:string): Object | undefined {
    return all_tools.get(toolName)
}