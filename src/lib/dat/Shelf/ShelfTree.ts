import { CowSticker } from "../Tools/Tools"
import { StickerType } from "../../circuit_types/sticker/Sticker"

//to represent GateTypes and folders recursively, gates are represented as strings, and folders as ShelfTreeNode
export class ShelfTreeNode {
    name:string
    children:(string | ShelfTreeNode)[]
    minNodeCapacity:number

    constructor(
        name:string,
        children:(string | ShelfTreeNode)[],
        minNodeCapacity:number = 4
    ) { 
        this.name = name
        this.children = children
        this.minNodeCapacity = minNodeCapacity
    }
}

export const GameViewShelfTree = new ShelfTreeNode(
    "Shelf",
    [
        "Buf", "Not", 
        new ShelfTreeNode(
            "2-Input",
            [
                "And", "Or", "Nand", "Nor", "Xor", "Xand"
            ]
        ),
        new ShelfTreeNode(
            "3-Input",
            [
                "3-Input Or","3-Input And","FullAdder"
            ]
        ),
        new ShelfTreeNode(
            "Nibbles",
            [
                "4-Input Or","4-Input And","4-2 Encoder","Binary Coded Decimal to 7-Segment Decoder"
            ]
        ),
        new ShelfTreeNode(
            "Arithmetic",
            [
                "4-2 Encoder", "2-4 Decoder", "HalfAdder", "FullAdder"
            ]
        ),
        new ShelfTreeNode(
            "Displays",
            [
                "7-Segment Display"
            ]
        ),
        new ShelfTreeNode(
            "Bigger",
            [
                "3-Input Or","3-Input And","4-Input Or","4-Input And",
            ]
        )
    ]
)

export function filterShelfTreeWithUnlocks(unlocks:Iterable<string>, tree:ShelfTreeNode) {

    const initialUnlocks = new Map<string, boolean>()
    for (const u of unlocks) initialUnlocks.set(u, false)
    console.log("filtering tree ", tree, " with unlocks ", unlocks)
    const result = filterShelfTreeWithUnlocksStep(initialUnlocks, tree, 1)
    console.log("finished filtering tree ", result)
    if (result) return result

    //if the final recursion returns undefined, simply convert the unlocks into a one-layer "tree"
    return new ShelfTreeNode(
        tree.name, Array.from(unlocks)
    )
}

function filterShelfTreeWithUnlocksStep(unlocks:Map<string, boolean>, tree:ShelfTreeNode, depth:number) {

    //iterate through this layer of the tree
    let children = Array.from(tree.children)
    const marks = new Array(children.length).fill(false)
    for (let i = 0; i < children.length; i++) {
        const item = children[i]
        //if a gate is there, check if it's unlocked
        if (typeof item === "string") {
            if (unlocks.has(item)) {
                //if so, mark the gate
                marks[i] = true
            }
        }
        //if another node is there, search it recursively
        else {
            const result = filterShelfTreeWithUnlocksStep(unlocks, item, depth + 1)
            //if the recursion returns undefined, this child will not be marked and removed later
            if (result) {
                children[i] = result
                marks[i] = true
            }
        }
    }

    //remove the unmarked gates from this node
    children = children.filter((_v, i) => marks[i])

    console.log("attempting to trim tree into ", new ShelfTreeNode(
        tree.name,
        children
    ))

    //if the minimum capacity of this node is not satisfied, return undefined to indicate that this node should be removed
    if (children.length < tree.minNodeCapacity && depth > 1) {
        return undefined
    }

    //only if the last check passes are children marked as explored unlocks
    for (const item of children) {
        if (typeof item === "string") unlocks.set(item, true)
    }

    //if this is the last recursion, add all the gates that haven't been explored yet to the top level
    if (depth === 1) for (const [k, v] of unlocks) {
        console.log("untrimming tree item ", k)
        if (!v) children.push(k)
    }

    const newTree = new ShelfTreeNode(
        tree.name,
        children
    )

    console.log("trimmed tree into ", newTree)

    return newTree
}
