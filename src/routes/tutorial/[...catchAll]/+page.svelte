<script>
    import { page } from "$app/stores";

    const pathParams = $page.params.catchAll.split('/')
</script>

<h1>Tutorial loaded from params {pathParams}</h1>