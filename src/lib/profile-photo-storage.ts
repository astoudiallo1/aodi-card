import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_PHOTO_SIZE = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function saveProfilePhoto(file: File): Promise<string | null> {
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

  const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${crypto.randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));

  return `/uploads/profiles/${fileName}`;
}
