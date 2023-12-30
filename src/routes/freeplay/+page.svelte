<!--load the simulator with minimal changes for a sort of freeplay-->

<script>
    import GameView from '$lib/components/GameView/GameView.svelte'
    import { Freeplay } from '$lib/menu_types/Level';

</script>

<GameView params={Freeplay.unpack()}/>