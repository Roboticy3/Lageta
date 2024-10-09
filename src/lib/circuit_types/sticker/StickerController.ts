import { SerializableSticker } from "$lib/storage_types/StickerStorage";

/**
 * Stickers are pretty good at managin themselves, we just lose track of them!
 * 
 * Controller allows for some interface with the stickers, including collecting them for serialization
 */
export class StickerController {

  private readonly psuedoGrid:(SerializableSticker | undefined)[]
  
  constructor(
    stickerRegistry:SerializableSticker[] = [],
  ) {
    this.psuedoGrid = stickerRegistry
  }

  /**
   * Remove a sticker from the serialization by its id. JS will 100% roll with the punches if you pass an id out of bounds, so be careful
   * @param id 
   */
  removeSticker(id:number) {
    this.psuedoGrid[id] = undefined //"readonly" mfs when your whole language is implemented as an associative map:
  }

  /**
   * Add a sticker to the serialization, return its serialization id
   * @param s 
   * @returns 
   */
  registerSticker(s:SerializableSticker): number {
    this.psuedoGrid.push(s)
    return this.psuedoGrid.length - 1 //hmm yes id space
  }

  forEach(
    callbackfn:(
      value: SerializableSticker | undefined, 
      index: number
      //no array access in callbackfn bc psuedogrid is private
    ) => void, 
    thisArg?: any) {
    return this.psuedoGrid.forEach(callbackfn)
  }

  /**
   * Compress the id space and return the registry
   * @returns 
   */
  getRegistry() {
    return this.psuedoGrid.filter((s) => s) as SerializableSticker[] //trust is a fickle thing
  }
}