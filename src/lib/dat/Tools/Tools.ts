
//Since tools are mostly handled by other code, they store generic objects
export const all_tools = new Map([
    ["TruthTable", {}],
    ["Probes", {count:6}]
])

export function getToolParams(toolName:string) {
    return all_tools.get(toolName)
}