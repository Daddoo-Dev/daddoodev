<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { PDFDocument } from 'pdf-lib';
  import TextAnalyzer from './TextAnalyzer.svelte';

  const dispatch = createEventDispatcher();

  export let pdfDoc: PDFDocument | null = null;

  // Component reference
  let textAnalyzer: TextAnalyzer;

  // Field detection function
  async function detectFormFields(): Promise<void> {
    if (!pdfDoc) return;

    try {
      console.log('Starting field detection...');
      
      // Use TextAnalyzer to analyze the PDF
      const detectedFields = await textAnalyzer.analyzeText();
      
      console.log('Fields detected:', detectedFields.length);
      
      // Dispatch detected fields to parent
      dispatch('fieldsDetected', detectedFields);

    } catch (error) {
      console.error('Field detection error:', error);
      dispatch('detectionError', error);
    }
  }

  // Expose the detection function
  export { detectFormFields };
</script>

<!-- Text Analyzer Component (invisible) -->
<TextAnalyzer bind:this={textAnalyzer} {pdfDoc} />

<!-- This component doesn't render anything visible, it just handles detection logic -->
