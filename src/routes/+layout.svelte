<script>
  import { browser } from "$app/environment";
    import { beforeNavigate } from "$app/navigation";
  import { CSSOptionMapping, OptionsStorage } from "$lib/storage_types/OptionsStorage";

  /**
   * @type {OptionsStorage | undefined}
   */
  let optionsStorage = undefined
  $: if (browser) optionsStorage = new OptionsStorage()

  $: if (optionsStorage && document) {
    optionsStorage.applyStyles(document.documentElement)
  }

  $: if (browser) window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      location.reload();
    }
  });
</script>

<slot/>

