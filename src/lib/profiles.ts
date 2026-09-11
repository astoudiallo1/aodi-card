import { prisma } from "@/lib/prisma";
import type {
  ProfileLookup,
  ProfileSectionType,
  PublicCustomLink,
  PublicGalleryItem,
  PublicMusicTrack,
  PublicProduct,
  PublicProfile,
  PublicProfileEvent,
  PublicProfileSection,
  PublicProfileStat,
  PublicProject,
  PublicService,
} from "@/types/profile";

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

type ProfileModules = {
  products: PublicProduct[];
  services: PublicService[];
  projects: PublicProject[];
  galleryItems: PublicGalleryItem[];
  customLinks: PublicCustomLink[];
  stats: PublicProfileStat[];
  musicTracks: PublicMusicTrack[];
  events: PublicProfileEvent[];
  sections: PublicProfileSection[];
};

const DEFAULT_SECTION_ORDER: ProfileSectionType[] = [
  "SOCIALS",
  "CONTACT",
  "STATS",
  "MUSIC",
  "EVENTS",
  "SERVICES",
  "PROJECTS",
  "PRODUCTS",
  "GALLERY",
  "CUSTOM_LINKS",
  "ABOUT",
];

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
  if (!(await tableHasColumns("Product", ["id", "name", "price", "oldPrice", "currency", "imageUrl", "whatsappNumber", "orderUrl", "isFeatured", "isAvailable", "isVisible", "isActive", "displayOrder", "createdAt"]))) return [];
  return prisma.$queryRaw<PublicProduct[]>`
    SELECT "id", "name", "description", "price", "oldPrice", "currency", "imageUrl", "whatsappNumber", "orderUrl", "isFeatured", "isAvailable"
    FROM "Product"
    WHERE "profileId" = ${profileId} AND "isVisible" = true AND "isActive" = true
    ORDER BY "isFeatured" DESC, "displayOrder" ASC, "createdAt" DESC
    LIMIT 3
  `;
}

async function getServices(profileId: string): Promise<PublicService[]> {
  if (!(await tableExists("Service"))) return [];
  return prisma.$queryRaw<PublicService[]>`
    SELECT "id", "name", "description", "price", "currency", "imageUrl", "ctaLabel", "ctaUrl"
    FROM "Service"
    WHERE "profileId" = ${profileId} AND "isVisible" = true
    ORDER BY "displayOrder" ASC, "createdAt" DESC
    LIMIT 4
  `;
}

async function getProjects(profileId: string): Promise<PublicProject[]> {
  if (!(await tableExists("Project"))) return [];
  return prisma.$queryRaw<PublicProject[]>`
    SELECT "id", "title", "description", "imageUrl", "websiteUrl", "appUrl", "githubUrl", "technologies", "isFeatured"
    FROM "Project"
    WHERE "profileId" = ${profileId} AND "isVisible" = true
    ORDER BY "isFeatured" DESC, "displayOrder" ASC, "createdAt" DESC
    LIMIT 4
  `;
}

async function getGalleryItems(profileId: string): Promise<PublicGalleryItem[]> {
  if (!(await tableExists("GalleryItem"))) return [];
  return prisma.$queryRaw<PublicGalleryItem[]>`
    SELECT "id", "title", "imageUrl", "description"
    FROM "GalleryItem"
    WHERE "profileId" = ${profileId} AND "isVisible" = true
    ORDER BY "displayOrder" ASC, "createdAt" DESC
    LIMIT 8
  `;
}

async function getCustomLinks(profileId: string): Promise<PublicCustomLink[]> {
  if (!(await tableExists("CustomLink"))) return [];
  return prisma.$queryRaw<PublicCustomLink[]>`
    SELECT "id", "label", "url", "icon"
    FROM "CustomLink"
    WHERE "profileId" = ${profileId} AND "isVisible" = true
    ORDER BY "displayOrder" ASC, "createdAt" DESC
    LIMIT 8
  `;
}

async function getStats(profileId: string): Promise<PublicProfileStat[]> {
  if (!(await tableExists("ProfileStat"))) return [];
  return prisma.$queryRaw<PublicProfileStat[]>`
    SELECT "id", "label", "value", "icon"
    FROM "ProfileStat"
    WHERE "profileId" = ${profileId} AND "isVisible" = true
    ORDER BY "sortOrder" ASC, "createdAt" ASC
    LIMIT 4
  `;
}

