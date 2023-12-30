export function parseStorage<T extends {}>(
    storage:Storage,
    key:string,
    generator:() => T
) {
    let result:unknown
    const string = storage.getItem(key)
    try {
        result = JSON.parse(string || "")
        return Object.assign(generator(), result)
    } catch(e) {
        console.log(e, string)
        console.log("failed to load", key, ", creating new one")
        return generator()
    }
}