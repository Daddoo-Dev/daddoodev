<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let href: string | undefined = undefined;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let fullWidth: boolean = false;
  export let external: boolean = false;
  export let glow: boolean = true; // Neon glow effect - default true for main site, false for Preux
</script>

{#if href}
  <a 
    {href}
    class="btn {variant} {size}"
    class:full-width={fullWidth}
    class:disabled
    class:loading
    class:glow
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    aria-disabled={disabled || loading}
  >
    {#if loading}
      <span class="spinner"></span>
    {/if}
    <slot />
  </a>
{:else}
  <button 
    {type}
    class="btn {variant} {size}"
    class:full-width={fullWidth}
    class:loading
    class:glow
    {disabled}
    on:click
  >
    {#if loading}
      <span class="spinner"></span>
    {/if}
    <slot />
  </button>
{/if}

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 600;
    text-decoration: none;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    white-space: nowrap;
    box-shadow: 
      0 2px 0 rgba(0, 0, 0, 0.2),
      0 4px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px rgba(255, 255, 255, 0.2);
  }

  /* Sizes */
  .btn.small {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .btn.medium {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .btn.large {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }

  /* Variants */
  .btn.primary {
    background: linear-gradient(45deg, var(--primary-color), var(--primary-light));
    color: white;
    border: 2px solid var(--primary-lighter);
  }

  /* Glow effect - default for main site */
  .btn.glow.primary:hover:not(.disabled):not(.loading) {
    transform: translateY(-2px);
    background: var(--primary-color);
    box-shadow: 
      0 0 5px var(--primary-lighter),
      0 0 25px var(--primary-lighter),
      0 0 50px var(--primary-lighter);
    text-shadow: 
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 20px #fff;
  }

  /* Non-glow - subtle modern hover for Preux */
  .btn:not(.glow).primary:hover:not(.disabled):not(.loading) {
    transform: translateY(-2px);
    background: var(--primary-color);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }

  .btn.secondary {
    background: linear-gradient(45deg, #1e293b, #334155);
    color: white;
    border: 2px solid #4a5568;
  }

  .btn.glow.secondary:hover:not(.disabled):not(.loading) {
    transform: translateY(-2px);
    background: #1e293b;
    box-shadow: 
      0 0 5px #4a5568,
      0 0 25px #4a5568,
      0 0 50px #4a5568;
    text-shadow: 
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 20px #fff;
  }

  .btn:not(.glow).secondary:hover:not(.disabled):not(.loading) {
    transform: translateY(-2px);
    background: #1e293b;
    box-shadow: 0 10px 20px rgba(74, 85, 104, 0.3);
  }

  .btn.ghost {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .btn.ghost:hover:not(.disabled):not(.loading) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  /* States */
  .btn:active:not(.disabled):not(.loading) {
    transform: translateY(1px);
  }

  .btn.disabled,
  .btn[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  .btn.loading {
    cursor: wait;
    opacity: 0.8;
  }

  .btn.full-width {
    width: 100%;
  }

  /* Spinner */
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
