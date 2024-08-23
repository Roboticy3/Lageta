<script>
    import MainMenu from "$lib/components/MainMenu/MainMenu.svelte";
    import MainMenuOption from "$lib/components/MainMenu/MainMenuOption.svelte";
import { CowSticker } from "$lib/dat/Tools/Tools";
    import StickerViewer from "../CircuitEditor/Sticker/StickerViewer.svelte";

</script>
<div>You've unlocked Stickers!</div>
<div>Label parts of your circuit with images from the internet!</div>
<div>Future levels will have a Stickers folder on the top shelf, where you can select and place stickers on your circuit. Use them to label larger circuits and stay organized.</div>
<div>Import and share your stickers from the new
    <div style="display:inline-block"><MainMenuOption path={'stickers'} spriteMode="Sticker" >Stickers</MainMenuOption></div>
    option in the main menu.
</div>