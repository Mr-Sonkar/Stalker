import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates the image buffer and type.
 * Returns an error message if invalid, otherwise null.
 */
export function validateImageForOCR(buffer: Buffer, mimeType: string): string | null {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return `Unsupported file type: ${mimeType}. Allowed: JPEG, PNG, WebP.`;
  }
  if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
    return `Image size exceeds the 10MB limit (size: ${(buffer.length / 1024 / 1024).toFixed(2)}MB).`;
  }
  return null;
}

/**
 * Runs OCR on an image buffer with a hard timeout and minimum confidence threshold.
 */
export async function extractTextFromImage(buffer: Buffer): Promise<OCRResult> {
  const OCR_TIMEOUT_MS = 20000; // 20 seconds
  const MIN_CONFIDENCE = 60; // 60%

  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout;
    let worker: Tesseract.Worker | null = null;

    const cleanup = async () => {
      clearTimeout(timeoutId);
      if (worker) {
        try {
          await worker.terminate();
        } catch (e) {
          console.error("Error terminating Tesseract worker", e);
        }
      }
    };

    timeoutId = setTimeout(async () => {
      await cleanup();
      reject(new Error(`OCR timed out after ${OCR_TIMEOUT_MS / 1000} seconds.`));
    }, OCR_TIMEOUT_MS);

    (async () => {
      try {
        worker = await Tesseract.createWorker('eng');
        const { data: { text, confidence } } = await worker.recognize(buffer);
        
        await cleanup();
        
        if (confidence < MIN_CONFIDENCE) {
          resolve({ text: '', confidence }); // Discard text if confidence is too low
        } else {
          resolve({ text, confidence });
        }
      } catch (error) {
        await cleanup();
        reject(error);
      }
    })();
  });
}
