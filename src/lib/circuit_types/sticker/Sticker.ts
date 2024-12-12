export class StickerType {
    readonly name: string;
    readonly url: string;
    readonly options: any;

    constructor(
        name: string,
        url: string,
        options?: any
    ) {
        this.name = name;
        this.url = url;
        this.options = options
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
        return new StickerType(ob.name, ob.url, ob.options);
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
