<script lang="ts">
  import { onMount } from 'svelte';
  import '$lib/styles/global.css';
  import QRCode from 'qrcode-svg';

  let urlInput = '';
  let isGenerating = false;
  let errorMessage = '';
  let uploadedImage: File | null = null;
  let imagePreviewUrl: string | undefined = '';
  let showImageUpload = false;
  let svgMarkup = '';
  let qrCodeImageUrl = '';
  let qrCodeContainer: HTMLDivElement;

  async function generateQRCode() {
    if (!urlInput.trim()) {
      errorMessage = 'Please enter a URL';
      return;
    }
    try {
      new URL(urlInput);
    } catch {
      errorMessage = 'Please enter a valid URL (e.g., https://example.com)';
      return;
    }
    isGenerating = true;
    errorMessage = '';

    // Generate QR SVG
    const qr = new QRCode({
      content: urlInput,
      width: 300,
      height: 300,
      color: '#000000',
      background: '#ffffff',
      ecl: 'M',
    });
    let svg = qr.svg();

    // If logo, overlay it in the center
    if (uploadedImage && imagePreviewUrl) {
      // Insert <image> tag in the center of the SVG
      // Calculate size and position
      const logoSize = 60;
      const x = (300 - logoSize) / 2;
      const y = (300 - logoSize) / 2;
      // Insert before </svg>
      svg = svg.replace(
        '</svg>',
        `<image x="${x}" y="${y}" width="${logoSize}" height="${logoSize}" href="${imagePreviewUrl}" clip-path="circle(28px at 30px 30px)" />\n</svg>`
      );
    }
    svgMarkup = svg;

    // For download: convert SVG to PNG
    const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml' });
    qrCodeImageUrl = URL.createObjectURL(svgBlob);
    isGenerating = false;
  }

  function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      errorMessage = 'Please select a valid image file';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      errorMessage = 'Image file size must be less than 2MB';
      return;
    }
    uploadedImage = file;
    errorMessage = '';
    try {
      const preview = await fileToDataURL(file);
      if (typeof preview === 'string') {
        imagePreviewUrl = preview;
      }
      return;
    } catch (error) {
      errorMessage = 'Failed to load image preview';
      console.error('Image preview error:', error);
      return;
    }
  }

  function removeImage() {
    uploadedImage = null;
    imagePreviewUrl = '';
    const fileInput = document.getElementById('image-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  function saveQRCode() {
    if (!qrCodeImageUrl) return;
    const link = document.createElement('a');
    link.download = 'qr-code.svg';
    link.href = qrCodeImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      generateQRCode();
    }
  }
</script>

<svelte:head>
  <title>QR Code Generator - Daddoo Dev</title>
  <meta name="description" content="Generate QR codes for your website URLs instantly. No signup required." />
</svelte:head>

<div class="qr-generator-page">
  <div class="container">
    <div class="qr-generator-content">
      <h1 class="page-title">QR Code Generator</h1>
      <p class="page-description">
        Generate QR codes for your website URLs instantly. No signup required.
      </p>

      <div class="generator-form">
        <div class="input-group">
          <label for="url-input" class="form-label">Website URL</label>
          <input
            id="url-input"
            type="url"
            bind:value={urlInput}
            placeholder="https://example.com"
            class="url-input"
            on:keypress={handleKeyPress}
          />
        </div>

        <div class="image-upload-section">
          <button
            type="button"
            class="secondary-button toggle-button"
            on:click={() => showImageUpload = !showImageUpload}
          >
            {showImageUpload ? 'Remove Logo Option' : 'Add Logo to QR Code'}
          </button>

          {#if showImageUpload}
            <div class="image-upload-container">
              <label for="image-input" class="form-label">Upload Logo/Image (optional)</label>
              <div class="file-input-wrapper">
                <label for="image-input" class="secondary-button file-label">Choose File</label>
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  on:change={handleImageUpload}
                  class="file-input"
                />
                {#if uploadedImage}
                  <span class="file-name">{uploadedImage.name}</span>
                {/if}
              </div>
              <p class="upload-hint">Max size: 2MB. Supported formats: JPG, PNG, GIF</p>

              {#if imagePreviewUrl}
                <div class="image-preview">
                  <img src={imagePreviewUrl} alt="Logo preview" class="preview-image" />
                  <button type="button" class="remove-button" on:click={removeImage}>
                    Remove
                  </button>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <button
          class="primary-button generate-button"
          on:click={generateQRCode}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate QR Code'}
        </button>

        {#if errorMessage}
          <div class="error-message">{errorMessage}</div>
        {/if}
      </div>

      {#if svgMarkup}
        <div class="qr-result">
          <h2 class="result-title">Your QR Code</h2>
          <div class="qr-code-container" bind:this={qrCodeContainer}>
            {@html svgMarkup}
          </div>
          <div class="qr-actions">
            <button class="primary-button save-button" on:click={saveQRCode}>
              Save QR Code
            </button>
            <p class="save-hint">Right-click the image to save it directly</p>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .qr-generator-page {
    min-height: 100vh;
    padding: 2rem 0;
    /* background: rgba(0, 0, 0, 0.3); */
    /* backdrop-filter: blur(10px); */
  }

  .qr-generator-content {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }

  .page-title {
    font-size: 3rem;
    margin-bottom: 1rem;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-description {
    font-size: 1.2rem;
    color: #888;
    margin-bottom: 3rem;
    line-height: 1.6;
  }

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

  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #fff;
  }

  .url-input {
    width: 100%;
    padding: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
    color: #fff;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .url-input:focus {
    outline: none;
    border-color: var(--primary-lighter);
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
  }

  .url-input::placeholder {
    color: #666;
  }

  .image-upload-section {
    margin-bottom: 1.5rem;
  }

  .toggle-button {
    margin-bottom: 1rem;
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
  }

  .image-upload-container {
    text-align: left;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
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
  }

  .file-input {
    display: none;
  }

  .file-name {
    color: #fff;
    font-size: 1rem;
    word-break: break-all;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .upload-hint {
    font-size: 0.8rem;
    color: #888;
    margin: 0.5rem 0;
  }

  .image-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
  }

  .preview-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .remove-button {
    padding: 0.3rem 0.8rem;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: background 0.2s;
  }

  .remove-button:hover {
    background: #ff5252;
  }

  .generate-button {
    width: 100%;
    font-size: 1.1rem;
    padding: 1rem;
  }

  .generate-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .error-message {
    color: #ff6b6b;
    margin-top: 1rem;
    padding: 0.5rem;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 4px;
    border: 1px solid rgba(255, 107, 107, 0.3);
  }

  .qr-result {
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }

  .result-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: #fff;
  }

  .qr-code-container {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #fff;
    border-radius: 8px;
    display: inline-block;
  }


  .qr-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .save-button {
    min-width: 200px;
  }

  .save-hint {
    color: #888;
    font-size: 0.9rem;
    margin: 0;
  }

  @media (max-width: 768px) {
    .page-title {
      font-size: 2.5rem;
    }

    .page-description {
      font-size: 1.1rem;
    }

    .generator-form,
    .qr-result {
      padding: 1.5rem;
    }

    .qr-code-container {
      padding: 0.5rem;
    }

    .image-preview {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style> 