import { parseYouTubeVideoId, type YouTubeChannelConfig } from "@/lib/youtube";

/**
 * Pont entre un ManagedArtist et le moteur YouTube partage : les cinq colonnes de chaine de l'artiste
 * sont exactement les cinq champs de `YouTubeChannelConfig`. Aucun moteur specifique aux artistes.
 */

export type ManagedArtistChannelColumns = {
  youtubeChannelUrl: string | null;
  youtubeChannelId: string | null;
  youtubeChannelTitle: string | null;
  youtubeChannelHandle: string | null;
  youtubeUploadsPlaylistId: string | null;
};

export const MAX_FEATURED_VIDEOS = 6;

export function managedArtistChannelConfig(artist: ManagedArtistChannelColumns): YouTubeChannelConfig {
  return {
    youtubeChannelUrl: artist.youtubeChannelUrl,
    youtubeChannelId: artist.youtubeChannelId,
    youtubeChannelTitle: artist.youtubeChannelTitle,
    youtubeHandle: artist.youtubeChannelHandle,
    youtubeUploadsPlaylistId: artist.youtubeUploadsPlaylistId,
  };
}

export function managedArtistChannelColumns(config: YouTubeChannelConfig): ManagedArtistChannelColumns {
  return {
    youtubeChannelUrl: config.youtubeChannelUrl,
    youtubeChannelId: config.youtubeChannelId,
    youtubeChannelTitle: config.youtubeChannelTitle,
    youtubeChannelHandle: config.youtubeHandle,
    youtubeUploadsPlaylistId: config.youtubeUploadsPlaylistId,
  };
}

export function hasManagedArtistChannel(artist: ManagedArtistChannelColumns) {
  return Boolean(artist.youtubeChannelUrl && (artist.youtubeChannelId || artist.youtubeChannelHandle));
}

/** Liens de clips saisis un par ligne dans l'admin : seuls les liens YouTube reconnus sont conserves, sans doublon. */
export function parseFeaturedVideoUrls(raw: string | null): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const line of raw.split(/\r?\n|,/)) {
    const value = line.trim();
    if (!value) continue;
    const videoId = parseYouTubeVideoId(value);
    if (!videoId || seen.has(videoId)) continue;
    seen.add(videoId);
    urls.push(`https://www.youtube.com/watch?v=${videoId}`);
    if (urls.length >= MAX_FEATURED_VIDEOS) break;
  }
  return urls;
}
