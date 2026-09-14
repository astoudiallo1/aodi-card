/**
 * Optimisation d'image cote navigateur, avant l'envoi du formulaire.
 *
 * Les uploads passent par des Server Actions dont le corps est limite (Next `bodySizeLimit`, plafond Vercel 4,5 Mo) :
 * une image lourde est donc redimensionnee/compressee ici, puis re-verifiee et optimisee cote serveur
 * (voir `image-optimizer.ts`). Sans JavaScript ou si le navigateur ne le permet pas, le fichier original est envoye.
 */

export const BROWSER_MAX_INPUT_BYTES = 15 * 1024 * 1024;
export const BROWSER_MAX_INPUT_LABEL = "15 Mo";
export const IMAGE_HELP_TEXT = `JPG, PNG ou WebP - ${BROWSER_MAX_INPUT_LABEL} maximum, optimisee automatiquement`;

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_DIMENSION = 2400;
const TARGET_MAX_BYTES = 3 * 1024 * 1024;
const KEEP_ORIGINAL_MAX_BYTES = 1024 * 1024;
const JPEG_QUALITIES = [0.85, 0.78, 0.7];
const WEBP_QUALITIES = [0.85, 0.78, 0.7];

export type PreparedImage = {
  file: File;
  optimized: boolean;
  width: number;
  height: number;
  originalBytes: number;
};

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.has(file.type)) return "L'image doit etre au format JPG, PNG ou WebP.";
  if (file.size > BROWSER_MAX_INPUT_BYTES) return `L'image ne doit pas depasser ${BROWSER_MAX_INPUT_LABEL}.`;
  return null;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} Mo`;
}

function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "image";
}

async function readDimensions(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("decode"));
      image.src = url;
    });
    return { image, width: image.naturalWidth, height: image.naturalHeight, release: () => URL.revokeObjectURL(url) };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

async function decodeBitmap(file: File, image: HTMLImageElement, width: number, height: number) {
  // Decodage directement a la taille cible quand le navigateur le permet (moins de memoire sur mobile).
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { resizeWidth: width, resizeHeight: height, resizeQuality: "high", imageOrientation: "from-image" });
    } catch {
      try {
        return await createImageBitmap(file, { imageOrientation: "from-image" });
      } catch {
        /* repli sur l'element <img> */
      }
    }
  }
  return image;
}

function hasTransparency(source: CanvasImageSource, width: number, height: number) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return false;
  context.drawImage(source, 0, 0, width, height, 0, 0, size, size);
  const { data } = context.getImageData(0, 0, size, size);
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] < 250) return true;
  }
  return false;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
  const validation = validateImageFile(file);
  if (validation) throw new Error(validation);

  let dimensions: Awaited<ReturnType<typeof readDimensions>>;
  try {
    dimensions = await readDimensions(file);
  } catch {
    throw new Error("Impossible de lire cette image. Le fichier est peut-etre corrompu.");
  }

  try {
    const { image, width: sourceWidth, height: sourceHeight } = dimensions;
    if (!sourceWidth || !sourceHeight) throw new Error("Impossible de lire cette image. Le fichier est peut-etre corrompu.");

    const scale = Math.min(1, MAX_DIMENSION / Math.max(sourceWidth, sourceHeight));
    if (scale === 1 && file.size <= KEEP_ORIGINAL_MAX_BYTES) {
      return { file, optimized: false, width: sourceWidth, height: sourceHeight, originalBytes: file.size };
    }

    let width = Math.max(1, Math.round(sourceWidth * scale));
    let height = Math.max(1, Math.round(sourceHeight * scale));
    const bitmap = await decodeBitmap(file, image, width, height);
    const bitmapWidth = bitmap.width || sourceWidth;
    const bitmapHeight = bitmap.height || sourceHeight;
    const transparent = file.type !== "image/jpeg" && hasTransparency(bitmap, bitmapWidth, bitmapHeight);
    const outputType = transparent ? "image/webp" : "image/jpeg";

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas");

    let blob: Blob | null = null;
    // Qualite decroissante puis dimension reduite jusqu'a passer sous la limite d'envoi.
    for (let attempt = 0; attempt < 6 && !blob; attempt++) {
      canvas.width = width;
      canvas.height = height;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      if (!transparent) {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
      }
      context.drawImage(bitmap, 0, 0, bitmapWidth, bitmapHeight, 0, 0, width, height);

      const qualities = transparent ? WEBP_QUALITIES : JPEG_QUALITIES;
      const quality = qualities[Math.min(attempt, qualities.length - 1)];
      const candidate = await toBlob(canvas, outputType, quality);
      if (!candidate) throw new Error("encode");
      if (candidate.size <= TARGET_MAX_BYTES) blob = candidate;
      else if (attempt >= qualities.length - 1) {
        width = Math.max(1, Math.round(width * 0.8));
        height = Math.max(1, Math.round(height * 0.8));
      }
    }
    if ("close" in bitmap) bitmap.close();
    if (!blob) throw new Error("encode");

    // Un original deja compact ne doit pas etre remplace par une version plus lourde.
    if (scale === 1 && file.size <= TARGET_MAX_BYTES && blob.size >= file.size) {
      return { file, optimized: false, width: sourceWidth, height: sourceHeight, originalBytes: file.size };
    }

    const extension = outputType === "image/webp" ? "webp" : "jpg";
    const optimizedFile = new File([blob], `${baseName(file.name)}.${extension}`, { type: outputType, lastModified: Date.now() });
    return { file: optimizedFile, optimized: true, width, height, originalBytes: file.size };
  } finally {
    dimensions.release();
  }
}

/** Remplace le fichier selectionne dans l'input pour que le formulaire envoie la version optimisee. */
export function replaceInputFile(input: HTMLInputElement, file: File) {
  try {
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    return input.files?.[0] === file || input.files?.[0]?.size === file.size;
  } catch {
    return false;
  }
}
