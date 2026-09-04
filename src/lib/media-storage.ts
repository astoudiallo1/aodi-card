import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

function isVercelRuntimeWithoutPersistentStorage() {
  return Boolean(process.env.VERCEL) && !process.env.AODI_UPLOADS_DIR;
}

function getUploadDir(folder: string) {
  const configuredDir = process.env.AODI_UPLOADS_DIR;
  return configuredDir ? path.join(configuredDir, folder) : path.join(process.cwd(), "public", "uploads", folder);
}

export function getPublicUploadPath(folder: string, fileName: string) {
  return `/uploads/${folder}/${fileName}`;
}

export async function saveUploadedImage(file: File, folder = "profiles"): Promise<string | null> {
  if (!file || file.size === 0) {
    return null;
  }

  const extension = ALLOWED_IMAGE_TYPES.get(file.type);

  if (!extension) {
    throw new Error("L'image doit etre au format JPG, PNG, WebP ou GIF.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("L'image ne doit pas depasser 4 Mo.");
  }

  if (isVercelRuntimeWithoutPersistentStorage()) {
    return null;
  }

  const uploadDir = getUploadDir(folder);
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${crypto.randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));

  return getPublicUploadPath(folder, fileName);
}