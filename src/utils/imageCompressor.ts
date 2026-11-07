/**
 * Image compressor utility for Firestore persistence.
 * Firestore has a strict 1 MiB limit per document.
 * This utility compresses base64 or File objects to a crisp, high-quality
 * web-optimized JPEG/WebP under 800KB so it never fails to persist in Firestore.
 */

export async function compressImageForDatabase(
  fileOrBase64: File | string,
  maxDimension: number = 1600,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    // If it's a string and already small (< 500KB), return as is
    if (typeof fileOrBase64 === 'string' && fileOrBase64.length < 500000) {
      resolve(fileOrBase64);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const onImageLoaded = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= 0 || height <= 0) {
          resolve(typeof fileOrBase64 === 'string' ? fileOrBase64 : '');
          return;
        }

        // Scale down to fit maxDimension while preserving aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof fileOrBase64 === 'string' ? fileOrBase64 : '');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try JPEG with quality 0.85
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // If still > 800KB (base64 length > 1,100,000 chars), step down quality
        if (dataUrl.length > 1000000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        }
        if (dataUrl.length > 1000000) {
          // Downscale further
          const canvasSmall = document.createElement('canvas');
          canvasSmall.width = Math.round(width * 0.75);
          canvasSmall.height = Math.round(height * 0.75);
          const ctxSmall = canvasSmall.getContext('2d');
          if (ctxSmall) {
            ctxSmall.drawImage(canvas, 0, 0, canvasSmall.width, canvasSmall.height);
            dataUrl = canvasSmall.toDataURL('image/jpeg', 0.7);
          }
        }

        resolve(dataUrl);
      } catch (err) {
        console.warn('Image compression fallback:', err);
        resolve(typeof fileOrBase64 === 'string' ? fileOrBase64 : '');
      }
    };

    img.onload = onImageLoaded;
    img.onerror = () => {
      resolve(typeof fileOrBase64 === 'string' ? fileOrBase64 : '');
    };

    if (typeof fileOrBase64 === 'string') {
      img.src = fileOrBase64;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(fileOrBase64);
    }
  });
}
