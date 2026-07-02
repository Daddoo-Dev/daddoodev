<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import About from '$lib/components/About.svelte';
  import Projects from '$lib/components/Projects.svelte';
  import Contact from '$lib/components/Contact.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SEO from '$lib/components/SEO.svelte';
  import Analytics from '$lib/components/Analytics.svelte';
</script>

<Analytics />

<SEO 
  title="Daddoo Dev | Software Developer & Creator of Developer Tools"
  description="Professional software developer creating intelligent developer tools, VS Code extensions, and applications. Specializing in Flutter, web development, and productivity tools."
  url="https://daddoodev.pro"
  keywords="software developer, developer tools, VS Code extensions, Cursor, Flutter apps, web development, Zivora, NotchList, Conclavium, AddASaint, SecretKeeper, Sentry"
/>

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
