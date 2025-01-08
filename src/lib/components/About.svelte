<script lang="ts">
  import SectionNav from './SectionNav.svelte';

  function getYearsOfExperience(): number {
    const startDate = new Date('2023-01-01');
    const today = new Date();
    const yearsDiff = today.getFullYear() - startDate.getFullYear();
    
    // Adjust for partial years
    const monthsDiff = today.getMonth() - startDate.getMonth();
    const daysDiff = today.getDate() - startDate.getDate();
    
    if (monthsDiff < 0 || (monthsDiff === 0 && daysDiff < 0)) {
      return yearsDiff - 1;
    }
    
    return yearsDiff;
  }

  const yearsOfExperience = getYearsOfExperience();
</script>

<section class="about" id="about">
  <div class="container">
    <h2 class="section-title">About Me</h2>
    <div class="about-content">
      <div class="about-text">
        <p class="hero-description">
          I develop cross-platform solutions that work seamlessly across mobile and web, specializing in user-friendly applications with integrated payment systems.
        </p>
        <div class="skills">
          <h3>Technical Skills</h3>
          <div class="skill-categories">
            <div class="skill-category">
              <h4>Mobile & Web</h4>
              <ul>
                <li>Flutter (iOS/Android/Web)</li>
                <li>Svelte / SvelteKit</li>
                <li>JavaScript / TypeScript</li>
                <li>HTML5 / CSS3</li>
              </ul>
            </div>
            <div class="skill-category">
              <h4>Backend & Services</h4>
              <ul>
                <li>Firebase Authentication</li>
                <li>Firebase Database</li>
                <li>Square Integration</li>
                <li>E-commerce Solutions</li>
              </ul>
            </div>
            <div class="skill-category">
              <h4>Tools & Interests</h4>
              <ul>
                <li>Cross-platform Development</li>
                <li>Git / GitHub</li>
                <li class="parent-item">Development Environments:</li>
                <ul class="sub-list">
                  <li>VS Code</li>
                  <li>Android Studio</li>
                  <li>WebStorm</li>
                  <li>Cursor</li>
                </ul>
                <li>Godot Game Development</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <SectionNav nextSection="projects" />
</section> 