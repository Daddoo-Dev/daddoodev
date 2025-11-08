<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import SectionNav from './SectionNav.svelte';
  import LazyImage from './LazyImage.svelte';

  interface Project {
    title: string;
    description: string;
    status: string;
    technologies: string[];
    image: string;
    liveUrl?: string;
    internalUrl?: string;
    githubUrl?: string;
    size?: 'small' | 'medium' | 'large'; // For bento grid sizing
    category?: string;
    featured?: boolean;
  }

  let activeFilter: string = 'All';

  const projects: Project[] = [
    {
      title: 'Preux',
      description: 'Intelligent error tracking dashboard with AI-powered analysis, multi-database support, and comprehensive SDKs for modern development workflows.',
      status: 'Available Now',
      technologies: ['Flutter', 'AI/ML', 'Multi-Database', 'Cross-Platform'],
      image: '/images/preuxtext.png',
      internalUrl: '/preux',
      size: 'medium',
      category: 'Desktop App',
      featured: true
    },
    {
      title: 'ToDoSync',
      description: 'VS Code extension that syncs workspace tasks with Notion databases. Bi-directional sync, bulk import from markdown, and centralized project management.',
      status: 'Available Now',
      technologies: ['VS Code', 'Notion API', 'TypeScript', 'Node.js'],
      image: '/images/todosync.png',
      liveUrl: 'https://marketplace.visualstudio.com/items?itemName=DaddooDev.todo-sync',
      size: 'medium',
      category: 'VS Code Extension',
      featured: true
    },
    {
      title: 'AddASaint',
      description: 'VS Code extension for Catholic developers to add saint invocations to project files. Auto-detects 30+ frameworks and uses correct comment syntax.',
      status: 'Available Now',
      technologies: ['VS Code', 'TypeScript', 'Multi-Language', 'Faith'],
      image: '/images/adddasaint.png',
      liveUrl: 'https://marketplace.visualstudio.com/items?itemName=DaddooDev.addasaint',
      size: 'medium',
      category: 'VS Code Extension',
      featured: true
    },
    {
      title: 'SecretKeeper',
      description: 'VS Code extension for secure local storage of API keys, tokens, and credentials. Uses OS-level encryption with auto-clearing clipboard.',
      status: 'Available Now',
      technologies: ['VS Code', 'TypeScript', 'Security', 'SecretStorage'],
      image: '/images/secretkeeper.png',
      liveUrl: 'https://marketplace.visualstudio.com/items?itemName=DaddooDev.secretkeeper',
      size: 'medium',
      category: 'VS Code Extension',
      featured: false
    },
    {
      title: 'Ridewealth Assistant',
      description: 'A comprehensive financial tracking application designed specifically for rideshare drivers. This Flutter-based app helps drivers manage their earnings, expenses, and tax obligations efficiently across mobile and web platforms.',
      status: 'Launching Soon',
      technologies: ['Flutter', 'Firebase', 'iOS', 'Android', 'Web'],
      image: 'images/rwa.png',
      size: 'medium',
      category: 'Mobile App',
      featured: true
    },
    {
      title: 'Coaster Score',
      description: 'A specialized application for roller coaster enthusiasts to track their "coaster count".',
      status: 'Completed',
      technologies: ['SvelteKit', 'Firebase', 'JavaScript'],
      image: '/images/coaster.jpg',
      liveUrl: 'https://coaster-score.web.app/',
      size: 'medium',
      category: 'Web App'
    },
    {
      title: 'Stock Market Game',
      description: 'A simple stock market game where users can buy and sell stocks, and track their success.',
      status: 'Completed',
      technologies: ['SvelteKit', 'Firebase', 'TypeScript', 'Tailwind CSS'],
      image: '/images/marketgame.png',
      liveUrl: 'https://marketgame-3e924.firebaseapp.com/',
      size: 'medium',
      category: 'Game'
    },
    {
      title: 'New Horizons Natural Landscaping',
      description: 'A website for a landscaping company that provides services for residential and commercial properties.',
      status: 'Completed',
      technologies: ['SvelteKit', 'TypeScript', 'Tailwind CSS'],
      image: '/images/newhorizons.jpeg',
      liveUrl: 'https://newhorizonsnativelandscaping.netlify.app/',
      size: 'medium',
      category: 'Web App'
    },
    {
      title: 'Council Programs Annual Survey',
      description: 'A web app for KofC Councils to track programs and generate the annual survey.',
      status: 'Completed',
      technologies: ['SvelteKit', 'Firebase', 'TypeScript'],
      image: '/images/kcsurvey.png',
      liveUrl: 'https://kcannualsurvey.web.app/'
  
    },
    {
      title: 'Alignment Quiz',
      description: 'Want to know your D&D alignment? Take this unique quiz and find out!',
      status: 'Completed',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      image: '/images/alignment.png',
      liveUrl: 'https://shawnmcpeek.github.io/alignment/',
      size: 'medium',
      category: 'Web App'
    },
    {
      title: 'Inspiration by Simpsons',
      description: 'A simple web app that allows users to generate inspiration quotes from The Simpsons.',
      status: 'Completed',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      image: '/images/ce31fc0724c4269bd1386d8c866c92a6.jpg',
      liveUrl: 'https://shawnmcpeek.github.io/simpsonsquotes/',
      size: 'medium',
      category: 'Web App'
    },
    {
      title: 'Pandalerium',
      description: 'A simple web app that generates a random panda image. My daughter loves pandas, so I made this for her.',
      status: 'Completed',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      image: '/images/panda-image.jpg',
      liveUrl: 'https://pandalerium-a0743.firebaseapp.com/',
      size: 'medium',
      category: 'Web App'
    },
    {
      title: 'TopMath',
      description: 'A professional website for a mathematics tutoring service, featuring an intuitive interface for service information, tutor profiles, and session booking.',
      status: 'Completed - Pending Deployment',
      technologies: ['HTML5', 'CSS3', 'JavaScript'],
      image: '/images/fractal.jpg',
      liveUrl: 'https://topmath.netlify.app/',
      size: 'medium',
      category: 'Web Service'
    },
    {
      title: '303-Vinyl',
      description: 'A modern web store for online sales of vinyl stickers, featuring Square integration for inventory and payment processing.',
      status: 'In Development',
      technologies: ['SvelteKit', 'Square API', 'Firebase', 'JavaScript'],
      image: '/images/303vinyl.png',
      size: 'medium',
      category: 'E-commerce'
    },
         {
       title: 'Otto & Furiends',
       description: 'An e-commerce platform specializing in dog-themed stickers and accessories.',
       status: 'In Development',
       technologies: ['SvelteKit', 'Square API', 'Firebase', 'JavaScript'],
       image: '/images/ottoandfuriends.png',
       size: 'medium',
       category: 'E-commerce'
     },
     {
       title: 'Twisted Fortunes',
       description: 'A fun fortune cookie web app where users can click to reveal something unexpected. Built with modern web technologies for a smooth, interactive experience.',
       status: 'Completed',
       technologies: ['Nuxt', 'Vue.js', 'JavaScript', 'Netlify'],
       image: '/images/twistedfortune.png',
       liveUrl: 'https://twistedfortunes.netlify.app/',
       size: 'medium',
       category: 'Web App'
     },
     
   ];

  // Get featured and non-featured projects
  $: featuredProjects = projects.filter(p => p.featured);
  $: nonFeaturedProjects = projects.filter(p => !p.featured);

  // Get unique categories from all projects
  $: categories = ['All', ...new Set(projects.map(p => p.category).filter(Boolean))];

  // Filter ALL projects based on active filter (includes featured)
  $: filteredProjects = activeFilter === 'All' 
    ? nonFeaturedProjects 
    : projects.filter(p => p.category === activeFilter);

  function setFilter(category: string | undefined) {
    if (category) {
      activeFilter = category;
    }
  }
