import { revalidateTag, unstable_cache } from "next/cache";

/**
 * Integration YouTube des profils MUSIC.
 *
 * - Resolution de la chaine : YouTube Data API v3 (`channels.list`, 1 unite de quota).
 * - Dernieres videos : playlist "uploads" de la chaine (`playlistItems.list`, 1 unite),
 *   jamais `search.list` (100 unites).
 * - Repli sans quota : flux Atom officiel `youtube.com/feeds/videos.xml?channel_id=...`
 *   (utilise si la cle API est absente, invalide, ou si l'API echoue).
 * - Cache serveur partage (`unstable_cache`, ~30 min) : les visiteurs ne declenchent pas d'appel YouTube.
 *
 * La cle `YOUTUBE_API_KEY` est lue cote serveur uniquement et n'est jamais journalisee.
 */

export const YOUTUBE_VIDEO_LIMIT = 6;
const YOUTUBE_CACHE_SECONDS = 1800;
const YOUTUBE_TIMEOUT_MS = 4000;
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"]);
const HANDLE_PATTERN = /^[A-Za-z0-9._-]{3,30}$/;
const CHANNEL_ID_PATTERN = /^UC[A-Za-z0-9_-]{22}$/;

export type YouTubeChannelConfig = {
  youtubeChannelUrl: string | null;
  youtubeChannelId: string | null;
  youtubeChannelTitle: string | null;
  youtubeHandle: string | null;
  youtubeUploadsPlaylistId: string | null;
};

export type YouTubeVideo = {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
};

export type YouTubeFeed = {
  channel: { channelId: string; title: string | null; handle: string | null; url: string };
  videos: YouTubeVideo[];
  source: "api" | "feed";
};

export type YouTubeChannelInput =
  | { kind: "handle"; handle: string; url: string }
  | { kind: "channelId"; channelId: string; url: string };

export type YouTubeChannelResolution =
  | { status: "resolved"; channel: { channelId: string; title: string | null; handle: string | null; uploadsPlaylistId: string | null } }
  | { status: "not_found" }
  | { status: "no_api_key" }
  | { status: "api_error" };

export class YouTubeInputError extends Error {}

const EMPTY_CONFIG: YouTubeChannelConfig = {
  youtubeChannelUrl: null,
  youtubeChannelId: null,
  youtubeChannelTitle: null,
  youtubeHandle: null,
  youtubeUploadsPlaylistId: null,
};

export function isYouTubeConfigured() {
  return Boolean(process.env.YOUTUBE_API_KEY?.trim());
}

function apiKey() {
  return process.env.YOUTUBE_API_KEY?.trim() || null;
}

function normalizeHandle(value: string | null | undefined) {
  const handle = (value ?? "").trim().replace(/^@/, "");
  return HANDLE_PATTERN.test(handle) ? handle : null;
}

export function youtubeHandleUrl(handle: string) {
  return `https://www.youtube.com/@${handle}`;
}

export function youtubeChannelUrl(channelId: string) {
  return `https://www.youtube.com/channel/${channelId}`;
}

function watchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function fallbackThumbnail(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Accepte : https://youtube.com/@artiste, https://www.youtube.com/@artiste/videos, @artiste,
 * https://youtube.com/channel/UC..., youtube.com/channel/UC...?param (sans protocole, slash final, espaces).
 */
export function parseYouTubeChannelInput(rawValue: string): YouTubeChannelInput {
  let value = rawValue.replace(/\s+/g, "");
  if (!value) throw new YouTubeInputError("Le lien de la chaine YouTube est vide.");

  if (value.startsWith("@")) {
    const handle = normalizeHandle(value);
    if (!handle) throw new YouTubeInputError("Le handle YouTube n'est pas valide.");
    return { kind: "handle", handle, url: youtubeHandleUrl(handle) };
  }

  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new YouTubeInputError("Le lien de la chaine YouTube n'est pas une URL valide.");
  }

  if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) {
    throw new YouTubeInputError("Le lien doit pointer vers youtube.com.");
  }

  const [first = "", second = ""] = url.pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part));

  if (first.startsWith("@")) {
    const handle = normalizeHandle(first);
    if (!handle) throw new YouTubeInputError("Le handle YouTube n'est pas valide.");
    return { kind: "handle", handle, url: youtubeHandleUrl(handle) };
  }

  if (first === "channel") {
    if (!CHANNEL_ID_PATTERN.test(second)) throw new YouTubeInputError("L'identifiant de chaine YouTube n'est pas valide.");
    return { kind: "channelId", channelId: second, url: youtubeChannelUrl(second) };
  }

  throw new YouTubeInputError("Utilise une URL de type https://youtube.com/@artiste ou https://youtube.com/channel/UC...");
}

