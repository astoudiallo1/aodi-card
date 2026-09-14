/* eslint-disable @next/next/no-img-element */
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileContentNav } from "@/components/admin/ProfileContentNav";
import { prisma } from "@/lib/prisma";
import { getYouTubeFeed, isYouTubeConfigured, readYouTubeChannelConfig, YOUTUBE_VIDEO_LIMIT, type YouTubeChannelConfig, type YouTubeFeed } from "@/lib/youtube";
import { ProfileSectionType } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteMusicTrackAction, toggleMusicTrackVisibleAction } from "../content-actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ youtube?: string }>;
};

const SUCCESS_TONE = "border-emerald-200 bg-emerald-50 text-emerald-800";
const WARNING_TONE = "border-amber-200 bg-amber-50 text-amber-800";
const ERROR_TONE = "border-red-200 bg-red-50 text-red-700";
const NEUTRAL_TONE = "border-aodi-violet-100 bg-white text-aodi-violet-700";

const youtubeMessages: Record<string, { tone: string; text: string }> = {
  saved: { tone: SUCCESS_TONE, text: "Chaine YouTube configuree. Les dernieres videos s'affichent automatiquement sur le profil public." },
  "saved-feed": { tone: SUCCESS_TONE, text: "Chaine enregistree. Sans YOUTUBE_API_KEY, les dernieres videos sont recuperees via le flux public YouTube." },
  "saved-no-api": { tone: WARNING_TONE, text: "La chaine a ete enregistree, mais la synchronisation YouTube n'est pas encore configuree (YOUTUBE_API_KEY absente)." },
  "saved-api-error": { tone: WARNING_TONE, text: "La chaine a ete enregistree, mais YouTube n'a pas repondu. La synchronisation sera retentee automatiquement." },
  cleared: { tone: NEUTRAL_TONE, text: "Chaine YouTube retiree. Les sorties manuelles restent affichees." },
  invalid: { tone: ERROR_TONE, text: "Lien YouTube invalide. Utilise une URL de type https://youtube.com/@artiste ou https://youtube.com/channel/UC..." },
  "not-found": { tone: ERROR_TONE, text: "Chaine YouTube introuvable. Verifie le lien de la chaine." },
  error: { tone: ERROR_TONE, text: "Impossible d'enregistrer la chaine pour le moment. Reessaie dans quelques instants." },
};