async function getMusicTracks(profileId: string): Promise<PublicMusicTrack[]> {
  if (!(await tableExists("MusicTrack"))) return [];
  return prisma.$queryRaw<PublicMusicTrack[]>`
    SELECT "id", "title", "artist", "coverUrl", "audioUrl", "spotifyUrl", "appleUrl", "youtubeUrl", "duration", "isFeatured", "releaseDate"
    FROM "MusicTrack"
    WHERE "profileId" = ${profileId} AND "isVisible" = true
    ORDER BY "isFeatured" DESC, "sortOrder" ASC, "releaseDate" DESC NULLS LAST, "createdAt" DESC
    LIMIT 3
  `;
}

async function getEvents(profileId: string): Promise<PublicProfileEvent[]> {
  if (!(await tableExists("ProfileEvent"))) return [];
  return prisma.$queryRaw<PublicProfileEvent[]>`
    SELECT "id", "title", "description", "location", "startDate", "endDate", "externalUrl", "imageUrl"
    FROM "ProfileEvent"
    WHERE "profileId" = ${profileId} AND "isVisible" = true
    ORDER BY "startDate" ASC, "sortOrder" ASC
    LIMIT 3
  `;
}

function hasSocials(profile: ProfileRow) {
  return Boolean(profile.whatsapp || profile.instagram || profile.facebook || profile.linkedin || profile.tiktok || profile.snapchat || profile.website || profile.email);
}

function hasContact(profile: ProfileRow) {
  return Boolean(profile.phone || profile.whatsapp || profile.email || profile.address || profile.website);
}

function sectionHasContent(type: ProfileSectionType, profile: ProfileRow, modules: Omit<ProfileModules, "sections">) {
  switch (type) {
    case "SOCIALS":
      return hasSocials(profile);
    case "CONTACT":
      return hasContact(profile);
    case "SERVICES":
      return modules.services.length > 0;
    case "PRODUCTS":
      return modules.products.length > 0;
    case "PROJECTS":
      return modules.projects.length > 0;
    case "GALLERY":
      return modules.galleryItems.length > 0;
    case "CUSTOM_LINKS":
      return modules.customLinks.length > 0;
    case "MUSIC":
      return modules.musicTracks.length > 0;
    case "EVENTS":
      return modules.events.length > 0;
    case "STATS":
      return modules.stats.length > 0;
    case "ABOUT":
      return Boolean(profile.bio);
    case "CTA":
      return hasContact(profile);
    default:
      return false;
  }
}

async function getConfiguredSections(profileId: string): Promise<PublicProfileSection[]> {
  if (!(await tableExists("ProfileSection"))) return [];
  return prisma.$queryRaw<PublicProfileSection[]>`
    SELECT "id", "type"::text AS "type", "enabled", "sortOrder", "title", "config"
    FROM "ProfileSection"
    WHERE "profileId" = ${profileId}
    ORDER BY "sortOrder" ASC, "createdAt" ASC
  `;
}

function buildFallbackSections(profile: ProfileRow, modules: Omit<ProfileModules, "sections">): PublicProfileSection[] {
  return DEFAULT_SECTION_ORDER
    .map((type, index) => ({ id: `fallback-${type}`, type, enabled: true, sortOrder: (index + 1) * 10, title: null, config: null }))
    .filter((section) => sectionHasContent(section.type, profile, modules));
}

function buildSections(profile: ProfileRow, modules: Omit<ProfileModules, "sections">, configuredSections: PublicProfileSection[]) {
  const source = configuredSections.length > 0 ? configuredSections.filter((section) => section.enabled) : buildFallbackSections(profile, modules);
  return source
    .filter((section) => sectionHasContent(section.type, profile, modules))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function toPublicProfile(profile: ProfileRow, modules: ProfileModules): PublicProfile {
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
    sections: modules.sections,
    stats: modules.stats,
    musicTracks: modules.musicTracks,
    events: modules.events,
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

  const [products, services, projects, galleryItems, customLinks, stats, musicTracks, events, configuredSections] = await Promise.all([
    getProducts(profile.id),
    getServices(profile.id),
    getProjects(profile.id),
    getGalleryItems(profile.id),
    getCustomLinks(profile.id),
    getStats(profile.id),
    getMusicTracks(profile.id),
    getEvents(profile.id),
    getConfiguredSections(profile.id),
  ]);

  const moduleData = { products, services, projects, galleryItems, customLinks, stats, musicTracks, events };
  const sections = buildSections(profile, moduleData, configuredSections);

  return { status: "found", profile: toPublicProfile(profile, { ...moduleData, sections }) };
}

export async function getPublicProfileBySlug(slug: string): Promise<PublicProfile | null> {
  const result = await lookupProfileBySlug(slug);
  return result.status === "found" ? result.profile : null;
}