export function readYouTubeChannelConfig(config: unknown): YouTubeChannelConfig {
  if (!config || typeof config !== "object" || Array.isArray(config)) return EMPTY_CONFIG;
  const source = config as Record<string, unknown>;
  const text = (key: keyof YouTubeChannelConfig) => (typeof source[key] === "string" && (source[key] as string).trim() ? (source[key] as string).trim() : null);
  return {
    youtubeChannelUrl: text("youtubeChannelUrl"),
    youtubeChannelId: text("youtubeChannelId"),
    youtubeChannelTitle: text("youtubeChannelTitle"),
    youtubeHandle: normalizeHandle(text("youtubeHandle")),
    youtubeUploadsPlaylistId: text("youtubeUploadsPlaylistId"),
  };
}

export function emptyYouTubeChannelConfig(): YouTubeChannelConfig {
  return { ...EMPTY_CONFIG };
}

type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number | null; reason: string };

async function fetchWithTimeout(url: string | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), YOUTUBE_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

// Ex. : API_KEY_INVALID, SERVICE_DISABLED (API non activee), quotaExceeded, playlistNotFound.
async function readApiErrorReason(response: Response) {
  try {
    const body = (await response.json()) as { error?: { details?: { reason?: string }[]; errors?: { reason?: string }[]; status?: string } };
    return body.error?.details?.find((detail) => detail.reason)?.reason ?? body.error?.errors?.[0]?.reason ?? body.error?.status ?? "unknown";
  } catch {
    return "unknown";
  }
}

