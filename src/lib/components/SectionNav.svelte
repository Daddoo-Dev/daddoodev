<script lang="ts">
  export let nextSection: string | null = null;
  export let hideTop: boolean = false;
</script>

<div class="section-nav">
  {#if nextSection}
    <a href={`#${nextSection}`} class="nav-arrow down" aria-label="Go to next section">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14M5 12l7 7 7-7"/>
      </svg>
    </a>
  {/if}
  {#if !hideTop}
    <a href="#top" class="nav-arrow up" aria-label="Back to top">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </a>
  {/if}
</div> 