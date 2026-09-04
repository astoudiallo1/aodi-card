import { prisma } from "@/lib/prisma";
import type { PublicCustomLink, PublicGalleryItem, PublicProduct, PublicProfile, PublicProject, PublicService, ProfileLookup } from "@/types/profile";

type ProfileRow = {
  id: string;
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

async function tableHasColumns(tableName: string, columns: string[]) {
  const rows = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${tableName}
  `;
  const availableColumns = new Set(rows.map((row) => row.column_name));
  return columns.every((column) => availableColumns.has(column));
}

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
  if (!(await tableHasColumns("Product", ["id", "name", "price", "oldPrice", "currency", "imageUrl", "whatsappNumber", "orderUrl", "isFeatured", "isAvailable", "isVisible", "displayOrder", "createdAt"]))) return [];
  return prisma.$queryRaw<PublicProduct[]>`
    SELECT "id", "name", "description", "price", "oldPrice", "currency", "imageUrl", "whatsappNumber", "orderUrl", "isFeatured", "isAvailable"
    FROM "Product"
    WHERE "profileId" = ${profileId} AND "isVisible" = true
    ORDER BY "displayOrder" ASC, "createdAt" DESC
  `;
}

async function getServices(profileId: string): Promise<PublicService[]> {
  if (!(await tableExists("Service"))) return [];
  return prisma.$queryRaw<PublicService[]>`
    SELECT "id", "name", "description", "price", "currency", "imageUrl", "ctaLabel", "ctaUrl"
    FROM "Service"
    WHERE "profileId" = ${profileId} AND "isVisible" = true
    ORDER BY "displayOrder" ASC, "createdAt" DESC
  `;
}

async function getProjects(profileId: string): Promise<PublicProject[]> {
  if (!(await tableExists("Project"))) return [];
  return prisma.$queryRaw<PublicProject[]>`
    SELECT "id", "title", "description", "imageUrl", "websiteUrl", "appUrl", "githubUrl", "technologies", "isFeatured"
    FROM "Project"
    WHERE "profileId" = ${profileId} AND "isVisible" = true
    ORDER BY "displayOrder" ASC, "createdAt" DESC
  `;
}

async function getGalleryItems(profileId: string): Promise<PublicGalleryItem[]> {
  if (!(await tableExists("GalleryItem"))) return [];
  return prisma.$queryRaw<PublicGalleryItem[]>`
    SELECT "id", "title", "imageUrl", "description"
    FROM "GalleryItem"
    WHERE "profileId" = ${profileId} AND "isVisible" = true
    ORDER BY "displayOrder" ASC, "createdAt" DESC
  `;
}

async function getCustomLinks(profileId: string): Promise<PublicCustomLink[]> {
  if (!(await tableExists("CustomLink"))) return [];
  return prisma.$queryRaw<PublicCustomLink[]>`
    SELECT "id", "label", "url", "icon"
    FROM "CustomLink"
    WHERE "profileId" = ${profileId} AND "isVisible" = true
    ORDER BY "displayOrder" ASC, "createdAt" DESC
  `;
}

function toPublicProfile(profile: ProfileRow, modules: { products: PublicProduct[]; services: PublicService[]; projects: PublicProject[]; galleryItems: PublicGalleryItem[]; customLinks: PublicCustomLink[] }): PublicProfile {
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
    products: modules.products,
    services: modules.services,
    projects: modules.projects,
    galleryItems: modules.galleryItems,
    customLinks: modules.customLinks,
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

  if (!profile) return { status: "missing" };
  if (!profile.isActive) return { status: "inactive" };

  const [products, services, projects, galleryItems, customLinks] = await Promise.all([
    getProducts(profile.id),
    getServices(profile.id),
    getProjects(profile.id),
    getGalleryItems(profile.id),
    getCustomLinks(profile.id),
  ]);

  return { status: "found", profile: toPublicProfile(profile, { products, services, projects, galleryItems, customLinks }) };
}

export async function getPublicProfileBySlug(slug: string): Promise<PublicProfile | null> {
  const result = await lookupProfileBySlug(slug);
  return result.status === "found" ? result.profile : null;
}