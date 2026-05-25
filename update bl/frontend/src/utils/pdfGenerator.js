import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Captures the given DOM element and generates a PDF report.
 * @param {string} elementId - The ID of the DOM element to capture (e.g., 'pdf-report-container')
 * @param {string} filename - The name of the downloaded file
 * @returns {Promise<void>}
 */
export const generatePdfFromElement = async (elementId, filename = 'Financial_Report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  try {
    // Temporarily make it visible if it's hidden off-screen
    const originalLeft = element.style.left;
    element.style.left = '0';
    element.style.position = 'relative'; // Let it flow so html2canvas can capture it safely
    
    // Slight delay to ensure recharts animations complete if any
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Revert styles back to hide it
    element.style.left = originalLeft;
    element.style.position = 'absolute';

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // A4 dimensions: 210 x 297 mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);

  } catch (error) {
    console.error("Error generating PDF:", error);
    // Try to revert styles in case of error
    element.style.left = '-9999px';
    element.style.position = 'absolute';
    throw error; // Re-throw to handle in UI
  }
};
