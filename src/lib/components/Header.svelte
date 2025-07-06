<script lang="ts">
  import { onMount } from 'svelte';
  
  const navItems = [
    { label: 'Home', href: '#' },
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact', href: '#contact' },
    { label: 'QR Generator', href: '/qr-generator' }
  ];

  let isMenuOpen = false;
  let isMobile = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  onMount(() => {
    const checkWidth = () => {
      isMobile = window.innerWidth < 768;
    };
    
    window.addEventListener('resize', checkWidth);
    checkWidth();

    return () => window.removeEventListener('resize', checkWidth);
  });
</script>

<header class="header" class:menu-open={isMenuOpen && isMobile}>
  <nav class="nav">
    <div class="logo">
      <a href="/" class="nav-link">Daddoo Dev</a>
    </div>

    <!-- Mobile Menu Button -->
    {#if isMobile}
      <button class="menu-button" on:click={toggleMenu} aria-label="Toggle menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          {#if isMenuOpen}
            <path d="M18 6L6 18M6 6l12 12"/>
          {:else}
            <path d="M3 12h18M3 6h18M3 18h18"/>
          {/if}
        </svg>
      </button>
    {/if}

    {#if isMobile && isMenuOpen}
      <button class="close-menu-button" on:click={toggleMenu} aria-label="Close menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    {/if}

    <!-- Navigation Links -->
    <ul class="nav-list" class:mobile={isMobile} class:open={isMenuOpen}>
      {#each navItems as item}
        <li>
          <a 
            href={item.href} 
            class="nav-link"
            on:click={() => {if(isMobile) isMenuOpen = false}}
          >
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</header>

<style>

</style> 