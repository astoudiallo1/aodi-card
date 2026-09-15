import { prisma } from "@/lib/prisma";
import { emptyProfileModuleUsage, type ProfileModuleContext, type ProfileSectionState, type ProfileModuleUsage } from "@/lib/profile-modules";
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

  // Une chaine YouTube configuree compte comme du contenu Musique : elle doit rester accessible depuis l'admin.
  const musicSection = sections.find((section) => section.type === "MUSIC");
  const hasYouTubeChannel = Boolean(readYouTubeChannelConfig(musicSection?.config ?? null).youtubeChannelUrl);

  return { products, services, projects, gallery, music: music + (hasYouTubeChannel ? 1 : 0), events, stats };
}

/**
 * Ne lance jamais d'erreur : si une table manque (base pas encore migree), la navigation retombe sur les
 * modules recommandes du type, sans bloquer les pages admin.
 */
export async function getProfileModuleContext(profileId: string): Promise<ProfileModuleContext> {
  const profile = await prisma.profile.findUnique({ where: { id: profileId }, select: { profileType: true } });
  const profileType: ProfileType = profile?.profileType ?? "GENERAL";

  try {
    const sectionsWithConfig = await getSections(profileId);
    const usage = await getUsage(profileId, sectionsWithConfig);
    const sections = sectionsWithConfig.map(({ type, enabled, sortOrder, title }) => ({ type, enabled, sortOrder, title }));
    return { profileType, usage, sections };
  } catch (error) {
    console.warn("[profile-modules] etat des modules indisponible", { profileId, reason: error instanceof Error ? error.message : "unknown" });
    return { profileType, usage: emptyProfileModuleUsage(), sections: [] };
  }
}
