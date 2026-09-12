import { requireAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { ProfileType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };
type ProfileRef = { id: string; slug: string };
type ImagePosition = "center" | "top" | "bottom" | "left" | "right";

const PROFILE_TYPES = new Set<ProfileType>(Object.values(ProfileType));
const IMAGE_POSITIONS = new Set<ImagePosition>(["center", "top", "bottom", "left", "right"]);

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalUrl(formData: FormData, key: string, label: string): string | null {
  const raw = optionalString(formData, key);
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${label} doit etre une URL valide.`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${label} doit commencer par http:// ou https://.`);
  }

  return url.toString();
}

function profileTypeValue(formData: FormData): ProfileType {
  const value = optionalString(formData, "profileType") ?? ProfileType.GENERAL;
  if (!PROFILE_TYPES.has(value as ProfileType)) {
    throw new Error("Type d experience non autorise.");
  }

  return value as ProfileType;
}

function tagsValue(formData: FormData) {
  const value = optionalString(formData, "tags");
  if (!value) return [];
  return value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 6);
}

function imagePositionValue(formData: FormData, key: string): ImagePosition {
  const value = optionalString(formData, key) ?? "center";
  if (!IMAGE_POSITIONS.has(value as ImagePosition)) {
    throw new Error("Position d image non autorisee.");
  }

  return value as ImagePosition;
}

function revalidateProfile(profile: ProfileRef) {
  revalidatePath("/admin");
  revalidatePath("/admin/profiles");
  revalidatePath(`/admin/profiles/${profile.id}`);
  revalidatePath(`/admin/profiles/${profile.id}/config`);
  revalidatePath(`/${profile.slug}`);
}

export async function POST(request: NextRequest, context: RouteContext) {
  await requireAdminAccess();
  const { id } = await context.params;
  const formData = await request.formData();

  const profile = await prisma.profile.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });

  if (!profile) {
    return NextResponse.redirect(new URL("/admin/profiles", request.url), { status: 303 });
  }

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      profileType: profileTypeValue(formData),
      tagline: optionalString(formData, "tagline"),
      tags: tagsValue(formData),
      appointmentUrl: optionalUrl(formData, "appointmentUrl", "L'URL rendez-vous"),
      finalCtaLabel: optionalString(formData, "finalCtaLabel"),
      finalCtaUrl: optionalUrl(formData, "finalCtaUrl", "L'URL du CTA final"),
      heroImagePosition: imagePositionValue(formData, "heroImagePosition"),
      coverImagePosition: imagePositionValue(formData, "coverImagePosition"),
    },
  });

  try {
    revalidateProfile(profile);
  } catch (error) {
    console.error("[profile-experience] revalidate failed", { profileId: profile.id, error });
  }

  return NextResponse.redirect(new URL(`/admin/profiles/${profile.id}/config`, request.url), { status: 303 });
}