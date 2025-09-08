<script lang="ts">
  import { onMount } from 'svelte';
  import '$lib/styles/global.css';
  import { PDFDocument } from 'pdf-lib';
  
  // Import components
  import PDFUploader from '$lib/components/pdf-form/PDFUploader.svelte';
  import PDFPreview from '$lib/components/pdf-form/PDFPreview.svelte';
  import FieldDetector from '$lib/components/pdf-form/FieldDetector.svelte';
  import FieldManager from '$lib/components/pdf-form/FieldManager.svelte';
  import PDFGenerator from '$lib/components/pdf-form/PDFGenerator.svelte';

  // State variables
  let uploadedFile: File | null = null;
  let pdfUrl: string | null = null;
  let pdfDoc: PDFDocument | null = null;
  let detectedFields: Array<{id: string, name: string, type: string, x: number, y: number, width: number, height: number}> = [];
  let isFieldPlacementMode = false;
  let errorMessage = '';

  // Component references
  let fieldDetector: FieldDetector;
  let pdfGenerator: PDFGenerator;

  // Handle file upload from PDFUploader
  function handleFileUpload(event: CustomEvent) {
    const { file, pdfUrl: url, arrayBuffer } = event.detail;
    
    uploadedFile = file;
    pdfUrl = url;
    
    // Load PDF with pdf-lib
    PDFDocument.load(arrayBuffer).then(doc => {
      pdfDoc = doc;
      console.log('PDF loaded successfully');
      
      // Trigger field detection
      if (fieldDetector) {
        fieldDetector.detectFormFields();
      }
    }).catch(error => {
      console.error('Error loading PDF:', error);
      errorMessage = 'Failed to load PDF file';
    });
  }

  // Handle fields detected from FieldDetector
  function handleFieldsDetected(event: CustomEvent) {
    detectedFields = event.detail;
    console.log('Fields detected:', detectedFields.length);
  }

  // Handle field placement from PDFPreview
  function handleFieldPlacement(event: CustomEvent) {
    const { x, y } = event.detail;
    
    // Add new field at click position
    const newField = {
      id: `field-${Date.now()}`,
      name: 'New Field',
      type: 'text',
      x: x - 100, // Center the field on click
      y: y - 15,
      width: 200,
      height: 30
    };

    detectedFields = [...detectedFields, newField];
    console.log('Field added at:', x, y);
  }

  // Handle field removal from PDFPreview or FieldManager
  function handleRemoveField(event: CustomEvent) {
    const fieldId = event.detail;
    detectedFields = detectedFields.filter(field => field.id !== fieldId);
  }

  // Toggle field placement mode
  function toggleFieldPlacement(): void {
    isFieldPlacementMode = !isFieldPlacementMode;
  }

  // Generate fillable PDF
  function generateFillablePDF(): void {
    if (pdfGenerator) {
      pdfGenerator.generateFillablePDF();
    }
  }

  // Handle errors from components
  function handleError(event: CustomEvent) {
    errorMessage = event.detail;
  }

  // Cleanup on component destroy
  onMount(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  });
</script>

<svelte:head>
  <title>PDF Form Preparer - Daddoo Dev</title>
  <meta name="description" content="Convert PDFs to fillable forms automatically. Upload, detect fields, and generate fillable PDFs." />
</svelte:head>

<div class="pdf-form-preparer-page">
  <div class="container">
    <div class="pdf-form-content">
      <h1 class="page-title">PDF Form Preparer</h1>
      <p class="page-description">
        Upload a PDF document and automatically detect form fields to create a fillable form.
      </p>

      <!-- File Upload Component -->
      <PDFUploader on:fileUploaded={handleFileUpload} on:error={handleError} />

      {#if errorMessage}
        <div class="error-message">
          {errorMessage}
        </div>
      {/if}

      <!-- PDF Preview Component -->
      <PDFPreview 
        {pdfUrl} 
        fields={detectedFields} 
        {isFieldPlacementMode}
        on:fieldPlacement={handleFieldPlacement}
        on:removeField={handleRemoveField}
      />

      <!-- Field Detection Component (invisible) -->
      <FieldDetector 
        bind:this={fieldDetector}
        {pdfDoc}
        on:fieldsDetected={handleFieldsDetected}
        on:detectionError={handleError}
      />

      <!-- PDF Generation Component (invisible) -->
      <PDFGenerator 
        bind:this={pdfGenerator}
        {pdfDoc}
        fields={detectedFields}
        on:error={handleError}
      />

      {#if pdfUrl}
        <div class="preview-controls">
          <h2 class="section-title">PDF Preview</h2>
          <div class="control-buttons">
            <button 
              class="secondary-button {isFieldPlacementMode ? 'active' : ''}"
              on:click={toggleFieldPlacement}
            >
              {isFieldPlacementMode ? 'Exit Field Mode' : 'Add Fields'}
            </button>
            {#if detectedFields.length > 0}
              <button 
                class="primary-button"
                on:click={generateFillablePDF}
              >
                Generate Fillable PDF
              </button>
            {/if}
          </div>
        </div>

        <!-- Field Management Component -->
        <FieldManager 
          fields={detectedFields}
          on:removeField={handleRemoveField}
        />
      {/if}
    </div>
  </div>
</div>

<style>
  .pdf-form-preparer-page {
    min-height: 100vh;
    padding: 2rem 0;
  }

  .pdf-form-content {
    max-width: 1000px;
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

  .error-message {
    color: #ff6b6b;
    margin-top: 1rem;
    padding: 0.5rem;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 4px;
    border: 1px solid rgba(255, 107, 107, 0.3);
  }

  .preview-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .section-title {
    font-size: 2rem;
    margin: 0;
    color: #fff;
  }

  .control-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .secondary-button.active {
    background: var(--primary-gradient);
    color: white;
    border-color: var(--primary-lighter);
  }

  @media (max-width: 768px) {
    .page-title {
      font-size: 2.5rem;
    }

    .page-description {
      font-size: 1.1rem;
    }

    .preview-controls {
      flex-direction: column;
      align-items: stretch;
    }

    .control-buttons {
      justify-content: center;
    }
  }
</style>