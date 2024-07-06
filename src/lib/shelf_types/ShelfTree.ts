
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
        "Buf", "Not", 
        {
            name:"2-Input",
            children:[
                "And", "Or", "Nand", "Nor", "Xor", "Xand"
            ]
        },
        {
            name:"3-Input",
            children:[
                "3-Input Or","3-Input And","FullAdder"
            ]
        },
        {
            name:"Nibbles",
            children:[
                "4-Input Or","4-Input And","4-2 Encoder","Binary Coded Decimal to 7-Segment Decoder"
            ]
        },
        {
            name:"Arithmetic",
            children:[
                "4-2 Encoder", "2-4 Decoder", "HalfAdder", "FullAdder"
            ]
        },
        {
            name:"Displays",
            children:[
                "7-Segment Display"
            ]
        }
    ]
)

export function filterShelfTreeWithUnlocks(unlocks:string[], tree:ShelfTreeNode) {

    const initialUnlocks = new Map(unlocks.map((v) => [v, false]))
    const result = filterShelfTreeWithUnlocksStep(initialUnlocks, tree, 1)
    if (result) return result

    //if the final recursion returns undefined, simply convert the unlocks into a one-layer "tree"
    return new ShelfTreeNode(
        tree.name, unlocks
    )
}

export function filterShelfTreeWithUnlocksStep(unlocks:Map<string, boolean>, tree:ShelfTreeNode, depth:number, minNodeCapacity=4) {

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
            }
        }
        //if another node is there, search it recursively
        else if (typeof item !== "string") {
            const result = filterShelfTreeWithUnlocksStep(unlocks, item, depth + 1, minNodeCapacity)
            //if the recursion returns undefined, this child will not be marked and removed later
            if (result) {
                children[i] = result
                marks[i] = true
            }
        }
    }

    //remove the unmarked gates from this node
    children = children.filter((_v, i) => marks[i])

    //if the minimum capacity of this node is not satisfied, return undefined to indicate that this node should be removed
    if (children.length < minNodeCapacity) {
        return undefined
    }

    //only if the last check passes are children marked as explored unlocks
    for (const item of children) {
        if (typeof item === "string") unlocks.set(item, true)
    }

    //if this is the last recursion, add all the gates that haven't been explored yet to the top level
    if (depth === 1) for (const [k, v] of unlocks) {
        if (!v) children.push(k)
    }

    const newTree = new ShelfTreeNode(
        tree.name,
        children
    )

    console.log("trimmed tree into ", newTree)

    return newTree
}
