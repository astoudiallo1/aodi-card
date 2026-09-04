"use server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { saveProfilePhoto } from "@/lib/profile-photo-storage";
import { generateUniqueProfileSlug } from "@/lib/slug";
import { Prisma } from "@prisma/client";
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

function logCreateProfileStep(step: string, details: Record<string, unknown> = {}) {
  console.info("[AODI createProfileAction]", step, details);
}

function getDatabaseRuntimeFlags() {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  return {
    configured: databaseUrl.length > 0,
    localhost: /localhost|127\.0\.0\.1/i.test(databaseUrl),
    neon: /neon\.tech/i.test(databaseUrl),
    ssl: /sslmode=require|ssl=true/i.test(databaseUrl),
    pooled: /pooler/i.test(databaseUrl),
  };
}

async function getProfileColumns() {
  const rows = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Profile'
  `;

  return new Set(rows.map((row) => row.column_name));
}

async function createProfileRecord({
  input,
  slug,
  profilePhoto,
  coverPhoto,
}: {
  input: ProfileInput;
  slug: string;
  profilePhoto: string | null;
  coverPhoto: string | null;
}) {
  const availableColumns = await getProfileColumns();
  const now = new Date();
  const record: Record<string, string | boolean | Date | null> = {
    id: crypto.randomUUID(),
    firstName: input.firstName,
    lastName: input.lastName,
    displayName: input.displayName,
    slug,
    jobTitle: input.jobTitle,
    company: input.company,
    bio: input.bio,
    profilePhoto,
    coverPhoto,
    phone: input.phone,
    whatsapp: input.whatsapp,
    email: input.email,
    instagram: input.instagram,
    facebook: input.facebook,
    linkedin: input.linkedin,
    tiktok: input.tiktok,
    snapchat: input.snapchat,
    website: input.website,
    address: input.address,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  if (availableColumns.has("ownerToken")) {
    record.ownerToken = crypto.randomUUID();
  }

  const entries = Object.entries(record).filter(([column]) => availableColumns.has(column));

  if (!availableColumns.has("slug") || entries.length === 0) {
    throw new Error("Schema Profile invalide: colonne slug introuvable.");
  }

  const columnsSql = Prisma.join(entries.map(([column]) => Prisma.raw(`"${column}"`)));
  const valuesSql = Prisma.join(entries.map(([, value]) => value));
  const [profile] = await prisma.$queryRaw<{ slug: string }[]>`
    INSERT INTO "Profile" (${columnsSql})
    VALUES (${valuesSql})
    RETURNING "slug"
  `;

  if (!profile) {
    throw new Error("La creation du profil n'a retourne aucun slug.");
  }

  return profile;
}

export async function createProfileAction(formData: FormData) {
  logCreateProfileStep("start", { database: getDatabaseRuntimeFlags() });
  await requireAdminAccess();

  const input = readProfileInput(formData);
  logCreateProfileStep("validated", {
    displayName: input.displayName,
    hasProfilePhoto: formData.has("profilePhoto"),
    hasCoverPhoto: formData.has("coverPhoto"),
  });
  const slug = await generateUniqueProfileSlug(input.displayName);
  const profilePhoto = await readUploadedFile(formData, "profilePhoto");
  const coverPhoto = await readUploadedFile(formData, "coverPhoto");

  logCreateProfileStep("before-create", { slug, hasProfilePhoto: Boolean(profilePhoto), hasCoverPhoto: Boolean(coverPhoto) });
  const profile = await createProfileRecord({ input, slug, profilePhoto, coverPhoto });
  logCreateProfileStep("after-create", { slug: profile.slug });

  revalidatePath("/admin");
  revalidatePath("/admin/profiles");
  revalidatePath(`/${profile.slug}`);
  logCreateProfileStep("redirect", { slug: profile.slug });
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
