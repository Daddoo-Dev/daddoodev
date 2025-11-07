<script lang="ts">
  import { onMount } from 'svelte';

  export let src: string;
  export let alt: string;
  export let placeholder: string = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3C/svg%3E';
  export let width: string | number | undefined = undefined;
  export let height: string | number | undefined = undefined;
  export let objectFit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' = 'cover';
  
  let loaded = false;
  let error = false;
  let imgElement: HTMLImageElement;

  onMount(() => {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px'
        }
      );

      if (imgElement) {
        observer.observe(imgElement);
      }

      return () => observer.disconnect();
    } else {
      // Fallback for browsers without IntersectionObserver
      loadImage();
    }
  });

  function loadImage() {
    if (!imgElement || loaded) return;

    const img = new Image();
    img.onload = () => {
      loaded = true;
    };
    img.onerror = () => {
      error = true;
    };
    img.src = src;
  }
</script>

<div class="lazy-image-wrapper" style:width style:height>
  <img
    bind:this={imgElement}
    src={loaded ? src : placeholder}
    {alt}
    class="lazy-image"
    class:loaded
    class:error
    style:object-fit={objectFit}
    loading="lazy"
  />
  {#if !loaded && !error}
    <div class="loading-overlay">
      <div class="spinner"></div>
    </div>
  {/if}
  {#if error}
    <div class="error-overlay">
      <span>❌</span>
      <p>Failed to load image</p>
    </div>
  {/if}
</div>

<style>
  .lazy-image-wrapper {
    position: relative;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }

  .lazy-image {
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .lazy-image.loaded {
    opacity: 1;
  }

  .lazy-image.error {
    opacity: 0.3;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.1);
  }

  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--primary-lighter);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    color: rgba(255, 255, 255, 0.8);
  }

  .error-overlay span {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .error-overlay p {
    font-size: 0.9rem;
    margin: 0;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
