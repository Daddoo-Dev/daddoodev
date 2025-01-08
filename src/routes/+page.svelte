<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import About from '$lib/components/About.svelte';
  import Projects from '$lib/components/Projects.svelte';
  import Contact from '$lib/components/Contact.svelte';
  import '$lib/styles/global.css';
</script>

<Header />

<main>
  <Hero />
  <About />
  <Projects />
  <Contact />
</main>
