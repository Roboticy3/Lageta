<script>
  import { CSSOptionMapping, OptionsStorage } from "$lib/storage_types/OptionsStorage";

  /**
   * @type {OptionsStorage | undefined}
   */
  export let optionsStorage
  /**
   * @type {string}
   */
  export let colorOptionKey

  let colorDefault = true
  let colorView = '#ffffff'
  $: if (colorDefault && optionsStorage) {
    colorView = optionsStorage.getColor(colorOptionKey) || "#ffffff"
    colorDefault = false
  }

  
  
</script>

<div class="color-picker" style="color:var({CSSOptionMapping.find((o) => o.k === colorOptionKey)?.v});">
  <label for="{colorOptionKey}-color-selector" >
    <slot />
  </label>
  <input type="color" id="{colorOptionKey}-color-selector"
    bind:value={colorView}
    on:change={(ev) => {
      optionsStorage?.setColor(colorOptionKey, colorView)
      optionsStorage?.applyStyles(document.documentElement)
    }}
  >
</div>

<style>
  .color-picker {
    display:flex; flex-direction:column; align-items:center; text-align:center;
  }
</style>