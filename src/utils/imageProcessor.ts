import { ImageFilterSettings } from '../types';

export const DEFAULT_FILTER_SETTINGS: ImageFilterSettings = {
  binarize: false,
  threshold: 140,
  invert: false,
  removeBg: false,
  removeBgTolerance: 20, // 0 to 100
  contrast: 100, // 100 = 100%
  brightness: 0, // -100 to 100
};

// Process an image with filters using an offscreen canvas
export async function processImageWithFilters(
  sourceUrl: string,
  filters: ImageFilterSettings
): Promise<string> {
  // If all filters are off and defaults, return original
  if (
    !filters.binarize &&
    !filters.invert &&
    !filters.removeBg &&
    filters.contrast === 100 &&
    filters.brightness === 0
  ) {
    return sourceUrl;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(sourceUrl);
          return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        const contrastFactor =
          (259 * (filters.contrast + 255)) / (255 * (259 - filters.contrast));
        const brightnessOffset = filters.brightness * 1.28; // scale -100~100 to -128~128
        const thresholdVal = filters.threshold;
        const bgTolerance = (filters.removeBgTolerance / 100) * 255;

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];
          let a = data[i + 3];

          // If pixel is already transparent, skip
          if (a === 0) continue;

          // 1. Brightness & Contrast
          if (filters.brightness !== 0) {
            r = Math.min(255, Math.max(0, r + brightnessOffset));
            g = Math.min(255, Math.max(0, g + brightnessOffset));
            b = Math.min(255, Math.max(0, b + brightnessOffset));
          }

          if (filters.contrast !== 100) {
            r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
            g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
            b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));
          }

          // Grayscale luminance (ITU-R BT.709)
          const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

          // 2. Remove White Background if enabled
          if (filters.removeBg) {
            const isWhite =
              r >= 255 - bgTolerance &&
              g >= 255 - bgTolerance &&
              b >= 255 - bgTolerance;
            if (isWhite) {
              data[i + 3] = 0; // make transparent
              continue;
            }
          }

          // 3. Binarization (Crisp Black/White for Flash Stamping)
          if (filters.binarize) {
            const finalVal = gray < thresholdVal ? 0 : 255;
            r = finalVal;
            g = finalVal;
            b = finalVal;
          }

          // 4. Invert (Black to White, White to Black)
          if (filters.invert) {
            r = 255 - r;
            g = 255 - g;
            b = 255 - b;
          }

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = a;
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Image processing error:', err);
        resolve(sourceUrl);
      }
    };
    img.onerror = () => resolve(sourceUrl);
    img.src = sourceUrl;
  });
}

// Read image metadata from File or URL
export function readImageDimensions(
  src: string
): Promise<{ width: number; height: number; aspectRatio: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const width = img.naturalWidth || img.width || 300;
      const height = img.naturalHeight || img.height || 300;
      resolve({
        width,
        height,
        aspectRatio: width / height,
      });
    };
    img.onerror = (e) => {
      reject(e);
    };
    img.src = src;
  });
}
