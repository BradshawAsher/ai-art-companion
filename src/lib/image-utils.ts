export const ACCEPTED_IMAGE_TYPES =
  "image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml,image/bmp,image/tiff,image/avif,image/heic,image/heif,.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp,.tif,.tiff,.avif,.heic,.heif";

const MODEL_SAFE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|svg|bmp|tiff?|avif|heic|heif)$/i.test(file.name);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read this image file."));
    img.src = src;
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export interface NormalizedImage {
  dataUrl: string;
  base64: string;
  mimeType: string;
}

/**
 * Accepts any common image format and returns a model-safe PNG/JPEG payload.
 * SVG, BMP, TIFF, AVIF, HEIC and friends are rasterized to PNG in a canvas.
 */
export async function normalizeImage(file: File): Promise<NormalizedImage> {
  const original = await readAsDataUrl(file);
  const type = file.type || "";

  if (MODEL_SAFE_TYPES.includes(type)) {
    return { dataUrl: original, base64: original.split(",")[1] ?? "", mimeType: type };
  }

  // Rasterize everything else through a canvas.
  const img = await loadImage(original);
  const maxSide = 2048;
  const width = img.naturalWidth || img.width || 1024;
  const height = img.naturalHeight || img.height || 1024;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process this image format.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/png");
  return { dataUrl, base64: dataUrl.split(",")[1] ?? "", mimeType: "image/png" };
}

export function downloadDataUrl(dataUrl: string, filename = "download.png") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
