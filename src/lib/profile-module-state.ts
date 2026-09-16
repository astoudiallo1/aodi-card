import { prisma } from "@/lib/prisma";
import { ALL_SECTION_TYPES, emptyProfileModuleUsage, type ProfileModuleContext, type ProfileSectionState, type ProfileModuleUsage } from "@/lib/profile-modules";
import { readYouTubeChannelConfig } from "@/lib/youtube";
import type { ProfileSectionType, ProfileType } from "@/types/profile";

/**
 * Etat reel des modules d'un profil (type d'experience, sections configurees, contenu existant).
 * Utilise par la navigation admin et la page Configuration : un module qui contient deja des donnees
 * ne doit jamais disparaitre, quel que soit le type d'experience choisi.
 */

type SectionRow = ProfileSectionState & { config: unknown };

async function getSections(profileId: string): Promise<SectionRow[]> {
  const rows = await prisma.profileSection.findMany({
    where: { profileId },
    select: { type: true, enabled: true, sortOrder: true, title: true, config: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((row) => ({ type: row.type as ProfileSectionType, enabled: row.enabled, sortOrder: row.sortOrder, title: row.title, config: row.config }));
}

async function getUsage(profileId: string, sections: SectionRow[]): Promise<ProfileModuleUsage> {
  const where = { profileId };
  const [products, services, projects, gallery, music, events, stats] = await Promise.all([
    prisma.product.count({ where }),
    prisma.service.count({ where }),
    prisma.project.count({ where }),
    prisma.galleryItem.count({ where }),
    prisma.musicTrack.count({ where }),
    prisma.profileEvent.count({ where }),
    prisma.profileStat.count({ where }),
  ]);

  // Une chaine YouTube configuree compte comme du contenu (Musique ou Videos) : elle doit rester accessible depuis l'admin.
  const hasChannel = (type: ProfileSectionType) => Boolean(readYouTubeChannelConfig(sections.find((section) => section.type === type)?.config ?? null).youtubeChannelUrl);
  // Table creee par la migration videos_artists_modules : comptee a part pour ne pas masquer les autres modules si elle manque encore.
  const artists = await prisma.managedArtist.count({ where }).catch(() => 0);

  return { products, services, projects, gallery, music: music + (hasChannel("MUSIC") ? 1 : 0), videos: hasChannel("VIDEOS") ? 1 : 0, artists, events, stats };
}

/** Valeurs presentes dans l'enum PostgreSQL ProfileSectionType (la base de production peut etre en retard d'une migration). */
export async function getAvailableSectionTypes(): Promise<Set<ProfileSectionType>> {
  try {
    const rows = await prisma.$queryRaw<{ enumlabel: string }[]>`
      SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'ProfileSectionType'
    `;
    const known = new Set<string>(ALL_SECTION_TYPES);
    return new Set(rows.map((row) => row.enumlabel).filter((label): label is ProfileSectionType => known.has(label)));
  } catch {
    return new Set(ALL_SECTION_TYPES);
  }
}

/**
 * Ne lance jamais d'erreur : si une table manque (base pas encore migree), la navigation retombe sur les
 * modules recommandes du type, sans bloquer les pages admin.
 */
export async function getProfileModuleContext(profileId: string): Promise<ProfileModuleContext> {
  const profile = await prisma.profile.findUnique({ where: { id: profileId }, select: { profileType: true } });
  const profileType: ProfileType = profile?.profileType ?? "GENERAL";

  const availableSectionTypes = await getAvailableSectionTypes();

  try {
    const sectionsWithConfig = await getSections(profileId);
    const usage = await getUsage(profileId, sectionsWithConfig);
    const sections = sectionsWithConfig.map(({ type, enabled, sortOrder, title }) => ({ type, enabled, sortOrder, title }));
    return { profileType, usage, sections, availableSectionTypes };
  } catch (error) {
    console.warn("[profile-modules] etat des modules indisponible", { profileId, reason: error instanceof Error ? error.message : "unknown" });
    return { profileType, usage: emptyProfileModuleUsage(), sections: [], availableSectionTypes };
  }
}
