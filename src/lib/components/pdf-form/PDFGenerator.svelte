<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { PDFDocument } from 'pdf-lib';

  const dispatch = createEventDispatcher();

  export let pdfDoc: PDFDocument | null = null;
  export let fields: Array<{id: string, name: string, type: string, x: number, y: number, width: number, height: number}> = [];
  export let isProcessing = false;

  // Generate fillable PDF
  async function generateFillablePDF(): Promise<void> {
    if (!pdfDoc || fields.length === 0) {
      dispatch('error', 'No PDF or fields to process');
      return;
    }

    isProcessing = true;

    try {
      // Create a copy of the PDF
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      
      pages.forEach((page, pageIndex) => {
        newPdf.addPage(page);
        
        // Add form fields to the page
        fields.forEach(field => {
          if (field.type === 'text') {
            page.drawText(field.name, {
              x: field.x,
              y: field.y,
              size: 12,
              color: { r: 0, g: 0, b: 0 }
            });
          }
        });
      });

      // Save the PDF
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'fillable-form.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Fillable PDF generated successfully');
      dispatch('pdfGenerated', { success: true });

    } catch (error) {
      console.error('Error generating PDF:', error);
      dispatch('error', 'Failed to generate fillable PDF');
    } finally {
      isProcessing = false;
    }
  }

  // Expose the generation function
  export { generateFillablePDF };
</script>

<!-- This component doesn't render anything visible, it just handles PDF generation logic -->