</script>

<section class="projects" id="projects">
  <div class="container">
    <h2 class="section-title">Projects</h2>
    <p class="projects-intro">
      From mobile applications to e-commerce solutions, here's a showcase of my recent work:
    </p>
    
    <!-- Featured Projects -->
    <div class="featured-section">
      <h3 class="featured-title">Featured Projects</h3>
      <div class="featured-grid">
        {#each featuredProjects as project, i}
          {#if project.liveUrl || project.internalUrl}
            <a 
              href={project.liveUrl || project.internalUrl}
              target={project.liveUrl ? '_blank' : '_self'}
              rel={project.liveUrl ? 'noopener' : ''}
              class="featured-card"
              in:fly={{ y: 50, duration: 500, delay: i * 100 }}
              out:fade
            >
              <div class="card-background">
                <div class="card-image">
                  <LazyImage src={project.image} alt={project.title} objectFit="contain" />
                  <div class="image-overlay"></div>
                </div>
                <div class="card-content">
                  <div class="card-header">
                    <span class="category-tag">{project.category}</span>
                    <span class="status-badge {project.status.toLowerCase().replace(/\s+/g, '-')}">
                      {project.status}
                    </span>
                  </div>
                  <h3 class="card-title">{project.title}</h3>
                  <p class="card-description">{project.description}</p>
                  
                  <div class="tech-stack">
                    {#each project.technologies.slice(0, 3) as tech}
                      <span class="tech-chip">{tech}</span>
                    {/each}
                    {#if project.technologies.length > 3}
                      <span class="tech-chip more">+{project.technologies.length - 3}</span>
                    {/if}
                  </div>
                  
                  <div class="card-actions">
                    <span class="action-button primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15,3 21,3 21,9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      {project.internalUrl ? 'Learn More' : 'View Live'}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          {/if}
        {/each}
      </div>
    </div>

    <!-- Category Filters -->
    <div class="filter-section">
      <h3 class="filter-title">More Projects</h3>
      <div class="filter-buttons">
        {#each categories as category}
          <button 
            class="filter-btn" 
            class:active={activeFilter === category}
            on:click={() => setFilter(category)}
          >
            {category}
          </button>
        {/each}
      </div>
    </div>
    
    <!-- Filtered Projects Grid -->
    <div class="bento-grid">
      {#each filteredProjects as project, i}
        {#if project.liveUrl || project.internalUrl}
          <a 
            href={project.liveUrl || project.internalUrl}
            target={project.liveUrl ? '_blank' : '_self'}
            rel={project.liveUrl ? 'noopener' : ''}
            class="bento-card {project.size || 'small'}"
            in:fly={{ y: 50, duration: 500, delay: i * 100 }}
            out:fade
          >
            <div class="card-background">
              <div class="card-image">
                <LazyImage src={project.image} alt={project.title} objectFit="contain" />
                <div class="image-overlay"></div>
              </div>
              <div class="card-content">
                <div class="card-header">
                  <span class="category-tag">{project.category}</span>
                  <span class="status-badge {project.status.toLowerCase().replace(/\s+/g, '-')}">
                    {project.status}
                  </span>
                </div>
                <h3 class="card-title">{project.title}</h3>
                <p class="card-description">{project.description}</p>
                
                <div class="tech-stack">
                  {#each project.technologies.slice(0, 3) as tech}
                    <span class="tech-chip">{tech}</span>
                  {/each}
                  {#if project.technologies.length > 3}
                    <span class="tech-chip more">+{project.technologies.length - 3}</span>
                  {/if}
                </div>
                
                <div class="card-actions">
                  <span class="action-button primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15,3 21,3 21,9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    {project.internalUrl ? 'Learn More' : 'View Live'}
                  </span>
                  {#if project.githubUrl}
                    <button 
                      class="action-button secondary" 
                      on:click={() => window.open(project.githubUrl, '_blank', 'noopener')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                      </svg>
                      Source
                    </button>
                  {/if}
                </div>
              </div>
            </div>
          </a>
        {:else}
          <div 
            class="bento-card {project.size || 'small'}"
            in:fly={{ y: 50, duration: 500, delay: i * 100 }}
            out:fade
          >
            <div class="card-background">
              <div class="card-image">
                <LazyImage src={project.image} alt={project.title} objectFit="contain" />
                <div class="image-overlay"></div>
              </div>
              <div class="card-content">
                <div class="card-header">
                  <span class="category-tag">{project.category}</span>
                  <span class="status-badge {project.status.toLowerCase().replace(/\s+/g, '-')}">
                    {project.status}
                  </span>
                </div>
                <h3 class="card-title">{project.title}</h3>
                <p class="card-description">{project.description}</p>
                
                <div class="tech-stack">
                  {#each project.technologies.slice(0, 3) as tech}
                    <span class="tech-chip">{tech}</span>
                  {/each}
                  {#if project.technologies.length > 3}
                    <span class="tech-chip more">+{project.technologies.length - 3}</span>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/each}
    </div>
  </div>
  <SectionNav nextSection="contact" />
</section>

<style>
  .projects {
    padding: 6rem 0;
    position: relative;
  }

  .projects-intro {
    text-align: center;
    font-size: 1.2rem;
    color: #888;
    margin-bottom: 3rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Featured Projects Section */
  .featured-section {
    margin-bottom: 4rem;
  }

  .featured-title {
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 2rem;
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .featured-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .featured-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    text-decoration: none;
    display: block;
    min-height: 400px;
  }

  .featured-card:hover {
    transform: translateY(-8px) scale(1.02);
  }

  /* Filter Section */
  .filter-section {
    margin-bottom: 3rem;
    text-align: center;
  }

  .filter-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .filter-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .filter-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
  }

  .filter-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;
    color: #fff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .bento-grid {
    width: 100%;
    max-width: 99vw;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: minmax(220px, auto);
    gap: 2.5rem;
    grid-auto-flow: dense;
  }

  .bento-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    text-decoration: none;
    display: block;
  }

  .bento-card:hover {
    transform: translateY(-8px) scale(1.02);
  }

  .bento-card.small,
  .bento-card.medium,
  .bento-card.large {
    grid-column: span 3;
    grid-row: span 1;
  }

  .card-background {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .bento-card:hover .card-background {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .card-image {
    position: relative;
    width: 100%;
    height: 60%;
    overflow: hidden;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.3) 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }

  .card-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1.5rem;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0.7) 50%,
      transparent 100%
    );
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .category-tag {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--primary-lighter);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .status-badge.completed {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .status-badge.in-development {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .status-badge.launching-soon {
    background: rgba(168, 85, 247, 0.2);
    color: #a855f7;
    border: 1px solid rgba(168, 85, 247, 0.3);
  }

  .status-badge.completed---pending-deployment {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  .status-badge.available-now {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }

  .card-description {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .tech-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tech-chip {
    padding: 0.25rem 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
  }

  .tech-chip.more {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
  }

  .card-actions {
    display: flex;
    gap: 0.75rem;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }

  .action-button.primary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .action-button.primary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .action-button.secondary {
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .action-button.secondary:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* Responsive Design */
  @media (max-width: 1800px) {
    .bento-grid {
      grid-template-columns: repeat(8, 1fr);
      gap: 2rem;
      max-width: 99vw;
    }
  }

  @media (max-width: 1200px) {
    .bento-grid {
      grid-template-columns: repeat(6, 1fr);
      gap: 1.5rem;
      max-width: 99vw;
    }
  }

  @media (max-width: 900px) {
    .bento-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 1.2rem;
      max-width: 100vw;
    }
  }

  @media (max-width: 600px) {
    .bento-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
      max-width: 100vw;
    }
    .bento-card.small,
    .bento-card.medium,
    .bento-card.large {
      grid-column: span 1;
      grid-row: span 1;
    }
  }
</style> 