<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let pdfUrl: string | null = null;
  export let fields: Array<{id: string, name: string, type: string, x: number, y: number, width: number, height: number}> = [];
  export let isFieldPlacementMode = false;

  // Handle PDF preview click for field placement
  function handlePreviewClick(event: MouseEvent): void {
    if (!isFieldPlacementMode) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Dispatch field placement event to parent
    dispatch('fieldPlacement', { x, y });
  }
</script>

{#if pdfUrl}
  <div class="pdf-preview-section">
    <div class="preview-container" on:click={handlePreviewClick}>
      <iframe
        src={pdfUrl}
        class="pdf-iframe"
        title="PDF Preview"
      ></iframe>
      
      <!-- Field overlays -->
      {#each fields as field (field.id)}
        <div 
          class="field-overlay {field.type}"
          style="left: {field.x}px; top: {field.y}px; width: {field.width}px; height: {field.height}px;"
          on:click|stopPropagation
        >
          <span class="field-label">{field.name}</span>
          <button 
            class="remove-field-btn"
            on:click={() => dispatch('removeField', field.id)}
            title="Remove field"
          >
            ×
          </button>
        </div>
      {/each}
    </div>

    {#if isFieldPlacementMode}
      <p class="placement-hint">Click anywhere on the PDF to add a new field</p>
    {/if}
  </div>
{/if}

<style>
  .pdf-preview-section {
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }

  .preview-container {
    position: relative;
    width: 800px;
    height: 600px;
    margin: 0 auto;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
  }

  .pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  .field-overlay {
    position: absolute;
    border: 2px solid var(--primary-lighter);
    background: rgba(142, 59, 163, 0.1);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
  }

  .field-overlay:hover {
    background: rgba(142, 59, 163, 0.2);
    border-color: var(--primary-color);
  }

  .field-overlay.text {
    border-color: #4CAF50;
    background: rgba(76, 175, 80, 0.1);
  }

  .field-overlay.text:hover {
    background: rgba(76, 175, 80, 0.2);
    border-color: #2E7D32;
  }

  .field-label {
    position: absolute;
    top: -20px;
    left: 0;
    font-size: 0.8rem;
    color: var(--primary-lighter);
    background: rgba(0, 0, 0, 0.8);
    padding: 2px 6px;
    border-radius: 3px;
    white-space: nowrap;
  }

  .remove-field-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ff6b6b;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .remove-field-btn:hover {
    background: #ff5252;
  }

  .placement-hint {
    color: var(--primary-lighter);
    font-style: italic;
    margin-top: 1rem;
  }

  @media (max-width: 768px) {
    .pdf-preview-section {
      padding: 1.5rem;
    }

    .preview-container {
      width: 100%;
      height: 400px;
    }
  }
</style>
