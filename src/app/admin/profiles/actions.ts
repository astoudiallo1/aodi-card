"use server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { saveProfilePhoto } from "@/lib/profile-photo-storage";
import { generateUniqueProfileSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ProfileInput = {
  firstName: string;
  lastName: string;
  displayName: string;
  jobTitle: string | null;
  company: string | null;
  bio: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  snapchat: string | null;
  tiktok: string | null;
  facebook: string | null;
  linkedin: string | null;
  website: string | null;
  address: string | null;
};

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requiredString(formData: FormData, key: string, label: string): string {
  const value = optionalString(formData, key);

  if (!value) {
    throw new Error(`${label} est obligatoire.`);
  }

  return value;
}

function readProfileInput(formData: FormData): ProfileInput {
  return {
    firstName: requiredString(formData, "firstName", "Le prenom"),
    lastName: requiredString(formData, "lastName", "Le nom"),
    displayName: requiredString(formData, "displayName", "Le nom affiche"),
    jobTitle: optionalString(formData, "jobTitle"),
    company: optionalString(formData, "company"),
    bio: optionalString(formData, "bio"),
    phone: optionalString(formData, "phone"),
    whatsapp: optionalString(formData, "whatsapp"),
    email: optionalString(formData, "email"),
    instagram: optionalString(formData, "instagram"),
    snapchat: optionalString(formData, "snapchat"),
    tiktok: optionalString(formData, "tiktok"),
    facebook: optionalString(formData, "facebook"),
    linkedin: optionalString(formData, "linkedin"),
    website: optionalString(formData, "website"),
    address: optionalString(formData, "address"),
  };
}

async function readUploadedFile(formData: FormData, key: string): Promise<string | null> {
  const file = formData.get(key);

  if (!(file instanceof File)) {
    return null;
  }

  return saveProfilePhoto(file);
}

export async function createProfileAction(formData: FormData) {
  await requireAdminAccess();

  const input = readProfileInput(formData);
  const slug = await generateUniqueProfileSlug(input.displayName);
  const profilePhoto = await readUploadedFile(formData, "profilePhoto");
  const coverPhoto = await readUploadedFile(formData, "coverPhoto");

  const profile = await prisma.profile.create({
    data: {
      ...input,
      slug,
      profilePhoto,
      coverPhoto,
      isActive: true,
    },
    select: { slug: true },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/profiles");
  revalidatePath(`/${profile.slug}`);
  redirect(`/admin/profiles/created?slug=${encodeURIComponent(profile.slug)}`);
}

export async function updateProfileAction(id: string, formData: FormData) {
  await requireAdminAccess();

  const input = readProfileInput(formData);
  const profilePhoto = await readUploadedFile(formData, "profilePhoto");
  const coverPhoto = await readUploadedFile(formData, "coverPhoto");

  const profile = await prisma.profile.update({
    where: { id },
    data: {
      ...input,
      ...(profilePhoto ? { profilePhoto } : {}),
      ...(coverPhoto ? { coverPhoto } : {}),
    },
    select: { slug: true },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/profiles");
  revalidatePath(`/${profile.slug}`);
  redirect("/admin/profiles");
}

export async function toggleProfileStatusAction(id: string) {
  await requireAdminAccess();

  const current = await prisma.profile.findUnique({
    where: { id },
    select: { isActive: true, slug: true },
  });

  if (!current) {
    throw new Error("Profil introuvable.");
  }

  await prisma.profile.update({
    where: { id },
    data: { isActive: !current.isActive },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/profiles");
  revalidatePath(`/${current.slug}`);
}
