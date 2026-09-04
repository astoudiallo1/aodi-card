import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { del, put } from "@vercel/blob";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const ALLOWED_FOLDERS = new Set(["profiles", "products", "services", "projects", "gallery"]);

export type MediaFolder = "profiles" | "products" | "services" | "projects" | "gallery";

function assertFolder(folder: string): asserts folder is MediaFolder {
  if (!ALLOWED_FOLDERS.has(folder)) {
    throw new Error("Dossier media non autorise.");
  }
}

function getExtension(file: File) {
  return ALLOWED_IMAGE_TYPES.get(file.type);
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

  if (!getExtension(file)) {
    throw new Error("L'image doit etre au format JPG, PNG ou WebP.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("L'image ne doit pas depasser 5 Mo.");
  }
}

function createMediaPath(file: File, folder: MediaFolder) {
  const extension = getExtension(file);
  if (!extension) throw new Error("L'image doit etre au format JPG, PNG ou WebP.");
  return `${folder}/${crypto.randomUUID()}.${extension}`;
}

async function uploadToVercelBlob(file: File, folder: MediaFolder) {
  const blob = await put(createMediaPath(file, folder), file, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: false,
  });

  return blob.url;
}

async function uploadToLocalDisk(file: File, folder: MediaFolder) {
  const extension = getExtension(file);
  if (!extension) throw new Error("L'image doit etre au format JPG, PNG ou WebP.");

  const uploadDir = getUploadDir(folder);
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${crypto.randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));

  return getPublicUploadPath(folder, fileName);
}

export async function uploadMedia(file: File, folder: MediaFolder = "profiles"): Promise<string | null> {
  if (!file || file.size === 0) {
    return null;
  }

  assertFolder(folder);
  validateMedia(file);

  if (hasBlobCredentials()) {
    return uploadToVercelBlob(file, folder);
  }

  if (isVercelRuntimeWithoutPersistentStorage()) {
    throw new Error("Le stockage Vercel Blob n'est pas configure. Connectez le Blob Store au projet Vercel pour fournir BLOB_STORE_ID/OIDC, ou configurez BLOB_READ_WRITE_TOKEN en mode legacy.");
  }

  return uploadToLocalDisk(file, folder);
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
