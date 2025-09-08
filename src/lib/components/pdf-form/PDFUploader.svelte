<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let isProcessing = false;
  let errorMessage = '';

  // File upload handler
  async function handleFileUpload(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;

    // Validate file
    if (!file.type.includes('pdf')) {
      errorMessage = 'Please select a valid PDF file';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      errorMessage = 'File size must be less than 10MB';
      return;
    }

    isProcessing = true;
    errorMessage = '';

    try {
      // Create blob URL for display
      const pdfUrl = URL.createObjectURL(file);
      console.log('PDF URL created:', pdfUrl);

      // Dispatch the file and URL to parent
      dispatch('fileUploaded', {
        file,
        pdfUrl,
        arrayBuffer: await file.arrayBuffer()
      });

    } catch (error) {
      console.error('Error processing PDF:', error);
      errorMessage = 'Failed to process PDF file';
    } finally {
      isProcessing = false;
    }
  }
</script>

<div class="generator-form">
  <div class="input-group">
    <div class="file-input-wrapper">
      <input
        type="file"
        id="pdf-file"
        accept=".pdf"
        on:change={handleFileUpload}
        class="file-input"
        disabled={isProcessing}
      />
      <label for="pdf-file" class="file-label">
        {isProcessing ? 'Processing...' : 'Choose PDF File'}
      </label>
    </div>
    <p class="upload-hint">Max size: 10MB. Supported format: PDF</p>
  </div>

  {#if errorMessage}
    <div class="error-message">
      {errorMessage}
    </div>
  {/if}
</div>

<style>
  .generator-form {
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
  }

  .input-group {
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .file-input-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .file-label {
    cursor: pointer;
    margin-bottom: 0;
    display: inline-block;
    padding: 0.8rem 1.5rem;
    background: var(--primary-gradient);
    color: white;
    border-radius: 8px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    border: 2px solid var(--primary-lighter);
  }

  .file-label:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 1, 67, 0.3);
  }

  .file-input {
    display: none;
  }

  .upload-hint {
    font-size: 0.8rem;
    color: #888;
    margin: 0.5rem 0;
  }

  .error-message {
    color: #ff6b6b;
    margin-top: 1rem;
    padding: 0.5rem;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 4px;
    border: 1px solid rgba(255, 107, 107, 0.3);
  }
</style>
