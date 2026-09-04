export { saveUploadedImage } from "@/lib/media-storage";

export async function saveProfilePhoto(file: File): Promise<string | null> {
  const { saveUploadedImage } = await import("@/lib/media-storage");
  return saveUploadedImage(file, "profiles");
}