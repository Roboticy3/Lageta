<script>
  import { browser } from "$app/environment";
  import { OptionsStorage } from "$lib/storage_types/OptionsStorage";
    import { onMount } from "svelte";
  import HeavyButton from "../Misc/HeavyButton.svelte";
    import ColorOption from "./ColorOption.svelte";

  let animationSpeedView = "-1"

  /**
     * @type {OptionsStorage | undefined}
     */
  let optionsStorage = undefined
  $: if (browser) optionsStorage = new OptionsStorage()
  $: if (animationSpeedView === "-1" && optionsStorage) {
    animationSpeedView = `${optionsStorage.getAnimationSpeed()}` || "3"
  }

  let secondaryBgDefault = true
  let secondaryBgColorView = "#ffffff"
  $: if (secondaryBgDefault && optionsStorage) {
    secondaryBgColorView = optionsStorage.getColor("mainBgColor") || "#ffffff"
    secondaryBgDefault = false
  }

  let tertiaryBgDefault = true
  let tertiaryBgColorView = "#ffffff"
  $: if (tertiaryBgDefault && optionsStorage) {
    tertiaryBgColorView = optionsStorage.getColor("mainBgColor") || "#ffffff"
    tertiaryBgDefault = false
  }

  

  let shouldFlash = false

</script>
<div class="options {optionsStorage ? '':'unavailable'}" style="max-width:min-content;">
  <label class="{shouldFlash ? 'flash':''}" for="animation-speed-slider">
    Animation Speed: 
    {Number(animationSpeedView) || "disabled"}
  </label>
  <input type="range" id="animation-speed-slider" min=0 max=10 
    bind:value={animationSpeedView} 
    on:change={(ev) => {
      optionsStorage?.setAnimationSpeed(Number(animationSpeedView))
      optionsStorage?.applyStyles(document.documentElement)
      shouldFlash = false
      setInterval(() => {
        shouldFlash = true
      }, 100)
    }}
  />
  <!-- Main and Background Colors -->
  <div style="display: flex; justify-content: space-between; width: 100%;">
    <ColorOption colorOptionKey={"mainBgColor"} optionsStorage={optionsStorage}>Main Background</ColorOption>
    <ColorOption colorOptionKey={"secondaryBgColor"} optionsStorage={optionsStorage}>Secondary Background</ColorOption>
    <ColorOption colorOptionKey={"tertiaryBgColor"} optionsStorage={optionsStorage}>Tertiary Background</ColorOption>
  </div>

  <!-- Gate and Text Colors -->
  <div style="display: flex; justify-content: center; width: 100%;">
    <ColorOption colorOptionKey={"gateColor"} optionsStorage={optionsStorage}>Gate Color</ColorOption>
  </div>

  <!-- Connection Colors -->
  <div style="display: flex; justify-content: space-between; width: 100%;">
    <ColorOption colorOptionKey={"connectionColorOff"} optionsStorage={optionsStorage}>Connection Off</ColorOption>
    <ColorOption colorOptionKey={"connectionColorOn"} optionsStorage={optionsStorage}>Connection On</ColorOption>
    <ColorOption colorOptionKey={"connectionColorX"} optionsStorage={optionsStorage}>Connection X</ColorOption>
  </div>

  <!-- Circuit and Verification Colors -->
  <div style="display: flex; justify-content: center; width: 100%;">
    <ColorOption colorOptionKey={"circuitColor"} optionsStorage={optionsStorage}>Circuit Color</ColorOption>
    <ColorOption colorOptionKey={"verificationColor"} optionsStorage={optionsStorage}>Verification Color</ColorOption>
  </div>

  <!-- Failure Color -->
  <div style="display: flex; justify-content: center; width: 100%;">
    <ColorOption colorOptionKey={"failureColor"} optionsStorage={optionsStorage}>Failure Color</ColorOption>
  </div>
</div>

