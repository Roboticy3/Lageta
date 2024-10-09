export class StickerType {
    readonly name: string;
    readonly url: string;

    constructor(
        name: string,
        url: string
    ) {
        this.name = name;
        this.url = url;
    }

    static fromJSON(json: string) {
        try {
            const ob = JSON.parse(json);
            return StickerType.fromObject(ob);
        }
        catch (e) {
            return undefined;
        }
    }

    static fromObject(ob: any) {
        if (!ob.name || !ob.url) return undefined;
        return new StickerType(ob.name, ob.url);
    }
}

export class Sticker {
    readonly type:StickerType
    readonly id:number

    constructor(
        type:StickerType,
        id:number
    ) {
        this.type = type
        this.id = id
    }
}
