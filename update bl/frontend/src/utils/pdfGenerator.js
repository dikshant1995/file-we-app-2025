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
    await new Promise(resolve => setTimeout(resolve, 600));

    const pages = element.querySelectorAll('.pdf-page');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    if (pages.length > 0) {
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        const canvas = await html2canvas(pages[i], {
          scale: 2.5, // High resolution for premium look
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }
    } else {
      // Fallback for single page legacy layout
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    // Revert styles back to hide it
    element.style.left = originalLeft;
    element.style.position = 'absolute';

    pdf.save(filename);

  } catch (error) {
    console.error("Error generating PDF:", error);
    // Try to revert styles in case of error
    element.style.left = '-9999px';
    element.style.position = 'absolute';
    throw error; // Re-throw to handle in UI
  }
};
