<script>
    import { StickerType } from "$lib/circuit_types/sticker/Sticker";

    /**
     * @type {StickerType}
     */
    export let sticker
</script>

<img style="height:100%; pointer-events:none;" src={sticker.url} alt={sticker.name}>