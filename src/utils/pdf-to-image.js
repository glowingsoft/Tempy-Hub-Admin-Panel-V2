import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

// Set worker source for pdfjs
if (pdfjsLib?.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    pdfWorker || 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

/**
 * Converts a PDF File, Blob, or URL to an image data URL and object URL.
 * Renders page 1 of the PDF onto a canvas at high resolution.
 * If the input is already an image, returns it directly as an image object.
 *
 * @param {File|Blob|string|ArrayBuffer} input
 * @param {object} [options]
 * @param {number} [options.scale=2.0] - Scale multiplier for crisp rendering
 * @returns {Promise<{ imageUrl: string, dataUrl: string, blob: Blob, width: number, height: number, aspectRatio: number }>}
 */
export async function convertPdfToImage(input, options = {}) {
  const { scale = 2.0 } = options;

  // If already an image file/blob
  if (input instanceof File || input instanceof Blob) {
    if (input.type && input.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(input);
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const width = img.naturalWidth || 1000;
          const height = img.naturalHeight || 650;
          const aspectRatio = width / height;
          const pageObj = {
            pageNumber: 1,
            imageUrl,
            dataUrl: imageUrl,
            blob: input,
            width,
            height,
            aspectRatio,
          };
          resolve({
            imageUrl,
            dataUrl: imageUrl,
            blob: input,
            width,
            height,
            aspectRatio,
            numPages: 1,
            pages: [pageObj],
          });
        };
        img.onerror = () => {
          const pageObj = {
            pageNumber: 1,
            imageUrl,
            dataUrl: imageUrl,
            blob: input,
            width: 1000,
            height: 650,
            aspectRatio: 1.55,
          };
          resolve({
            imageUrl,
            dataUrl: imageUrl,
            blob: input,
            width: 1000,
            height: 650,
            aspectRatio: 1.55,
            numPages: 1,
            pages: [pageObj],
          });
        };
        img.src = imageUrl;
      });
    }
  }

  let arrayBuffer;
  if (input instanceof ArrayBuffer) {
    arrayBuffer = input;
  } else if (input instanceof Uint8Array) {
    arrayBuffer = input.buffer;
  } else if (input instanceof Blob || input instanceof File) {
    arrayBuffer = await input.arrayBuffer();
  } else if (typeof input === 'string') {
    // If it's already an image URL or data URL
    if (
      input.startsWith('data:image/') ||
      input.endsWith('.png') ||
      input.endsWith('.jpg') ||
      input.endsWith('.jpeg') ||
      input.endsWith('.webp') ||
      input.endsWith('.svg')
    ) {
      const pageObj = {
        pageNumber: 1,
        imageUrl: input,
        dataUrl: input,
        width: 1000,
        height: 650,
        aspectRatio: 1.55,
      };
      return {
        imageUrl: input,
        dataUrl: input,
        width: 1000,
        height: 650,
        aspectRatio: 1.55,
        numPages: 1,
        pages: [pageObj],
      };
    }
    const response = await fetch(input);
    arrayBuffer = await response.arrayBuffer();
  } else {
    throw new Error('Unsupported input type for PDF conversion');
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages || 1;
  const pages = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext('2d', { alpha: false });

    // Fill canvas with white background so transparent PDFs don't appear black
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: context,
      viewport,
    };

    await page.render(renderContext).promise;

    const dataUrl = canvas.toDataURL('image/png');
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/png', 0.95)
    );
    const imageUrl = blob ? URL.createObjectURL(blob) : dataUrl;

    pages.push({
      pageNumber: pageNum,
      imageUrl,
      dataUrl,
      blob,
      canvas,
      width: viewport.width,
      height: viewport.height,
      aspectRatio: viewport.width / viewport.height,
    });
  }

  if (numPages === 1) {
    const firstPage = pages[0] || {};
    return {
      imageUrl: firstPage.imageUrl || '',
      dataUrl: firstPage.dataUrl || '',
      blob: firstPage.blob,
      width: firstPage.width || 1000,
      height: firstPage.height || 650,
      aspectRatio: firstPage.aspectRatio || 1.55,
      numPages: 1,
      pages,
    };
  }

  // Multi-page PDF: combine all pages vertically into one high-resolution composite floor plan image
  const maxWidth = Math.max(...pages.map((p) => p.width));
  const pageGap = 20;
  const sumHeight = pages.reduce((sum, p) => sum + p.height, 0);
  const totalHeight = sumHeight + pageGap * (numPages - 1);
  const totalWidth = maxWidth;

  const masterCanvas = document.createElement('canvas');
  masterCanvas.width = totalWidth;
  masterCanvas.height = totalHeight;

  const masterCtx = masterCanvas.getContext('2d', { alpha: false });
  masterCtx.fillStyle = '#FFFFFF';
  masterCtx.fillRect(0, 0, totalWidth, totalHeight);

  let currentY = 0;
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const offsetX = Math.round((maxWidth - p.width) / 2);

    masterCtx.fillStyle = '#FFFFFF';
    masterCtx.fillRect(offsetX, currentY, p.width, p.height);
    masterCtx.drawImage(p.canvas, offsetX, currentY);

    if (i < pages.length - 1) {
      masterCtx.fillStyle = '#E5E7EB';
      masterCtx.fillRect(0, currentY + p.height, totalWidth, pageGap);
    }

    currentY += p.height + pageGap;
  }

  const compositeDataUrl = masterCanvas.toDataURL('image/png');
  const compositeBlob = await new Promise((resolve) =>
    masterCanvas.toBlob(resolve, 'image/png', 0.95)
  );
  const compositeImageUrl = compositeBlob ? URL.createObjectURL(compositeBlob) : compositeDataUrl;

  return {
    imageUrl: compositeImageUrl,
    dataUrl: compositeDataUrl,
    blob: compositeBlob,
    width: totalWidth,
    height: totalHeight,
    aspectRatio: totalWidth / totalHeight,
    numPages,
    pages,
  };
}