// L'URL contient la cle : elle n'est jamais journalisee, seuls le statut et la raison le sont.
async function youtubeApi<T>(resource: string, params: Record<string, string>, key: string): Promise<ApiResult<T>> {
  const url = new URL(`${YOUTUBE_API_BASE}/${resource}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  url.searchParams.set("key", key);

  try {
    const response = await fetchWithTimeout(url, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      const reason = await readApiErrorReason(response);
      console.warn(`[youtube] ${resource} a echoue`, { status: response.status, reason });
      return { ok: false, status: response.status, reason };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (error) {
    const reason = error instanceof Error && error.name === "AbortError" ? "timeout" : "network";
    console.warn(`[youtube] ${resource} injoignable`, { reason });
    return { ok: false, status: null, reason };
  }
}

type ChannelsResponse = {
  items?: {
    id?: string;
    snippet?: { title?: string; customUrl?: string };
    contentDetails?: { relatedPlaylists?: { uploads?: string } };
  }[];
};

export async function resolveYouTubeChannel(input: YouTubeChannelInput): Promise<YouTubeChannelResolution> {
  const key = apiKey();
  if (!key) return { status: "no_api_key" };

  const lookup: Record<string, string> = input.kind === "handle" ? { forHandle: input.handle } : { id: input.channelId };
  const result = await youtubeApi<ChannelsResponse>("channels", { part: "snippet,contentDetails", maxResults: "1", ...lookup }, key);
  if (!result.ok) return { status: "api_error" };

  const item = result.data.items?.[0];
  if (!item?.id || !CHANNEL_ID_PATTERN.test(item.id)) return { status: "not_found" };

  return {
    status: "resolved",
    channel: {
      channelId: item.id,
      title: item.snippet?.title?.trim() || null,
      handle: normalizeHandle(item.snippet?.customUrl) ?? (input.kind === "handle" ? input.handle : null),
      uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads?.trim() || null,
    },
  };
}

type Thumbnails = Record<string, { url?: string } | undefined>;
type PlaylistItemsResponse = {
  items?: {
    snippet?: { title?: string; publishedAt?: string; thumbnails?: Thumbnails; resourceId?: { kind?: string; videoId?: string } };
    contentDetails?: { videoPublishedAt?: string };
    status?: { privacyStatus?: string };
  }[];
};

// "standard" (640x480) suffit pour des cartes de 320 px en Retina et reste leger ; "maxres" (1280x720) n'est utilise qu'en dernier recours.
function bestThumbnail(thumbnails: Thumbnails | undefined, videoId: string) {
  return thumbnails?.standard?.url ?? thumbnails?.high?.url ?? thumbnails?.maxres?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? fallbackThumbnail(videoId);
}

/**
 * Videos d'une playlist. Une seule requete de 1 unite de quota, quel que soit le nombre de "part".
 * La playlist "UULF..." (videos longues, sans Shorts) n'est pas documentee : elle est tentee en premier,
 * avec repli sur la playlist "uploads" officielle "UU..." (toutes les videos).
 */
async function fetchVideosFromApi(uploadsPlaylistId: string, key: string): Promise<YouTubeVideo[] | null> {
  const longForm = uploadsPlaylistId.startsWith("UU") ? await fetchPlaylistVideos(`UULF${uploadsPlaylistId.slice(2)}`, key) : null;
  if (longForm && longForm.length > 0) return longForm;
  return fetchPlaylistVideos(uploadsPlaylistId, key);
}

async function fetchPlaylistVideos(playlistId: string, key: string): Promise<YouTubeVideo[] | null> {
  const result = await youtubeApi<PlaylistItemsResponse>("playlistItems", { part: "snippet,contentDetails,status", playlistId, maxResults: "12" }, key);
  if (!result.ok) return null;

  return (result.data.items ?? [])
    .flatMap((item) => {
      const videoId = item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title?.trim();
      const publishedAt = item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt;
      const kind = item.snippet?.resourceId?.kind;
      const privacy = item.status?.privacyStatus;
      if (!videoId || !title || !publishedAt) return [];
      if (kind && kind !== "youtube#video") return [];
      if (privacy && privacy !== "public") return [];
      return [{ videoId, title, thumbnail: bestThumbnail(item.snippet?.thumbnails, videoId), publishedAt, url: watchUrl(videoId) }];
    })
    .slice(0, YOUTUBE_VIDEO_LIMIT);
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

function xmlTag(source: string, tag: string) {
  const match = source.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  return match ? decodeXml(match[1]) : null;
}

// Le flux marque les Shorts par un lien "/shorts/" : les videos longues sont privilegiees, avec repli sur tout le flux.
export function parseYouTubeFeedXml(xml: string): { title: string | null; videos: YouTubeVideo[] } {
  const [head = "", ...entries] = xml.split("<entry>");
  const all = entries.flatMap((entry) => {
    const videoId = xmlTag(entry, "yt:videoId");
    const title = xmlTag(entry, "title");
    const publishedAt = xmlTag(entry, "published");
    if (!videoId || !title || !publishedAt) return [];
    const thumbnail = entry.match(/<media:thumbnail[^>]*\burl="([^"]+)"/)?.[1] ?? fallbackThumbnail(videoId);
    const isShort = /<link[^>]*\bhref="[^"]*\/shorts\/[^"]*"/.test(entry);
    return [{ video: { videoId, title, thumbnail: decodeXml(thumbnail), publishedAt, url: watchUrl(videoId) }, isShort }];
  });
  const longForm = all.filter((item) => !item.isShort);
  const videos = (longForm.length > 0 ? longForm : all).map((item) => item.video).slice(0, YOUTUBE_VIDEO_LIMIT);

  return { title: xmlTag(head, "title"), videos };
}

/** Flux Atom officiel de la chaine : aucune cle, aucun quota, 15 dernieres videos. */
async function fetchVideosFromFeed(channelId: string): Promise<{ title: string | null; videos: YouTubeVideo[] } | null> {
  try {
    const response = await fetchWithTimeout(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`);
    if (!response.ok) {
      console.warn("[youtube] flux Atom indisponible", { status: response.status });
      return null;
    }
    return parseYouTubeFeedXml(await response.text());
  } catch (error) {
    console.warn("[youtube] flux Atom injoignable", { reason: error instanceof Error && error.name === "AbortError" ? "timeout" : "network" });
    return null;
  }
}

