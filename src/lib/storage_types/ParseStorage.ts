export function parseStorage<T extends {}>(
    storage:Storage,
    key:string,
    generator:() => T
) {
    let result:unknown
    try {
        result = JSON.parse(sessionStorage.getItem(key) || "")
        return Object.assign(generator(), result)
    } catch(e) {
        console.log("failed to load", key, ", creating new one")
        return generator()
    }
}