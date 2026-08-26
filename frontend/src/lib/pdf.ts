import { toPng } from "html-to-image";
import jsPDF from "jspdf";

/**
 * Captures an HTML element and converts it to a high-res PDF.
 * @param elementId The DOM element ID to capture
 * @param filename The desired output filename
 */
export async function generatePDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Temporarily force the element to be visible if it's hidden (useful if rendering off-screen)
  const originalDisplay = element.style.display;
  element.style.display = "block";
  
  try {
    const imgData = await toPng(element, {
      pixelRatio: 2, // High resolution
      backgroundColor: "#060b10", // Match our background
      fontEmbedCSS: '', // Bypass CORS error on external stylesheets like Google Fonts
    });

    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    
    // Since we don't have direct width/height of the generated image immediately, 
    // we can calculate the ratio from the DOM element itself
    const rect = element.getBoundingClientRect();
    const canvasRatio = rect.height / rect.width;
    
    // We want to fit it to the width of A4
    const imgWidth = pdfWidth;
    let imgHeight = imgWidth * canvasRatio;

    const pdf = new jsPDF("p", "mm", "a4");

    // If it fits on one page
    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    } else {
      // Basic pagination (if it spans multiple pages)
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
    }

    pdf.save(filename);
  } finally {
    // Restore original display
    element.style.display = originalDisplay;
  }
}
