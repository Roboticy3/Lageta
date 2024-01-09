<script context="module">
   //@ts-ignore
   import { Gate, GateType, all_gates } from "$lib/circuit_types/Gate";


   /**
    * make an svg for a gate, the default size is 20x20
    * @param {String} contents
    */
   export const buildSvg = (contents, offsetX=20, offsetY=20, id="") => {
      let idString = ""
      if (id !== "") {
         idString = `id=${id}`
      }
      return (
`
<svg 
   ${idString}
   width="100%"
   viewBox="0 0 ${offsetX} ${offsetY}"
   stroke="black" stroke-width=".5pt" fill="none"
   xmlns="http://www.w3.org/2000/svg">
   ${contents}
</svg>
`)
   }

   /**
     * @param {number} offsetX
     * @param {number} offsetY
     */
   export function ConnectionSvg(offsetX=1, offsetY=1, color="") {
      let result = `<path d="M ${offsetX - 4} ${offsetY - 4} l 8 4 l -8 4 Z" stroke-width=".25pt"`
      if (color !== "") {
         result += `fill="${color}" stroke="none" />\n`
      }
      else {
         result += " />\n"
      }

      return result
   }

   export const _svgs = new Map([
      ['testgate', ConnectionSvg()],
      ['Buf', `<path d="M 2 2 L 18 10 L 2 18 Z"/>\n`],
      ['Not', `<path d="M 1 3 L 15 10 L 1 17 Z"/><circle cx="17" cy="10" r="2" />\n`],
      ['And', `<path d="M 2 2 L 10 2 C 20 2 20 18 10 18 L 2 18 Z"/>\n`],
      ['Or', `<path d="M 10 2 C 20 2 20 18 10 18 L 2 18 C 5 18 5 2 2 2 Z"/>\n`]
   ])

   /**
    * 
    * @param {Gate} gate
    * @returns {String}
    */
   export const getGateSvgContents = (gate) => {
      const gType = gate.type
      return getGateTypeSvgContents(gType)
   }

   /**
    * @param {GateType} gType
    */
   export const getGateTypeSvgContents = (gType) => {
      let result = _svgs.get(gType.name)
      if (result !== undefined) {
         return result
      }
      result = defaultSvg((gType?.gridWidth || 2) * 10, (gType?.gridHeight || 2) * 10, 4, gType.name);
      return result
   } 

   function defaultSvg(width=2, height=2, font=4, name="Buf") {
      return `<text x="${font}" y="${height / 2 + font / 2}" stroke="transparent" fill="black" style="font: ${font}px sans-serif;">${name}</text>`
   }

   /**
    * @param {Gate} gate
    */
   export const getGateSvg = (gate) => {
      return buildSvg(getGateSvgContents(gate))
   }

   /**
    * @param {GateType} gType
    */
   export const getGateTypeSvg = (gType) => {
      return buildSvg(getGateTypeSvgContents(gType))
   }

   /**
    * 
    * @param {[number, number]} fromOffset
    * @param {[number, number]} toOffset
    */
   export function wireSvg(fromOffset, toOffset) {
        let result = 
`
<path d="M ${fromOffset[0]} ${fromOffset[1]} L ${toOffset[0]} ${toOffset[1]}" />
`
        return result
    }

</script>
