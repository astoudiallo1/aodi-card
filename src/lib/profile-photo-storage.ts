export { saveUploadedImage, type MediaFolder } from "@/lib/media-storage";

export async function saveProfilePhoto(file: File): Promise<string | null> {
  const { uploadMedia } = await import("@/lib/media-storage");
  return uploadMedia(file, "profiles");
}
