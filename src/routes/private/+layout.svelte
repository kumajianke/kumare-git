<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

    onMount(()=>{
        let local_token = localStorage.getItem("msyt-token");
        if (!local_token){
            goto("/")
        }
    })
</script>

<slot />

