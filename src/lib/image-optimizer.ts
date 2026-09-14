import sharp, { type Metadata } from "sharp";
import type { MediaFolder } from "@/lib/media-storage";

/**
 * Optimisation serveur des images avant stockage (Vercel Blob ou disque local).
 * - le contenu reel est verifie (signature du fichier), jamais seulement l'extension/MIME declare ;
 * - orientation EXIF corrigee, metadonnees retirees, ratio conserve, jamais agrandi ;
 * - sortie JPEG (mozjpeg) pour les images opaques, PNG quand la transparence est reelle ;
 * - une image deja legere et aux bonnes dimensions est conservee telle quelle.
 */

export const MAX_INPUT_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_INPUT_IMAGE_LABEL = "15 Mo";

const JPEG_QUALITY = 82;
const KEEP_ORIGINAL_MAX_BYTES = 600 * 1024;
const MAX_INPUT_PIXELS = 50_000_000;

// Cote le plus long (px) par usage : une affiche/galerie garde plus de resolution qu'une pochette ou un produit.
export const IMAGE_PRESETS: Record<MediaFolder, { maxDimension: number }> = {
  profiles: { maxDimension: 2000 },
  events: { maxDimension: 2400 },
  gallery: { maxDimension: 2400 },
  projects: { maxDimension: 2400 },
  services: { maxDimension: 2000 },
  products: { maxDimension: 1600 },
  music: { maxDimension: 1500 },
};

const ORIGINAL_FORMATS = {
  jpeg: { contentType: "image/jpeg", extension: "jpg" },
  png: { contentType: "image/png", extension: "png" },
  webp: { contentType: "image/webp", extension: "webp" },
} as const;
const DECODABLE_FORMATS = new Set(Object.keys(ORIGINAL_FORMATS));

export type OptimizedImage = {
  buffer: Buffer;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
  width: number;
  height: number;
  originalBytes: number;
  bytes: number;
  optimized: boolean;
};

export class ImageOptimizationError extends Error {}

const INVALID_IMAGE_MESSAGE = "Le fichier n'est pas une image valide (JPG, PNG ou WebP).";

async function readMetadata(input: Buffer) {
  try {
    const metadata = await sharp(input, { failOn: "error", limitInputPixels: MAX_INPUT_PIXELS }).metadata();
    if (!metadata.format || !DECODABLE_FORMATS.has(metadata.format) || !metadata.width || !metadata.height) {
      throw new ImageOptimizationError(INVALID_IMAGE_MESSAGE);
    }
    return metadata;
  } catch (error) {
    if (error instanceof ImageOptimizationError) throw error;
    const message = error instanceof Error ? error.message : "";
    if (/pixel limit|too large/i.test(message)) throw new ImageOptimizationError("L'image est trop grande (dimensions excessives).");
    throw new ImageOptimizationError(INVALID_IMAGE_MESSAGE);
  }
}

// Un canal alpha entierement opaque (frequent sur les exports PNG) ne justifie pas de conserver le PNG.
async function hasRealTransparency(input: Buffer, metadata: Metadata) {
  if (!metadata.hasAlpha || metadata.format === "jpeg") return false;
  try {
    const stats = await sharp(input, { failOn: "error", limitInputPixels: MAX_INPUT_PIXELS }).stats();
    return !stats.isOpaque;
  } catch {
    return true;
  }
}

// Decodage complet : un fichier tronque ou corrompu n'est jamais stocke tel quel.
async function decodes(input: Buffer) {
  try {
    await sharp(input, { failOn: "error", limitInputPixels: MAX_INPUT_PIXELS }).stats();
    return true;
  } catch {
    return false;
  }
}

function orientedSize(metadata: Metadata) {
  // Les orientations EXIF 5 a 8 echangent largeur et hauteur une fois l'image redressee.
  const swapped = (metadata.orientation ?? 1) >= 5;
  return { width: swapped ? metadata.height! : metadata.width!, height: swapped ? metadata.width! : metadata.height! };
}

export async function optimizeImage(input: Buffer, folder: MediaFolder): Promise<OptimizedImage> {
  if (input.byteLength === 0) throw new ImageOptimizationError(INVALID_IMAGE_MESSAGE);
  if (input.byteLength > MAX_INPUT_IMAGE_BYTES) throw new ImageOptimizationError(`L'image ne doit pas depasser ${MAX_INPUT_IMAGE_LABEL}.`);

  const metadata = await readMetadata(input);
  const { maxDimension } = IMAGE_PRESETS[folder];
  const { width, height } = orientedSize(metadata);
  const needsResize = Math.max(width, height) > maxDimension;
  const keepsAlpha = await hasRealTransparency(input, metadata);
  const original = ORIGINAL_FORMATS[metadata.format as keyof typeof ORIGINAL_FORMATS];
  const untouched: OptimizedImage = { buffer: input, contentType: original.contentType, extension: original.extension, width, height, originalBytes: input.byteLength, bytes: input.byteLength, optimized: false };

  // Deja legere, aux bonnes dimensions et decodable : on ne degrade pas inutilement.
  if (!needsResize && input.byteLength <= KEEP_ORIGINAL_MAX_BYTES && (await decodes(input))) {
    return untouched;
  }

  try {
    let pipeline = sharp(input, { failOn: "error", limitInputPixels: MAX_INPUT_PIXELS }).rotate();
    if (needsResize) pipeline = pipeline.resize({ width: maxDimension, height: maxDimension, fit: "inside", withoutEnlargement: true });
    pipeline = keepsAlpha ? pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }) : pipeline.flatten({ background: "#ffffff" }).jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true });

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    const contentType = keepsAlpha ? "image/png" : "image/jpeg";
    const extension = keepsAlpha ? "png" : "jpg";

    // Un re-encodage qui alourdit une image deja optimisee (sans redimensionnement) n'apporte rien : on garde l'original.
    if (!needsResize && data.byteLength >= input.byteLength) return untouched;

    return { buffer: data, contentType, extension, width: info.width, height: info.height, originalBytes: input.byteLength, bytes: data.byteLength, optimized: true };
  } catch (error) {
    console.error("[media] optimisation impossible", { folder, format: metadata.format, error: error instanceof Error ? error.message : error });
    throw new ImageOptimizationError("L'image n'a pas pu etre optimisee. Verifie qu'elle n'est pas corrompue puis reessaie.");
  }
}
