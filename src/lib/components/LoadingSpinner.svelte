<script lang="ts">
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let color: string = 'var(--primary-lighter)';
  export let text: string = '';
</script>

<div class="loading-container">
  <div class="spinner {size}" style="border-top-color: {color}; border-right-color: {color}"></div>
  {#if text}
    <p class="loading-text">{text}</p>
  {/if}
</div>

<style>
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
  }

  .spinner {
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .spinner.small {
    width: 24px;
    height: 24px;
    border-width: 2px;
  }

  .spinner.medium {
    width: 40px;
    height: 40px;
    border-width: 3px;
  }

  .spinner.large {
    width: 60px;
    height: 60px;
    border-width: 4px;
  }

  .loading-text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    font-weight: 500;
    margin: 0;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
