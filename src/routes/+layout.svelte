<script>
  import { browser } from "$app/environment";
  import { CSSOptionMapping, OptionsStorage } from "$lib/storage_types/OptionsStorage";

  /**
   * @type {OptionsStorage | undefined}
   */
  let optionsStorage = undefined
  $: if (browser) optionsStorage = new OptionsStorage()

  $: if (optionsStorage && document) {
    optionsStorage.applyStyles(document.documentElement)
  }
</script>

<slot/>

