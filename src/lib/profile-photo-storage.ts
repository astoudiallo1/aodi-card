import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_PHOTO_SIZE = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

function isVercelRuntimeWithoutPersistentUploads() {
  return Boolean(process.env.VERCEL) && !process.env.AODI_UPLOADS_DIR;
}

function getUploadDir(folder: string) {
  const configuredDir = process.env.AODI_UPLOADS_DIR;

  if (configuredDir) {
    return path.join(configuredDir, folder);
  }

  return path.join(process.cwd(), "public", "uploads", folder);
}

function getPublicUploadPath(folder: string, fileName: string) {
  return `/uploads/${folder}/${fileName}`;
}

export async function saveUploadedImage(file: File, folder = "profiles"): Promise<string | null> {
  if (!file || file.size === 0) {
    return null;
  }

  const extension = ALLOWED_IMAGE_TYPES.get(file.type);

  if (!extension) {
    throw new Error("La photo doit etre une image JPG, PNG, WebP ou GIF.");
  }

  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error("La photo ne doit pas depasser 4 Mo.");
  }

  if (isVercelRuntimeWithoutPersistentUploads()) {
    return null;
  }

  const uploadDir = getUploadDir(folder);
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${crypto.randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));

  return getPublicUploadPath(folder, fileName);
}

export async function saveProfilePhoto(file: File): Promise<string | null> {
  return saveUploadedImage(file, "profiles");
}
