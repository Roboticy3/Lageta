<!-- simulator containing all the basic elements needed to build, save, and load logical circuits -->

<script>

    /**
     * @type {import("$lib/level_types/GameViewParameters").GameViewParameters}
     */
    export let params

    console.log("initializing GameView with params: ",params)

</script>

<div class="base-vertical">
    <div class="nav">

    </div>
    <div class="sandbox-horizontal">
        <div class="circuit-editor">
            <div class="shelf">

            </div>
            <div class="circuit-viewer">

            </div>
        </div>
        <div class="instructions">

        </div>
    </div>
    <div class="signal">

    </div>
</div>

<!-- The layout of GameView is centered around this vertical layout -->
<!-- The vertical layout is 10 units long, represented by the total flex-grow values of it's children -->

<!-- The sandbox is a horizontal layout, a circuit editor on the left with an instruction panel on the right -->
<!-- The horizontal layout is 10 units long in the same way as the vertical layout -->

<!-- Finally, the circuit editor is also a layout for the shelf and the actual circuit view-->

<!-- This design is based off of the Figma diagrams -->
<style>
    
    .base-vertical {
        display:flex;
        flex-direction: column;
        height:100%;
    }

    .base-vertical .nav {
        flex-grow: 1;
        background-color: var(--secondary-bg-color);
    }

    .base-vertical .sandbox-horizontal {
        flex-grow: 6.5;
        background-color: var(--main-bg-color);

        display:flex;
        flex-direction: row;
    }

    .sandbox-horizontal .circuit-editor {
        flex-grow: 7;

        display: flex;
        flex-direction: column;
    }

    .circuit-editor .shelf {
        flex-grow: 2;
    }

    .circuit-editor .circuit-viewer {
        flex-grow: 8;
        background-color: var(--tertiary-bg-color);
    }

    .sandbox-horizontal .instructions {
        flex-grow: 3;
        background-color: var(--tertiary-bg-color);
    }

    .base-vertical .signal {
        flex-grow: 2.5;
        background-color: var(--secondary-bg-color);
    }
</style>