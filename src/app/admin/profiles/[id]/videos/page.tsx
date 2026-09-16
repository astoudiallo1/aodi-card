import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileContentNav } from "@/components/admin/ProfileContentNav";
import { YouTubeChannelPanel } from "@/components/admin/YouTubeChannelPanel";
import { prisma } from "@/lib/prisma";
import { getProfileModuleContext } from "@/lib/profile-module-state";
import { getProfileModule, isModuleAvailable, isModuleDisabled, moduleLabel, PROFILE_TYPE_LABELS } from "@/lib/profile-modules";
import { getYouTubeFeed } from "@/lib/youtube";
import { readSectionYouTubeConfig } from "@/lib/youtube-admin";
import { ProfileSectionType } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ youtube?: string }>;
};

const VIDEOS_MODULE = getProfileModule("videos");

// Vocabulaire admin par experience : le module, le moteur et le panneau restent les memes pour tous.
const VIDEO_HINTS: Record<string, string> = {
  CRAFT: "Realisations, fabrication, savoir-faire.",
  ARCHITECTURE: "Visites de projets, chantiers, realisations.",
  TECH: "Demonstrations, tutoriels, produits.",
  CORPORATE: "Interviews, presentations, conferences.",
  ACTOR_CREATOR: "Sketches, creations, contenus.",
  MUSIC: "Videos hors clips musicaux (interviews, coulisses...). Les clips restent dans Musique.",
};

/**
 * Module VIDEOS : chaine YouTube generique d'un profil, independante de MUSIC.
 * Meme panneau, meme moteur, meme cache que la section Musique de Youski.
 */
export default async function AdminProfileVideosPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true, slug: true, profileType: true } });
  if (!profile) notFound();

  const context = await getProfileModuleContext(profile.id);
  const label = moduleLabel(VIDEOS_MODULE, profile.profileType);
  const available = isModuleAvailable(VIDEOS_MODULE, context);
  const config = available ? await readSectionYouTubeConfig(profile.id, ProfileSectionType.VIDEOS) : null;
  const feed = config?.youtubeChannelUrl ? await getYouTubeFeed(config) : null;
  const sectionDisabled = isModuleDisabled(VIDEOS_MODULE, context.sections);
  const hint = VIDEO_HINTS[profile.profileType] ?? "Videos professionnelles du profil.";

  return (
    <div>
      <AdminHeader eyebrow={label} title={profile.displayName} description={`Chaine YouTube affichee dans la section videos de /${profile.slug}. ${hint}`} />
      <ProfileContentNav profileId={profile.id} active="videos" />

      {!available || !config ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Le module Videos n&apos;est pas encore disponible sur cette base de donnees (migration &quot;videos_artists_modules&quot; a appliquer).
        </p>
      ) : (
        <>
          <YouTubeChannelPanel
            action={`/admin/profiles/${profile.id}/videos/youtube`}
            config={config}
            feed={feed}
            status={query.youtube}
            title="Chaine YouTube du profil"
            description={`Colle le lien de la chaine (URL ou @handle) : ses dernieres videos publiques s'affichent automatiquement dans la section "${label}" du profil public, pour l'experience ${PROFILE_TYPE_LABELS[profile.profileType]}.`}
            messageOverrides={{ cleared: "Chaine YouTube retiree. La section videos disparait du profil public." }}
            unavailableHint="La section videos reste masquee tant qu'aucune video n'est recuperee."
          />

          {config.youtubeChannelUrl && sectionDisabled ? (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              La section Videos est desactivee dans <Link href={`/admin/profiles/${profile.id}/config`} className="font-semibold underline">Configuration</Link> : la chaine est enregistree mais n&apos;apparait pas sur le profil public.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
