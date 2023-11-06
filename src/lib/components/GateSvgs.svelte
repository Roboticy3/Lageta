<script context="module">

   /**
    * make an svg for a gate, the default size is 20x20
    * @param {String} contents
    */
   export const buildSvg = (contents, offsetX=20, offsetY=20) => {
      return (
`
<svg 
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
   export function ConnectionSvg(offsetX=1, offsetY=1) {
      return `<path d="M ${offsetX + 1} ${offsetY - 1} l 2 1 l -2 1 Z" stroke-width=".25pt"/>\n`
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
    * @param {String} name
    * @returns {String}
    */
   export const getGateSvgContents = (name) => {
      return _svgs.get(name) || "";
   }

   /**
    * @param {String} name
    */
   export const getGateSvg = (name) => {
      return buildSvg(getGateSvgContents(name))
   }

</script>
