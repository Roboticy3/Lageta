<script>
    import MainMenuOptions from "$lib/components/MainMenu/MainMenuOptions.svelte";

</script>
<div class="full">
    <div class="title">
        Lageta
    </div>
    <div class="menu">
        <MainMenuOptions />
    </div>

</div>

<style>

    .full {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .title {
        margin: 5vh;
        font-size: max(15vw, 15vh);
        font-family:monospace;
    }
</style>
