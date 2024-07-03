
//to represent GateTypes and folders recursively, gates are represented as strings, and folders as ShelfTreeNode
export class ShelfTreeNode {
    name:string
    children:(string | ShelfTreeNode)[]

    constructor(
        name:string,
        children:(string | ShelfTreeNode)[]
    ) { 
        this.name = name
        this.children = children
    }
}

export const GameViewShelfTree = new ShelfTreeNode(
    "Shelf",
    [
        {
            name:"Simple Gates",
            children:[
                "Buf", "Not", "And", "Or", "Nand", "Nor", "Xor", "Xand"
            ]
        },
        {
            name:"Large Simple Gates",
            children:[
                "3-Input Or","3-Input And"
            ]
        },
        {
            name:"Arithmetic",
            children:[
                "4-2 Encoder", "2-4 Decoder", "HalfAdder", "FullAdder"
            ]
        }
    ]
)

export function filterShelfTreeWithUnlocks(unlocks:Set<string>, tree:ShelfTreeNode, depth=1) {

    console.log("trimming tree ", tree, " with unlocks ", unlocks)

    //iterate through this layer of the tree
    let children = Array.from(tree.children)
    const marks = new Array(children.length).fill(false)
    for (let i = 0; i < children.length; i++) {
        const item = children[i]
        //if a gate is there, check if it's unlocked
        if (typeof item === "string") {
            if (unlocks.has(item)) {
                //if so, mark the gate and remove the unlock
                marks[i] = true
                unlocks.delete(item)
            }
        }
        //if another node is there, search it recursively
        else if (typeof item !== "string") {
            children[i] = filterShelfTreeWithUnlocks(unlocks, item, depth + 1)
            marks[i] = true
        }
    }

    //remove the marked gates from this node
    children = children.filter((_v, i) => marks[i])
    if (depth === 1) {
        children.push(...unlocks.values())
    }
    const newTree = new ShelfTreeNode(
        tree.name,
        children
    )

    console.log("trimmed tree into ", newTree)

    return newTree
}

