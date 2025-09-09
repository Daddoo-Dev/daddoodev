<script lang="ts">
  import { PDFDocument } from 'pdf-lib';

  export let pdfDoc: PDFDocument | null = null;

  // Analyze PDF text to detect form fields
  async function analyzeText(): Promise<Array<{id: string, name: string, type: string, x: number, y: number, width: number, height: number}>> {
    if (!pdfDoc) return [];

    try {
      console.log('Starting text analysis...');
      
      // Import PDF.js dynamically to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist');
      
      // Use local worker file
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      
      // Get the PDF data from pdfDoc
      const pdfBytes = await pdfDoc.save();
      const pdfArrayBuffer = pdfBytes.buffer;
      
      // Load PDF with PDF.js
      const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer });
      const pdf = await loadingTask.promise;
      
      console.log('PDF.js loaded successfully, pages:', pdf.numPages);
      
      // Extract text from all pages
      const allTextData = [];
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        console.log(`Page ${pageNum} text content:`, textContent);
        
        // Store text data with page number
        allTextData.push({
          pageNumber: pageNum,
          textContent: textContent,
          pageSize: page.getViewport({ scale: 1 })
        });
      }
      
      console.log('Text extraction complete:', allTextData);
      
      // Analyze text data to detect form fields
      const detectedFields = analyzeTextForFields(allTextData);
      
      console.log('Fields detected:', detectedFields.length);
      
      return detectedFields;

    } catch (error) {
      console.error('Text analysis error:', error);
      return [];
    }
  }

  // Analyze extracted text to detect form fields
  function analyzeTextForFields(textData: any[]): Array<{id: string, name: string, type: string, x: number, y: number, width: number, height: number}> {
    const fields: Array<{id: string, name: string, type: string, x: number, y: number, width: number, height: number}> = [];
    
    textData.forEach((pageData, pageIndex) => {
      const { textContent, pageSize } = pageData;
      
      // Convert PDF coordinates to screen coordinates (800x600 preview)
      const scaleX = 800 / pageSize.width;
      const scaleY = 600 / pageSize.height;
      
      // Sort text items by position (top to bottom, left to right)
      const sortedItems = textContent.items
        .map((item: any, index: number) => ({ ...item, originalIndex: index }))
        .sort((a: any, b: any) => {
          // Sort by Y position (top to bottom), then by X position (left to right)
          const yDiff = b.transform[5] - a.transform[5]; // Higher Y values first (PDF coordinates)
          if (Math.abs(yDiff) > 5) return yDiff; // Different rows
          return a.transform[4] - b.transform[4]; // Same row, sort by X
        });
      
      // Look for text followed by empty space (form field pattern)
      for (let i = 0; i < sortedItems.length - 1; i++) {
        const currentItem = sortedItems[i];
        const nextItem = sortedItems[i + 1];
        
        const currentText = currentItem.str.trim();
        const currentX = currentItem.transform[4];
        const currentY = currentItem.transform[5];
        const currentWidth = currentItem.width;
        const currentHeight = currentItem.height;
        
        // Skip if text is too short or too long
        if (currentText.length < 1 || currentText.length > 100) continue;
        
        // Skip if it's just numbers, symbols, or very short text
        if (currentText.length < 3 && /^[\d\s\-_\.\(\)]+$/.test(currentText)) continue;
        
        // Check if there's space after this text item
        const nextX = nextItem.transform[4];
        const nextY = nextItem.transform[5];
        
        // Calculate distance between items
        const xDistance = nextX - (currentX + currentWidth);
        const yDistance = Math.abs(nextY - currentY);
        
        // Look for horizontal spacing (text followed by space on same line)
        // Much more flexible - any reasonable spacing
        if (yDistance < currentHeight * 2 && xDistance > 5 && xDistance < 500) {
          // This looks like a form field - text followed by empty space
          const fieldX = (currentX + currentWidth) * scaleX + 5;
          const fieldY = (pageSize.height - currentY) * scaleY - 5;
          
          fields.push({
            id: `field-${pageIndex}-${currentItem.originalIndex}`,
            name: currentText.charAt(0).toUpperCase() + currentText.slice(1),
            type: 'text',
            x: fieldX,
            y: fieldY,
            width: Math.min(xDistance * scaleX - 10, 300), // Use available space, max 300px
            height: Math.max(currentHeight * scaleY + 5, 20) // At least 20px height
          });
        }
        
        // Also look for text ending with colon (common form pattern)
        else if (currentText.endsWith(':') && currentText.length > 1) {
          const fieldName = currentText.slice(0, -1).trim();
          const fieldX = (currentX + currentWidth) * scaleX + 10;
          const fieldY = (pageSize.height - currentY) * scaleY - 5;
          
          fields.push({
            id: `field-${pageIndex}-${currentItem.originalIndex}-colon`,
            name: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
            type: 'text',
            x: fieldX,
            y: fieldY,
            width: 200,
            height: Math.max(currentHeight * scaleY + 5, 20)
          });
        }
      }
    });
    
    return fields;
  }

  // Expose the analysis function
  export { analyzeText };
</script>

<!-- This component doesn't render anything visible, it just handles text analysis logic -->
