<script lang="ts">
  import SectionNav from './SectionNav.svelte';
</script>

<section class="hero" id="home">
  <div class="hero-content">
    <h1 class="hero-title">Hi, I'm <span class="highlight">Shawn McPeek</span></h1>
    <p class="hero-subtitle">Cross-platform Developer & Software Engineer</p>
    <p class="hero-description">
      I create modern web and mobile applications with a focus on user experience and clean code.
    </p>
    <div class="hero-cta">
      <a href="#projects" class="primary-button">View My Work</a>
      <a href="#contact" class="secondary-button">Get in Touch</a>
    </div>
  </div>
  <SectionNav nextSection="about" hideTop={true} />
</section> 