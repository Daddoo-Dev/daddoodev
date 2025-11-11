<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import About from '$lib/components/About.svelte';
  import Projects from '$lib/components/Projects.svelte';
  import Contact from '$lib/components/Contact.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SEO from '$lib/components/SEO.svelte';
  import Analytics from '$lib/components/Analytics.svelte';
  import '$lib/styles/global.css';
</script>

<Analytics />

<SEO 
  title="Daddoo Dev | Software Developer & Creator of Developer Tools"
  description="Professional software developer creating intelligent developer tools, VS Code extensions, and applications. Specializing in Flutter, web development, and productivity tools."
  url="https://dadddodev.pro"
  keywords="software developer, developer tools, VS Code extensions, Flutter apps, web development, ToDoSync, AddASaint"
/>

<Header />

<main>
  <Hero />
  <About />
  <Projects />
  <Contact />
</main>

<Footer />

<!-- St Carlo, Pray for us
 St Joseph, Pray for us
 St Gregory, Pray for us
 St Michael, Pray for us -->