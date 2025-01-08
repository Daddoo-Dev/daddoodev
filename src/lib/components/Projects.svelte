<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import SectionNav from './SectionNav.svelte';

  interface Project {
    title: string;
    description: string;
    status: string;
    technologies: string[];
    image: string;
    liveUrl?: string;  // Optional property
    githubUrl?: string;  // Optional property
  }

  const projects: Project[] = [
    {
      title: 'Ridewealth Assistant',
      description: 'A comprehensive financial tracking application designed specifically for rideshare drivers. This Flutter-based app helps drivers manage their earnings, expenses, and tax obligations efficiently across mobile and web platforms.',
      status: 'Launching Soon',
      technologies: ['Flutter', 'Firebase', 'iOS', 'Android', 'Web'],
      image: 'images/rwa.png',
    },
    {
      title: '303-Vinyl',
      description: 'A modern web store for online sales of vinyl stickers, featuring Square integration for inventory and payment processing. Built with SvelteKit and includes real-time stock management and secure checkout.',
      status: 'In Development',
      technologies: ['SvelteKit', 'Square API', 'Firebase', 'JavaScript'],
      image: '/images/303vinyl.png',
      // liveUrl coming soon
    },
    {
      title: 'Otto & Furiends',
      description: 'An e-commerce platform specializing in dog-themed stickers and accessories. Features a modern SvelteKit frontend with Square integration for seamless inventory management and secure payment processing.',
      status: 'In Development',
      technologies: ['SvelteKit', 'Square API', 'Firebase', 'JavaScript'],
      image: '/images/ottoandfuriends.png',
      // liveUrl coming soon
    },
    {
      title: 'TopMath',
      description: 'A professional website for a mathematics tutoring service, featuring an intuitive interface for service information, tutor profiles, and session booking. Built with modern web technologies for optimal performance.',
      status: 'Completed - Pending Deployment',
      technologies: ['HTML5', 'CSS3', 'JavaScript'],
      image: '/images/fractal.jpg',
      liveUrl: 'https://topmath.netlify.app/'
    },
    {
      title: 'Coaster Score',
      description: 'A specialized application for roller coaster enthusiasts to track their "coaster count". Users can log, categorize, and maintain their personal record of unique roller coaster rides, with features for sharing achievements and discovering new coasters.',
      status: 'Completed',
      technologies: ['SvelteKit', 'Firebase', 'JavaScript'],
      image: '/images/coaster.jpg',
      liveUrl: 'https://coaster-score.web.app/'
  
    }
  ];
</script>

<section class="projects" id="projects">
  <div class="container">
    <h2 class="section-title">Projects</h2>
    <p class="projects-intro">
      From mobile applications to e-commerce solutions, here's a showcase of my recent work:
    </p>
    <div class="projects-grid">
      {#each projects as project, i}
        <div 
          class="project-card"
          in:fly={{ y: 50, duration: 500, delay: i * 150 }}
          out:fade
        >
          <div class="project-image">
            <img src={project.image} alt={project.title} />
            <div class="project-status">{project.status}</div>
          </div>
          <div class="project-content">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div class="project-technologies">
              {#each project.technologies as tech}
                <span class="tech-tag">{tech}</span>
              {/each}
            </div>
            {#if project.liveUrl}
              <div class="project-links">
                <a href={project.liveUrl} class="primary-button" target="_blank" rel="noopener">View Live</a>
                {#if project.githubUrl}
                  <a href={project.githubUrl} class="secondary-button" target="_blank" rel="noopener">Source Code</a>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
  <SectionNav nextSection="contact" />
</section> 