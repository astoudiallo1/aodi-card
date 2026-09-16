/* eslint-disable @next/next/no-img-element */
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileContentNav } from "@/components/admin/ProfileContentNav";
import { YouTubeChannelPanel } from "@/components/admin/YouTubeChannelPanel";
import { prisma } from "@/lib/prisma";
import { getYouTubeFeed, YOUTUBE_VIDEO_LIMIT } from "@/lib/youtube";
import { readSectionYouTubeConfig } from "@/lib/youtube-admin";
import { ProfileSectionType } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteMusicTrackAction, toggleMusicTrackVisibleAction } from "../content-actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ youtube?: string }>;
};

export default async function AdminProfileMusicPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const profile = await prisma.profile.findUnique({
    where: { id },
    select: { id: true, displayName: true, slug: true, profileType: true },
  });

  if (!profile) notFound();

  const [tracks, youtubeConfig] = await Promise.all([
    prisma.musicTrack.findMany({
      where: { profileId: profile.id },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    readSectionYouTubeConfig(profile.id, ProfileSectionType.MUSIC),
  ]);
  // La chaine de la section MUSIC alimente "Dernieres sorties" : experience propre aux profils MUSIC.
  const youtubeFeed = profile.profileType === "MUSIC" && youtubeConfig.youtubeChannelUrl ? await getYouTubeFeed(youtubeConfig) : null;

  return (
    <div>
      <AdminHeader eyebrow="Musique" title={profile.displayName} description={`Sorties musicales affichees sur /${profile.slug}.`} action={{ href: `/admin/profiles/${profile.id}/music/new`, label: "Ajouter une sortie" }} />
      <ProfileContentNav profileId={profile.id} active="music" />

      {profile.profileType === "MUSIC" ? (
        <YouTubeChannelPanel
          action={`/admin/profiles/${profile.id}/music/youtube`}
          config={youtubeConfig}
          feed={youtubeFeed}
          status={query.youtube}
          description={`Colle une seule fois le lien de la chaine : les ${YOUTUBE_VIDEO_LIMIT} dernieres videos publiques sont recuperees automatiquement et affichees dans "Dernieres sorties".`}
          messageOverrides={{ cleared: "Chaine YouTube retiree. Les sorties manuelles restent affichees." }}
          unavailableHint="Le profil public affiche les sorties manuelles en attendant."
        />
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
