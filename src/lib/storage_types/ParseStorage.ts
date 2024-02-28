export function parseStorage<T extends {}>(
    storage:Storage | undefined,
    key:string,
    generator:() => T
) {
    if (storage === undefined) {
        return generator()
    }

    let result:unknown
    const string = storage.getItem(key)
    try {
        result = JSON.parse(string || "")
        return Object.assign(generator(), result)
    } catch(e) {
        console.log("failed to load", key, ", creating new one")
        return generator()
    }
}