function feedCacheKey(config: YouTubeChannelConfig) {
  return config.youtubeChannelId ?? (config.youtubeHandle ? `@${config.youtubeHandle}` : "none");
}

// Lance une erreur quand YouTube est indisponible : le resultat n'est alors pas mis en cache.
async function loadYouTubeFeed(config: YouTubeChannelConfig): Promise<YouTubeFeed | null> {
  const key = apiKey();
  let channelId = config.youtubeChannelId;
  let title = config.youtubeChannelTitle;
  let handle = config.youtubeHandle;
  let uploadsPlaylistId = config.youtubeUploadsPlaylistId;

  if (!channelId) {
    if (!key || !handle) return null;
    const resolution = await resolveYouTubeChannel({ kind: "handle", handle, url: youtubeHandleUrl(handle) });
    if (resolution.status === "not_found") return null;
    if (resolution.status !== "resolved") throw new Error(`youtube:${resolution.status}`);
    channelId = resolution.channel.channelId;
    title = resolution.channel.title ?? title;
    handle = resolution.channel.handle ?? handle;
    uploadsPlaylistId = resolution.channel.uploadsPlaylistId;
  }

  const channelUrl = handle ? youtubeHandleUrl(handle) : youtubeChannelUrl(channelId);
  const apiVideos = key ? await fetchVideosFromApi(uploadsPlaylistId ?? `UU${channelId.slice(2)}`, key) : null;
  const feed = apiVideos ? null : await fetchVideosFromFeed(channelId);
  if (!apiVideos && !feed) throw new Error("youtube:unavailable");

  const result: YouTubeFeed = apiVideos
    ? { channel: { channelId, title, handle, url: channelUrl }, videos: apiVideos, source: "api" }
    : { channel: { channelId, title: title ?? feed?.title ?? null, handle, url: channelUrl }, videos: feed?.videos ?? [], source: "feed" };

  // Une ligne par synchronisation reelle (au plus une toutes les 30 min par chaine) : utile pour suivre le quota.
  console.info("[youtube] synchronisation", { channel: channelId, source: result.source, videos: result.videos.length });
  return result;
}

/**
 * Dernieres videos d'une chaine configuree, mises en cache ~30 min et partagees entre tous les visiteurs.
 * Ne lance jamais d'erreur : renvoie `null` si YouTube est indisponible (le profil affiche alors le repli manuel).
 */
export async function getYouTubeFeed(config: YouTubeChannelConfig): Promise<YouTubeFeed | null> {
  if (!config.youtubeChannelId && !config.youtubeHandle) return null;
  const cacheKey = feedCacheKey(config);

  // Les appels simultanes (metadata + page, ou plusieurs visiteurs sur cache froid) partagent une seule requete.
  const pending = inflightFeeds.get(cacheKey);
  if (pending) return pending;

  const cached = unstable_cache(loadYouTubeFeed, ["youtube-feed", cacheKey], {
    revalidate: YOUTUBE_CACHE_SECONDS,
    tags: ["youtube-feed", `youtube-feed:${cacheKey}`],
  });
  const request = cached(config)
    .catch((error: unknown) => {
      console.warn("[youtube] synchronisation indisponible", { channel: cacheKey, reason: error instanceof Error ? error.message : "unknown" });
      return null;
    })
    .finally(() => inflightFeeds.delete(cacheKey));

  inflightFeeds.set(cacheKey, request);
  return request;
}

const inflightFeeds = new Map<string, Promise<YouTubeFeed | null>>();

/** Force un rafraichissement des videos a la prochaine visite (apres une sauvegarde admin). */
export function revalidateYouTubeFeed(config: YouTubeChannelConfig) {
  revalidateTag(`youtube-feed:${feedCacheKey(config)}`);
}
