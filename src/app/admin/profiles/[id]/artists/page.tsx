/* eslint-disable @next/next/no-img-element */
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileContentNav } from "@/components/admin/ProfileContentNav";
import { hasManagedArtistChannel } from "@/lib/managed-artists";
import { prisma } from "@/lib/prisma";
import { getProfileModuleContext } from "@/lib/profile-module-state";
import { getProfileModule, isModuleAvailable, isModuleDisabled } from "@/lib/profile-modules";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteArtistAction, toggleArtistVisibleAction } from "../content-actions";

type PageProps = { params: Promise<{ id: string }> };

const ARTISTS_MODULE = getProfileModule("artists");

/**
 * Module ARTISTS : artistes accompagnes par un producteur, manager, label ou agence.
 * Independant du metier libre : il suffit d'ajouter un artiste ou d'activer la section dans Configuration.
 */
export default async function AdminProfileArtistsPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true, slug: true } });
  if (!profile) notFound();

  const context = await getProfileModuleContext(profile.id);
  const available = isModuleAvailable(ARTISTS_MODULE, context);
  const artists = available ? await prisma.managedArtist.findMany({ where: { profileId: profile.id }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }) : [];
  const sectionDisabled = isModuleDisabled(ARTISTS_MODULE, context.sections);

  return (
    <div>
      <AdminHeader eyebrow="Artistes accompagnes" title={profile.displayName} description={`Artistes presentes sur /${profile.slug}, chacun avec sa propre chaine YouTube.`} action={available ? { href: `/admin/profiles/${profile.id}/artists/new`, label: "Ajouter un artiste" } : undefined} />
      <ProfileContentNav profileId={profile.id} active="artists" />

      {!available ? (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Le module Artistes n&apos;est pas encore disponible sur cette base de donnees (migration &quot;videos_artists_modules&quot; a appliquer).</p>
      ) : (
        <>
          {artists.length > 0 && sectionDisabled ? (
            <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              La section &quot;Artistes accompagnes&quot; est desactivee dans <Link href={`/admin/profiles/${profile.id}/config`} className="font-semibold underline">Configuration</Link> : les artistes sont enregistres mais n&apos;apparaissent pas sur le profil public.
            </p>
          ) : null}

          <section className="mt-6 overflow-hidden rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 shadow-sm">
            {artists.length === 0 ? (
              <div className="p-6">
                <p className="text-sm text-aodi-violet-700/70">Aucun artiste pour le moment. Ajoute un artiste, puis connecte sa chaine YouTube depuis sa fiche.</p>
                <Link href={`/admin/profiles/${profile.id}/artists/new`} className="mt-4 inline-flex rounded-lg bg-aodi-violet-900 px-4 py-2 text-sm font-semibold text-white">Ajouter le premier artiste</Link>
              </div>
            ) : (
              artists.map((artist) => (
                <article key={artist.id} className="grid gap-4 border-b border-aodi-violet-100 p-5 lg:grid-cols-[80px_1fr_180px] lg:items-center">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-aodi-violet-950/10 text-[10px] font-bold uppercase text-aodi-violet-700/45">
                    {artist.photoUrl ? <img src={artist.photoUrl} alt={artist.name} className="h-full w-full object-cover" /> : <span>Photo</span>}
                  </div>
                  <div>
                    <p className="font-semibold text-aodi-violet-900">{artist.name}</p>
                    <p className="mt-1 text-sm text-aodi-violet-700/70">{artist.role ?? "Role non renseigne"}</p>
                    <p className="mt-1 text-xs text-aodi-violet-700/60">
                      Ordre {artist.sortOrder} - {artist.isVisible ? "Visible" : "Masque"} - {hasManagedArtistChannel(artist) ? `YouTube : ${artist.youtubeChannelTitle ?? artist.youtubeChannelHandle ?? "chaine connectee"}` : "Pas de chaine YouTube"}
                      {artist.featuredVideoUrls.length > 0 ? ` - ${artist.featuredVideoUrls.length} clip${artist.featuredVideoUrls.length > 1 ? "s" : ""} mis en avant` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/profiles/${profile.id}/artists/${artist.id}/edit`} className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">Modifier</Link>
                    <form action={toggleArtistVisibleAction.bind(null, profile.id, artist.id)}><button className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">{artist.isVisible ? "Masquer" : "Afficher"}</button></form>
                    <form action={deleteArtistAction.bind(null, profile.id, artist.id)}><button className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700">Supprimer</button></form>
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
