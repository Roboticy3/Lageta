<script context="module">
   //@ts-ignore
   import { Gate, GateType, all_gates } from "$lib/circuit_types/Gate";
    import { TestSignalSet } from "$lib/signal_types/Signal";
    import { SignalSetController } from "$lib/signal_types/SignalSetController";

   /**
    * make an svg for a gate
    * @param {GateType} type
    */
   export const buildSvg = (type, id="") => {
      let idString = ""
      if (id !== "") {
         idString = `id=${id}`
      }

      let width = 10 * type.gridWidth
      let height = 10 * type.gridHeight

      return (
`
<svg 
   ${idString}
   width="100%"
   viewBox="0 0 ${width} ${height}"
   stroke="black" stroke-width=".5pt" fill="none"
   xmlns="http://www.w3.org/2000/svg">
   ${getGateTypeSvgContents(type)}
</svg>
`)
   }

   /**
     * @param {number} offsetX
     * @param {number} offsetY
     */
   export function ConnectionSvg(
      offsetX=1, 
      offsetY=1, 
      pathParams="stroke-width=.25px", 
      label="", 
      textParams=`stroke="none" fill="black" font-size="15px" font-family="system-ui"`
   ) {
      let result = `
<path d="M ${offsetX - 4} ${offsetY - 4} l 8 4 l -8 4 Z" ${pathParams}/>
<text x=${offsetX + 6} y=${offsetY + 6} ${textParams}>${label}</text>`
      return result
   }

   export const _svgs = new Map([
      ['Buf', `<path d="M 2 2 L 18 10 L 2 18 Z"/>\n`],
      ['Not', `<path d="M 1 3 L 15 10 L 1 17 Z"/><circle cx="17" cy="10" r="2" />\n`],
      ['And', `<path d="M 2 2 L 10 2 C 20 2 20 18 10 18 L 2 18 Z"/>\n`],
      ['Or', `<path d="M 10 2 C 20 2 20 18 10 18 L 2 18 C 5 18 5 2 2 2 Z"/>\n`],
      ['Nand', `<path d="M 2 2 L 10 2 C 20 2 20 18 10 18 L 2 18 Z"/>\n<circle cx=18 cy=10 r="2"/>\n`]
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
      return result || defaultSvg((gType?.gridWidth || 2) * 10, (gType?.gridHeight || 2) * 10, 4);
   } 

   function defaultSvg(width=2, height=2, font=4) {
      return `<text x="${font}" y="${height / 2 + font / 2}" stroke="transparent" fill="black" style="font: ${font}px sans-serif;" />`
   }

   /**
    * @param {Gate} gate
    */
   export const getGateSvg = (gate) => {
      return buildSvg(gate.type)
   }

   /**
    * @param {GateType} gType
    */
   export const getGateTypeSvg = (gType) => {
      return buildSvg(gType)
   }

   /**
    * 
    * @param {[number, number]} fromOffset
    * @param {[number, number]} toOffset
    * @param {string} pathParams
    */
   export function wireSvg(fromOffset, toOffset, pathParams="") {
        let result = 
`
<path d="M ${fromOffset[0]} ${fromOffset[1]} L ${toOffset[0]} ${toOffset[1]}" ${pathParams} />
`
        return result
    }

</script>