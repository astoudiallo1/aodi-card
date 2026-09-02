import { prisma } from "@/lib/prisma";
import type { ProfileLookup, PublicProfile } from "@/types/profile";
import type { Profile } from "@prisma/client";

function toPublicProfile(profile: Profile): PublicProfile {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    displayName: profile.displayName,
    slug: profile.slug,
    jobTitle: profile.jobTitle,
    company: profile.company,
    bio: profile.bio,
    profilePhoto: profile.profilePhoto,
    coverPhoto: profile.coverPhoto,
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    email: profile.email,
    instagram: profile.instagram,
    facebook: profile.facebook,
    linkedin: profile.linkedin,
    tiktok: profile.tiktok,
    snapchat: profile.snapchat,
    website: profile.website,
    address: profile.address,
  };
}

export async function lookupProfileBySlug(slug: string): Promise<ProfileLookup> {
  const profile = await prisma.profile.findUnique({
    where: { slug },
  });

  if (!profile) {
    return { status: "missing" };
  }

  if (!profile.isActive) {
    return { status: "inactive" };
  }

  return { status: "found", profile: toPublicProfile(profile) };
}

export async function getPublicProfileBySlug(
  slug: string,
): Promise<PublicProfile | null> {
  const result = await lookupProfileBySlug(slug);
  return result.status === "found" ? result.profile : null;
}

