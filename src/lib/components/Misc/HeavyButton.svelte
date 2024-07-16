
<script>
    /**
     * Button component that packs in all the styling data most Lageta buttons use, as well as sound effects
    */
    import { createEventDispatcher } from "svelte";

    export let style = ""

    export let hoverStyle = ""

    export let unavailable = false

    /**
     * @type {string | null}
     */
    export let id = null

    const dispatch = createEventDispatcher()

    //substitute hover psuedoeclass with javascript since that can't  be accessed from outside of the component
    let hovering = false
    function onMouseEnter() {
        hovering = true
    }
    function onMouseLeave() {
        hovering = false
    }

    /**
     * @type {HTMLButtonElement}
     */
    let button
    /**
     * Access the button wrapped by this component. Please only use for read-only operations.
     */
    export function getButton() {
        return button
    }
    
</script>

<button 
    class="button {unavailable ? 'unavailable':''}" 
    style={style + (hovering ? hoverStyle:'')} 
    bind:this={button}
    on:click={dispatch.bind(dispatch, 'click')} 
    on:mousedown={dispatch.bind(dispatch, 'mousedown')}
    on:mouseenter={() => {
        dispatch.bind(dispatch, 'mouseenter')
        onMouseEnter()
    }}
    on:focusin={() => {
        dispatch.bind(dispatch, 'focusin')
        onMouseEnter()
    }}
    on:mouseleave={() => {
        dispatch.bind(dispatch, 'mouseleave')
        onMouseLeave()
    }}
    on:focusout={() => {
        dispatch.bind(dispatch, 'focusout')
        onMouseLeave()
    }}
    disabled='{unavailable}'
    id={id}
>
    <slot />
</button>

<style>
    button {
		font-family: monospace;

		font-size: medium;
		background-color: var(--main-bg-color);
	}

	button:hover {
		font-size:large;
		background-color: var(--secondary-bg-color);
	}

	.unavailable {
        filter:blur(2px) brightness(50%);
        pointer-events: none;     
    }
</style>