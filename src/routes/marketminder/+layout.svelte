<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import '$lib/styles/global.css';
</script>

<Header />
<main class="container mm-main-shell">
  <slot />
</main>
<Footer />
