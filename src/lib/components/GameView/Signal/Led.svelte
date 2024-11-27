<script>
  export let color = "#E07F25"

  /**
     * @param {string} from hex color with no transparency
     */
  function getLightGradient(from) {
    return `closest-side, #FFFFFFFF, ${from}88, #00000000`
  }

  let gradient
  $: gradient = getLightGradient(color)

  export let on = false
</script>

<div class="led">
  <svg width=100% height=100% viewBox="0 0 50 50">
    <circle cx=25 cy=25 r=5 fill={color}></circle>
  </svg>
  {#if on}
  <div style="width:100%; height:100%; position:absolute; background:radial-gradient({gradient}); top:0; left:0;"></div>
  {/if}
</div>

<style>
  .led {
    width: 2em;
    height: 2em;
    
    position:relative;
  }
</style>