function YouTubeSyncStatus({ config, feed }: { config: YouTubeChannelConfig; feed: YouTubeFeed | null }) {
  if (feed) {
    return (
      <div className="mt-4 rounded-lg border border-aodi-violet-100 bg-white p-4">
        <p className="text-sm font-semibold text-aodi-violet-900">
          {feed.videos.length === 0 ? "Aucune video publique trouvee sur cette chaine." : `${feed.videos.length} video${feed.videos.length > 1 ? "s" : ""} synchronisee${feed.videos.length > 1 ? "s" : ""}`}
          <span className="ml-2 text-xs font-medium text-aodi-violet-700/60">({feed.source === "api" ? "API YouTube" : "flux public YouTube"} - cache 30 min)</span>
        </p>
        {feed.videos.length > 0 ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {feed.videos.map((video) => (
              <li key={video.videoId} className="flex items-center gap-3 rounded-lg bg-[#FBF8F1] p-2">
                <img src={video.thumbnail} alt="" className="h-12 w-20 shrink-0 rounded object-cover" />
                <a href={video.url} target="_blank" rel="noopener noreferrer" className="line-clamp-2 text-xs font-semibold text-aodi-violet-900 hover:text-aodi-gold-dark">{video.title}</a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  if (!config.youtubeChannelId && !isYouTubeConfigured()) {
    return <p className={`mt-4 rounded-lg border px-4 py-3 text-sm ${WARNING_TONE}`}>Ce lien @handle ne peut pas encore etre synchronise : ajoute YOUTUBE_API_KEY cote serveur puis clique sur Enregistrer.</p>;
  }

  return <p className={`mt-4 rounded-lg border px-4 py-3 text-sm ${WARNING_TONE}`}>Synchronisation YouTube indisponible pour le moment. Le profil public affiche les sorties manuelles en attendant.</p>;
}

export default async function AdminProfileMusicPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const profile = await prisma.profile.findUnique({
    where: { id },
    select: { id: true, displayName: true, slug: true, profileType: true },
  });

  if (!profile) notFound();

  const [tracks, musicSection] = await Promise.all([
    prisma.musicTrack.findMany({
      where: { profileId: profile.id },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.profileSection.findUnique({
      where: { profileId_type: { profileId: profile.id, type: ProfileSectionType.MUSIC } },
      select: { config: true },
    }),
  ]);
  const youtubeConfig = readYouTubeChannelConfig(musicSection?.config ?? null);
  const youtubeFeed = profile.profileType === "MUSIC" && youtubeConfig.youtubeChannelUrl ? await getYouTubeFeed(youtubeConfig) : null;
  const youtubeMessage = query.youtube ? youtubeMessages[query.youtube] : null;
  const channelTitle = youtubeFeed?.channel.title ?? youtubeConfig.youtubeChannelTitle;
  const channelHandle = youtubeFeed?.channel.handle ?? youtubeConfig.youtubeHandle;
  const channelUrl = youtubeFeed?.channel.url ?? youtubeConfig.youtubeChannelUrl;
  const youtubeAction = `/admin/profiles/${profile.id}/music/youtube`;

  return (
    <div>
      <AdminHeader eyebrow="Musique" title={profile.displayName} description={`Sorties musicales affichees sur /${profile.slug}.`} action={{ href: `/admin/profiles/${profile.id}/music/new`, label: "Ajouter une sortie" }} />
      <ProfileContentNav profileId={profile.id} active="Musique" />

      {profile.profileType === "MUSIC" ? (
        <section className="mt-6 rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-aodi-violet-900">Chaine YouTube</h2>
          <p className="mt-1 text-sm text-aodi-violet-700/70">Colle une seule fois le lien de la chaine : les {YOUTUBE_VIDEO_LIMIT} dernieres videos publiques sont recuperees automatiquement et affichees dans &quot;Dernieres sorties&quot;.</p>

          {youtubeMessage ? <p className={`mt-4 rounded-lg border px-4 py-3 text-sm font-semibold ${youtubeMessage.tone}`}>{youtubeMessage.text}</p> : null}

          <form action={youtubeAction} method="post" className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-aodi-violet-700/60">Lien de la chaine</span>
              <input name="youtubeChannelUrl" type="text" inputMode="url" autoComplete="off" defaultValue={youtubeConfig.youtubeChannelUrl ?? ""} placeholder="https://youtube.com/@artiste" className="mt-1 w-full rounded-lg border border-aodi-violet-100 bg-white px-3 py-2 text-sm outline-none focus:border-aodi-gold focus:ring-2 focus:ring-aodi-gold/20" />
              <span className="mt-1 block text-xs text-aodi-violet-700/60">Exemple : https://youtube.com/@artiste ou https://youtube.com/channel/UC...</span>
            </label>
            <button type="submit" className="rounded-lg bg-aodi-violet-900 px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-aodi-violet-800">Enregistrer</button>
          </form>

          {channelUrl ? (
            <div className="mt-5 rounded-lg bg-white px-4 py-4 text-sm text-aodi-violet-800 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-emerald-700">&#10003; Chaine configuree</p>
                  {channelTitle ? <p className="mt-1 text-base font-bold text-aodi-violet-900">{channelTitle}</p> : null}
                  {channelHandle ? <p className="mt-0.5 text-aodi-violet-700/75">@{channelHandle}</p> : null}
                  {youtubeConfig.youtubeChannelId ? <p className="mt-1 text-xs text-aodi-violet-700/55">ID : {youtubeConfig.youtubeChannelId}</p> : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold text-aodi-violet-900 hover:border-aodi-gold">Voir la chaine</a>
                  <form action={youtubeAction} method="post">
                    <input type="hidden" name="youtubeChannelUrl" value="" />
                    <button type="submit" className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700">Retirer</button>
                  </form>
                </div>
              </div>
              <YouTubeSyncStatus config={youtubeConfig} feed={youtubeFeed} />
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 shadow-sm">
        <div className="border-b border-aodi-violet-100 px-5 py-4">
          <h2 className="font-display text-2xl font-semibold text-aodi-violet-900">Sorties manuelles</h2>
          <p className="mt-1 text-sm text-aodi-violet-700/70">Sons hors YouTube (Spotify, Apple Music, Audiomack, audio...). Affiches en repli si aucune video YouTube n&apos;est disponible.</p>
        </div>
        {tracks.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-aodi-violet-700/70">Aucune musique pour le moment.</p>
            <Link href={`/admin/profiles/${profile.id}/music/new`} className="mt-4 inline-flex rounded-lg bg-aodi-violet-900 px-4 py-2 text-sm font-semibold text-white">Ajouter une sortie</Link>
          </div>
        ) : (
          tracks.map((track) => (
            <article key={track.id} className="grid gap-4 border-b border-aodi-violet-100 p-5 lg:grid-cols-[80px_1fr_120px] lg:items-center">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-aodi-violet-950/10 text-[10px] font-bold uppercase text-aodi-violet-700/45">
                {track.coverUrl ? <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" /> : <span>Cover</span>}
              </div>
              <div>
                <p className="font-semibold text-aodi-violet-900">{track.title}</p>
                <p className="mt-1 text-sm text-aodi-violet-700/70">{track.artist ?? "Artiste non renseigne"}</p>
                <p className="mt-1 text-xs text-aodi-violet-700/60">{track.isFeatured ? "En avant" : "Standard"} - {track.isVisible ? "Visible" : "Masque"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/profiles/${profile.id}/music/${track.id}/edit`} className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">Modifier</Link>
                <form action={toggleMusicTrackVisibleAction.bind(null, profile.id, track.id)}><button className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">{track.isVisible ? "Masquer" : "Afficher"}</button></form>
                <form action={deleteMusicTrackAction.bind(null, profile.id, track.id)}><button className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700">Supprimer</button></form>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
