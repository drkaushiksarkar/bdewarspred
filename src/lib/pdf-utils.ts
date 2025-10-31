import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Captures a screenshot of a DOM element
 * @param element - The HTML element to capture
 * @param options - Options for html2canvas
 * @returns Canvas element with the screenshot
 */
export async function captureElement(
  element: HTMLElement,
  options?: Partial<{
    scale: number;
    logging: boolean;
    useCORS: boolean;
    allowTaint: boolean;
  }>
): Promise<HTMLCanvasElement> {
  return await html2canvas(element, {
    scale: options?.scale ?? 2,
    logging: options?.logging ?? false,
    useCORS: options?.useCORS ?? true,
    allowTaint: options?.allowTaint ?? true,
    // Important for capturing WebGL canvases (maps)
    backgroundColor: '#ffffff',
    removeContainer: false,
    foreignObjectRendering: false,
    // Ensure canvas elements (like maps) are captured
    onclone: (clonedDoc) => {
      // Force all canvas elements to be visible
      const canvases = clonedDoc.querySelectorAll('canvas');
      canvases.forEach((canvas) => {
        canvas.style.display = 'block';
      });
    },
  });
}

/**
 * Generates a PDF with multiple screenshots
 * @param screenshots - Array of canvas elements (screenshots)
 * @param tabNames - Names of the tabs for each screenshot
 * @param fileName - Name of the PDF file to download
 */
export async function generatePDFReport(
  screenshots: { canvas: HTMLCanvasElement; tabName: string }[],
  fileName: string = 'EWARS_Report.pdf'
): Promise<void> {
  if (screenshots.length === 0) {
    throw new Error('No screenshots to generate PDF');
  }

  // A4 page dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const usableWidth = pageWidth - 2 * margin;
  const usableHeight = pageHeight - 2 * margin - 15; // Extra space for title

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  for (let i = 0; i < screenshots.length; i++) {
    const { canvas, tabName } = screenshots[i];

    // Add new page for all screenshots except the first
    if (i > 0) {
      pdf.addPage();
    }

    // Add title for each section
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(tabName, margin, margin + 7);

    // Calculate dimensions to fit the canvas in the page
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let imgWidth = usableWidth;
    let imgHeight = imgWidth / canvasRatio;

    // If the image is too tall, scale by height instead
    if (imgHeight > usableHeight) {
      imgHeight = usableHeight;
      imgWidth = imgHeight * canvasRatio;
    }

    // Convert canvas to image and add to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', margin, margin + 12, imgWidth, imgHeight);

    // Add footer with page number
    pdf.setFontSize(9);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Page ${i + 1} of ${screenshots.length}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Download the PDF
  pdf.save(fileName);
}

/**
 * Wait for a specified duration
 * @param ms - Milliseconds to wait
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for images to load in an element
 * @param element - The HTML element containing images
 */
export async function waitForImagesToLoad(element: HTMLElement): Promise<void> {
  const images = element.getElementsByTagName('img');
  const promises: Promise<void>[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (!img.complete) {
      promises.push(
        new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve even on error to not block
        })
      );
    }
  }

  await Promise.all(promises);
}
