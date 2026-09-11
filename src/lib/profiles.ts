import { prisma } from "@/lib/prisma";
import type {
  ProfileLookup,
  ProfileSectionType,
  ProfileType,
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
import { Prisma } from "@prisma/client";

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
  profileType: ProfileType | null;
  tagline: string | null;
  tags: string[] | null;
  appointmentUrl: string | null;
  finalCtaLabel: string | null;
  finalCtaUrl: string | null;
  heroImagePosition: string | null;
  coverImagePosition: string | null;
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

const PROFILE_TYPES: ProfileType[] = ["GENERAL", "CORPORATE", "ARCHITECTURE", "COMMERCE", "MUSIC", "ACTOR_CREATOR", "TECH", "CRAFT"];

const DEFAULT_SECTION_ORDER: ProfileSectionType[] = [
  "SOCIALS",
  "CONTACT",
  "STATS",
  "SERVICES",
  "PROJECTS",
  "PRODUCTS",
  "MUSIC",
  "EVENTS",
  "GALLERY",
  "CUSTOM_LINKS",
  "ABOUT",
];

const PROFILE_TYPE_SECTION_ORDER: Record<ProfileType, ProfileSectionType[]> = {
  GENERAL: DEFAULT_SECTION_ORDER,
  CORPORATE: ["SOCIALS", "CONTACT", "STATS", "SERVICES", "PROJECTS", "GALLERY", "EVENTS", "CUSTOM_LINKS", "ABOUT", "PRODUCTS", "MUSIC"],
  ARCHITECTURE: ["SOCIALS", "CONTACT", "STATS", "SERVICES", "PROJECTS", "GALLERY", "EVENTS", "CUSTOM_LINKS", "ABOUT", "PRODUCTS", "MUSIC"],
  COMMERCE: ["SOCIALS", "CONTACT", "STATS", "PRODUCTS", "GALLERY", "SERVICES", "PROJECTS", "CUSTOM_LINKS", "ABOUT", "EVENTS", "MUSIC"],
  MUSIC: ["SOCIALS", "CONTACT", "STATS", "MUSIC", "EVENTS", "GALLERY", "PRODUCTS", "CUSTOM_LINKS", "ABOUT", "PROJECTS", "SERVICES"],
  ACTOR_CREATOR: ["SOCIALS", "CONTACT", "STATS", "PROJECTS", "EVENTS", "GALLERY", "CUSTOM_LINKS", "ABOUT", "SERVICES", "PRODUCTS", "MUSIC"],
  TECH: ["SOCIALS", "CONTACT", "STATS", "SERVICES", "PROJECTS", "CUSTOM_LINKS", "GALLERY", "ABOUT", "PRODUCTS", "EVENTS", "MUSIC"],
  CRAFT: ["SOCIALS", "CONTACT", "STATS", "SERVICES", "PROJECTS", "GALLERY", "PRODUCTS", "CUSTOM_LINKS", "ABOUT", "EVENTS", "MUSIC"],
};

async function getTableColumns(tableName: string) {
  const rows = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${tableName}
  `;
  return new Set(rows.map((row) => row.column_name));
}

async function tableHasColumns(tableName: string, columns: string[]) {
  const availableColumns = await getTableColumns(tableName);
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

function profileColumn(columns: Set<string>, name: string, fallbackSql: Prisma.Sql) {
  return columns.has(name) ? Prisma.raw(`"${name}"`) : fallbackSql;
}

async function getProfileRowBySlug(slug: string): Promise<ProfileRow | null> {
  const columns = await getTableColumns("Profile");
  const [profile] = await prisma.$queryRaw<ProfileRow[]>`
    SELECT
      "id", "firstName", "lastName", "displayName", "slug", "jobTitle", "company", "bio", "profilePhoto", "coverPhoto",
      ${profileColumn(columns, "profileType", Prisma.sql`'GENERAL'`)}::text AS "profileType",
      ${profileColumn(columns, "tagline", Prisma.sql`NULL`)} AS "tagline",
      ${profileColumn(columns, "tags", Prisma.sql`ARRAY[]::TEXT[]`)} AS "tags",
      ${profileColumn(columns, "appointmentUrl", Prisma.sql`NULL`)} AS "appointmentUrl",
      ${profileColumn(columns, "finalCtaLabel", Prisma.sql`NULL`)} AS "finalCtaLabel",
      ${profileColumn(columns, "finalCtaUrl", Prisma.sql`NULL`)} AS "finalCtaUrl",
      ${profileColumn(columns, "heroImagePosition", Prisma.sql`'center'`)} AS "heroImagePosition",
      ${profileColumn(columns, "coverImagePosition", Prisma.sql`'center'`)} AS "coverImagePosition",
      "phone", "whatsapp", "email", "instagram", "facebook", "linkedin", "tiktok", "snapchat", "website", "address", "isActive"
    FROM "Profile"
    WHERE "slug" = ${slug}
    LIMIT 1
  `;
  return profile ?? null;
}

async function getProducts(profileId: string): Promise<PublicProduct[]> {
  if (!(await tableHasColumns("Product", ["id", "name", "price", "oldPrice", "currency", "imageUrl", "whatsappNumber", "orderUrl", "isFeatured", "isAvailable", "isVisible", "isActive", "displayOrder", "createdAt"]))) return [];
  return prisma.$queryRaw<PublicProduct[]>`
    SELECT "id", "name", "description", "price", "oldPrice", "currency", "imageUrl", "whatsappNumber", "orderUrl", "isFeatured", "isAvailable"
    FROM "Product"
    WHERE "profileId" = ${profileId} AND "isVisible" = true AND "isActive" = true
    ORDER BY "isFeatured" DESC, "displayOrder" ASC, "createdAt" DESC
    LIMIT 4
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
    LIMIT 6
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
    LIMIT 4
  `;
}

async function getEvents(profileId: string): Promise<PublicProfileEvent[]> {
  if (!(await tableExists("ProfileEvent"))) return [];
  return prisma.$queryRaw<PublicProfileEvent[]>`
    SELECT "id", "title", "description", "location", "startDate", "endDate", "externalUrl", "imageUrl"
    FROM "ProfileEvent"
    WHERE "profileId" = ${profileId} AND "isVisible" = true
    ORDER BY "startDate" ASC, "sortOrder" ASC
    LIMIT 4
  `;
}

function normalizeProfileType(value: string | null): ProfileType {
  return PROFILE_TYPES.includes(value as ProfileType) ? (value as ProfileType) : "GENERAL";
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
      return Boolean(profile.finalCtaUrl || profile.appointmentUrl || profile.whatsapp || profile.email || profile.phone);
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
  const order = PROFILE_TYPE_SECTION_ORDER[normalizeProfileType(profile.profileType)];
  return order
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
    profileType: normalizeProfileType(profile.profileType),
    tagline: profile.tagline,
    tags: profile.tags ?? [],
    appointmentUrl: profile.appointmentUrl,
    finalCtaLabel: profile.finalCtaLabel,
    finalCtaUrl: profile.finalCtaUrl,
    heroImagePosition: profile.heroImagePosition ?? "center",
    coverImagePosition: profile.coverImagePosition ?? "center",
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
  const profile = await getProfileRowBySlug(normalizedSlug);

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