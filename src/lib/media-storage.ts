import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { del, put } from "@vercel/blob";
import { FormError } from "@/lib/form-error";
import { ImageOptimizationError, MAX_INPUT_IMAGE_BYTES, MAX_INPUT_IMAGE_LABEL, optimizeImage, type OptimizedImage } from "@/lib/image-optimizer";

// Limite d'entree (fichier original) : l'image est ensuite optimisee (voir image-optimizer.ts) avant stockage.
export const MAX_IMAGE_SIZE = MAX_INPUT_IMAGE_BYTES;

export const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const ALLOWED_FOLDERS = new Set(["profiles", "products", "services", "projects", "gallery", "music", "events", "artists"]);

export type MediaFolder = "profiles" | "products" | "services" | "projects" | "gallery" | "music" | "events" | "artists";

function assertFolder(folder: string): asserts folder is MediaFolder {
  if (!ALLOWED_FOLDERS.has(folder)) {
    throw new FormError("Dossier media non autorise.");
  }
}

function isAllowedType(file: File) {
  return ALLOWED_IMAGE_TYPES.has(file.type);
}

function hasBlobCredentials() {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

function isVercelRuntimeWithoutPersistentStorage() {
  return Boolean(process.env.VERCEL) && !hasBlobCredentials();
}

function getUploadDir(folder: MediaFolder) {
  const configuredDir = process.env.AODI_UPLOADS_DIR;
  return configuredDir ? path.join(configuredDir, folder) : path.join(process.cwd(), "public", "uploads", folder);
}

export function getPublicUploadPath(folder: MediaFolder, fileName: string) {
  return `/uploads/${folder}/${fileName}`;
}

export function validateMedia(file: File) {
  if (!file || file.size === 0) {
    return;
  }

  if (!isAllowedType(file)) {
    throw new FormError("L'image doit etre au format JPG, PNG ou WebP.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new FormError(`L'image ne doit pas depasser ${MAX_INPUT_IMAGE_LABEL}.`);
  }
}

// Nom de fichier genere cote serveur : le nom d'origine n'est jamais utilise comme chemin.
function createMediaFileName(image: OptimizedImage) {
  return `${crypto.randomUUID()}.${image.extension}`;
}

async function uploadToVercelBlob(image: OptimizedImage, folder: MediaFolder) {
  const blob = await put(`${folder}/${createMediaFileName(image)}`, image.buffer, {
    access: "public",
    contentType: image.contentType,
    addRandomSuffix: false,
  });

  return blob.url;
}

async function uploadToLocalDisk(image: OptimizedImage, folder: MediaFolder) {
  const uploadDir = getUploadDir(folder);
  await mkdir(uploadDir, { recursive: true });

  const fileName = createMediaFileName(image);
  await writeFile(path.join(uploadDir, fileName), image.buffer);

  return getPublicUploadPath(folder, fileName);
}

// Valide le contenu reel puis optimise (orientation, dimensions, compression) avant le stockage.
async function prepareImage(file: File, folder: MediaFolder): Promise<OptimizedImage> {
  try {
    const image = await optimizeImage(Buffer.from(await file.arrayBuffer()), folder);
    console.info("[media] image prete", { folder, from: image.originalBytes, to: image.bytes, size: `${image.width}x${image.height}`, type: image.contentType, optimized: image.optimized });
    return image;
  } catch (error) {
    if (error instanceof ImageOptimizationError) throw new FormError(error.message);
    console.error("[media] preparation de l'image impossible", { folder, error });
    throw new FormError("L'image n'a pas pu etre traitee. Reessaie avec un autre fichier JPG, PNG ou WebP.");
  }
}

export async function uploadMedia(file: File, folder: MediaFolder = "profiles"): Promise<string | null> {
  if (!file || file.size === 0) {
    return null;
  }

  assertFolder(folder);
  validateMedia(file);
  const image = await prepareImage(file, folder);

  if (hasBlobCredentials()) {
    try {
      return await uploadToVercelBlob(image, folder);
    } catch (error) {
      console.error("[media] upload Vercel Blob impossible", { folder, error });
      throw new FormError("Le stockage de l'image a echoue. Reessaie dans quelques instants.");
    }
  }

  if (isVercelRuntimeWithoutPersistentStorage()) {
    throw new FormError("Le stockage Vercel Blob n'est pas configure. Connectez le Blob Store au projet Vercel pour fournir BLOB_STORE_ID/OIDC, ou configurez BLOB_READ_WRITE_TOKEN en mode legacy.");
  }

  return uploadToLocalDisk(image, folder);
}

function isLocalUploadUrl(url: string) {
  return url.startsWith("/uploads/");
}

export async function deleteMedia(url: string | null | undefined): Promise<void> {
  if (!url) return;

  if (hasBlobCredentials() && url.includes(".blob.vercel-storage.com/")) {
    await del(url).catch(() => undefined);
    return;
  }

  if (isLocalUploadUrl(url)) {
    const localPath = path.join(process.cwd(), "public", url);
    await unlink(localPath).catch(() => undefined);
  }
}

export const saveUploadedImage = uploadMedia;
