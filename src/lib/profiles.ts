import { prisma } from "@/lib/prisma";
import type { ProfileLookup, PublicProfile } from "@/types/profile";

type PublicProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
};

type PublicProfileWithProducts = PublicProfile & { products: PublicProduct[] };

type ProfileRow = {
  firstName: string;
  lastName: string;
  displayName: string;
  slug: string;
  jobTitle: string | null;
  company: string | null;
  bio: string | null;
  profilePhoto: string | null;
  coverPhoto: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  tiktok: string | null;
  snapchat: string | null;
  website: string | null;
  address: string | null;
  isActive: boolean;
};

async function tableExists(tableName: string) {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${tableName}
    ) AS "exists"
  `;

  return Boolean(rows[0]?.exists);
}

async function getProducts(profileId: string): Promise<PublicProduct[]> {
  if (!(await tableExists("Product"))) {
    return [];
  }

  return prisma.$queryRaw<PublicProduct[]>`
    SELECT "id", "name", "description", "price", "currency", "imageUrl"
    FROM "Product"
    WHERE "profileId" = ${profileId} AND "isActive" = true
    ORDER BY "createdAt" DESC
  `;
}

function toPublicProfile(profile: ProfileRow, products: PublicProduct[]): PublicProfileWithProducts {
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
    products,
  };
}

export async function lookupProfileBySlug(slug: string): Promise<ProfileLookup> {
  const normalizedSlug = slug.trim().toLowerCase();

  const profile = await prisma.profile.findUnique({
    where: { slug: normalizedSlug },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      displayName: true,
      slug: true,
      jobTitle: true,
      company: true,
      bio: true,
      profilePhoto: true,
      coverPhoto: true,
      phone: true,
      whatsapp: true,
      email: true,
      instagram: true,
      facebook: true,
      linkedin: true,
      tiktok: true,
      snapchat: true,
      website: true,
      address: true,
      isActive: true,
    },
  });

  if (!profile) {
    return { status: "missing" as const };
  }

  if (!profile.isActive) {
    return { status: "inactive" as const };
  }

  const products = await getProducts(profile.id);

  return { status: "found" as const, profile: toPublicProfile(profile, products) };
}

export async function getPublicProfileBySlug(
  slug: string,
): Promise<PublicProfile | null> {
  const result = await lookupProfileBySlug(slug);
  return result.status === "found" ? result.profile : null;
}