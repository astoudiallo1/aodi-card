import { managedArtistChannelColumns, managedArtistChannelConfig } from "@/lib/managed-artists";
import { prisma } from "@/lib/prisma";
import {
  emptyYouTubeChannelConfig,
  parseYouTubeChannelInput,
  readYouTubeChannelConfig,
  resolveYouTubeChannel,
  revalidateYouTubeFeed,
  YouTubeInputError,
  youtubeHandleUrl,
  type YouTubeChannelConfig,
} from "@/lib/youtube";
import { Prisma, ProfileSectionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Couche admin partagee du module YouTube : saisie -> parsing -> resolution -> stockage -> revalidation.
 * Le moteur (`src/lib/youtube.ts`) reste unique ; cette couche ne fait que le brancher sur une cible :
 * une section de profil (MUSIC aujourd'hui, VIDEOS demain) ou tout autre porteur de `YouTubeChannelConfig`.
 * Aucune dependance au type d'experience : le meme flux sert tous les metiers.
 */

export type YouTubeSaveStatus = "saved" | "saved-feed" | "saved-no-api" | "saved-api-error" | "cleared" | "invalid" | "not-found" | "error";

const SAVE_STATUSES = new Set<YouTubeSaveStatus>(["saved", "saved-feed", "saved-no-api", "saved-api-error", "cleared", "invalid", "not-found", "error"]);

export function isYouTubeSaveStatus(value: unknown): value is YouTubeSaveStatus {
  return typeof value === "string" && SAVE_STATUSES.has(value as YouTubeSaveStatus);
}

export type YouTubeStatusTone = "success" | "warning" | "error" | "neutral";

export const youtubeStatusMessages: Record<YouTubeSaveStatus, { tone: YouTubeStatusTone; text: string }> = {
  saved: { tone: "success", text: "Chaine YouTube configuree. Les dernieres videos s'affichent automatiquement sur le profil public." },
  "saved-feed": { tone: "success", text: "Chaine enregistree. Sans YOUTUBE_API_KEY, les dernieres videos sont recuperees via le flux public YouTube." },
  "saved-no-api": { tone: "warning", text: "La chaine a ete enregistree, mais la synchronisation YouTube n'est pas encore configuree (YOUTUBE_API_KEY absente)." },
  "saved-api-error": { tone: "warning", text: "La chaine a ete enregistree, mais YouTube n'a pas repondu. La synchronisation sera retentee automatiquement." },
  cleared: { tone: "neutral", text: "Chaine YouTube retiree." },
  invalid: { tone: "error", text: "Lien YouTube invalide. Utilise une URL de type https://youtube.com/@artiste ou https://youtube.com/channel/UC..." },
  "not-found": { tone: "error", text: "Chaine YouTube introuvable. Verifie le lien de la chaine." },
  error: { tone: "error", text: "Impossible d'enregistrer la chaine pour le moment. Reessaie dans quelques instants." },
};

export type YouTubeChannelResolution =
  | { status: "invalid" | "not-found"; config: null }
  | { status: "saved" | "saved-feed" | "saved-no-api" | "saved-api-error"; config: YouTubeChannelConfig };

/**
 * Transforme une saisie brute (@handle, URL @handle ou URL channel/UC...) en configuration stockable.
 * Le statut retourne decrit la qualite de la resolution, independamment de la cible de stockage.
 */
export async function resolveYouTubeChannelConfig(rawValue: string): Promise<YouTubeChannelResolution> {
  let input;
  try {
    input = parseYouTubeChannelInput(rawValue);
  } catch (error) {
    if (error instanceof YouTubeInputError) return { status: "invalid", config: null };
    throw error;
  }

  const resolution = await resolveYouTubeChannel(input);
  if (resolution.status === "not_found") return { status: "not-found", config: null };

  const resolved = resolution.status === "resolved" ? resolution.channel : null;
  const handle = resolved?.handle ?? (input.kind === "handle" ? input.handle : null);
  const config: YouTubeChannelConfig = {
    youtubeChannelUrl: handle ? youtubeHandleUrl(handle) : input.url,
    youtubeChannelId: resolved?.channelId ?? (input.kind === "channelId" ? input.channelId : null),
    youtubeChannelTitle: resolved?.title ?? null,
    youtubeHandle: handle,
    youtubeUploadsPlaylistId: resolved?.uploadsPlaylistId ?? null,
  };

  if (resolved) return { status: "saved", config };
  if (resolution.status === "api_error") return { status: "saved-api-error", config };
  // Sans cle API, un ID de chaine reste synchronisable via le flux public ; un @handle ne peut pas etre resolu.
  return { status: config.youtubeChannelId ? "saved-feed" : "saved-no-api", config };
}

// Valeurs de creation d'une ligne ProfileSection quand la chaine est la premiere chose configuree.
// MUSIC conserve exactement ses valeurs historiques ("Dernieres sorties", ordre 40).
function sectionCreateDefaults(sectionType: ProfileSectionType): { sortOrder: number; title: string | null } {
  if (sectionType === ProfileSectionType.MUSIC) return { sortOrder: 40, title: "Dernieres sorties" };
  return { sortOrder: 75, title: null };
}

export async function readSectionYouTubeConfig(profileId: string, sectionType: ProfileSectionType): Promise<YouTubeChannelConfig> {
  const section = await prisma.profileSection.findUnique({
    where: { profileId_type: { profileId, type: sectionType } },
    select: { config: true },
  });
  return readYouTubeChannelConfig(section?.config ?? null);
}

// Les autres cles du config de la section sont conservees : seule la partie YouTube est remplacee.
export async function saveSectionYouTubeConfig(profileId: string, sectionType: ProfileSectionType, config: YouTubeChannelConfig) {
  const existing = await prisma.profileSection.findUnique({
    where: { profileId_type: { profileId, type: sectionType } },
    select: { config: true },
  });
  const previous = existing?.config && typeof existing.config === "object" && !Array.isArray(existing.config) ? existing.config : {};
  const nextConfig = { ...previous, ...config } satisfies Prisma.InputJsonObject;
  const defaults = sectionCreateDefaults(sectionType);

  await prisma.profileSection.upsert({
    where: { profileId_type: { profileId, type: sectionType } },
    create: { profileId, type: sectionType, enabled: true, sortOrder: defaults.sortOrder, title: defaults.title, config: nextConfig },
    update: { config: nextConfig },
  });
}

type ProfileRef = { id: string; slug: string };

function revalidateProfileYouTube(profile: ProfileRef) {
  revalidatePath(`/admin/profiles/${profile.id}`);
  revalidatePath(`/admin/profiles/${profile.id}/music`);
  revalidatePath(`/admin/profiles/${profile.id}/videos`);
  revalidatePath(`/admin/profiles/${profile.id}/config`);
  revalidatePath(`/${profile.slug}`);
}

/**
 * Traite le formulaire "chaine YouTube" d'une section de profil : saisie vide = retrait de la chaine.
 * Ne lance jamais d'erreur vers la route : renvoie un statut affichable.
 */
export async function submitSectionYouTubeChannel(profile: ProfileRef, sectionType: ProfileSectionType, rawValue: string | null): Promise<YouTubeSaveStatus> {
  try {
    if (!rawValue) {
      const previous = await readSectionYouTubeConfig(profile.id, sectionType);
      await saveSectionYouTubeConfig(profile.id, sectionType, emptyYouTubeChannelConfig());
      if (previous.youtubeChannelId || previous.youtubeHandle) revalidateYouTubeFeed(previous);
      revalidateProfileYouTube(profile);
      return "cleared";
    }

    const resolution = await resolveYouTubeChannelConfig(rawValue);
    if (!resolution.config) return resolution.status;

    await saveSectionYouTubeConfig(profile.id, sectionType, resolution.config);
    revalidateYouTubeFeed(resolution.config);
    revalidateProfileYouTube(profile);
    return resolution.status;
  } catch (error) {
    console.error("[youtube] enregistrement de la chaine impossible", { profileId: profile.id, sectionType, error });
    return "error";
  }
}

function revalidateProfileArtists(profile: ProfileRef, artistId: string) {
  revalidatePath(`/admin/profiles/${profile.id}`);
  revalidatePath(`/admin/profiles/${profile.id}/artists`);
  revalidatePath(`/admin/profiles/${profile.id}/artists/${artistId}/edit`);
  revalidatePath(`/${profile.slug}`);
}

/**
 * Meme flux que les sections, cible = un ManagedArtist : ses cinq colonnes de chaine recoivent
 * la configuration resolue par le moteur partage (aucun moteur specifique aux artistes).
 */
export async function submitArtistYouTubeChannel(profile: ProfileRef, artistId: string, rawValue: string | null): Promise<YouTubeSaveStatus> {
  try {
    const artist = await prisma.managedArtist.findUnique({ where: { id: artistId }, select: { profileId: true, youtubeChannelUrl: true, youtubeChannelId: true, youtubeChannelTitle: true, youtubeChannelHandle: true, youtubeUploadsPlaylistId: true } });
    if (!artist || artist.profileId !== profile.id) return "error";

    if (!rawValue) {
      const previous = managedArtistChannelConfig(artist);
      await prisma.managedArtist.update({ where: { id: artistId }, data: managedArtistChannelColumns(emptyYouTubeChannelConfig()) });
      if (previous.youtubeChannelId || previous.youtubeHandle) revalidateYouTubeFeed(previous);
      revalidateProfileArtists(profile, artistId);
      return "cleared";
    }

    const resolution = await resolveYouTubeChannelConfig(rawValue);
    if (!resolution.config) return resolution.status;

    await prisma.managedArtist.update({ where: { id: artistId }, data: managedArtistChannelColumns(resolution.config) });
    revalidateYouTubeFeed(resolution.config);
    revalidateProfileArtists(profile, artistId);
    return resolution.status;
  } catch (error) {
    console.error("[youtube] enregistrement de la chaine artiste impossible", { profileId: profile.id, artistId, error });
    return "error";
  }
}

export function optionalFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
