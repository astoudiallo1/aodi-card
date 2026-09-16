import { AdminHeader } from "@/components/admin/AdminHeader";
import { ArtistForm } from "@/components/admin/ProfileContentForms";
import { YouTubeChannelPanel } from "@/components/admin/YouTubeChannelPanel";
import { hasManagedArtistChannel, managedArtistChannelConfig } from "@/lib/managed-artists";
import { prisma } from "@/lib/prisma";
import { getYouTubeFeed } from "@/lib/youtube";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateArtistAction } from "../../../content-actions";

type PageProps = {
  params: Promise<{ id: string; itemId: string }>;
  searchParams?: Promise<{ youtube?: string; created?: string }>;
};

/** Fiche artiste : formulaire + chaine YouTube de l'artiste via le panneau partage (meme moteur que MUSIC / VIDEOS). */
export default async function EditArtistPage({ params, searchParams }: PageProps) {
  const { id, itemId } = await params;
  const query = searchParams ? await searchParams : {};
  const artist = await prisma.managedArtist.findFirst({ where: { id: itemId, profileId: id }, include: { profile: { select: { id: true, displayName: true } } } });
  if (!artist) notFound();

  const config = managedArtistChannelConfig(artist);
  const feed = hasManagedArtistChannel(artist) ? await getYouTubeFeed(config) : null;

  return (
    <div>
      <AdminHeader eyebrow="Artistes accompagnes" title={`Modifier ${artist.name}`} description={artist.profile.displayName} action={{ href: `/admin/profiles/${artist.profile.id}/artists`, label: "Retour a la liste" }} />

      {query.created ? <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Artiste ajoute. Tu peux maintenant connecter sa chaine YouTube ci-dessous.</p> : null}

      <YouTubeChannelPanel
        action={`/admin/profiles/${artist.profile.id}/artists/${artist.id}/youtube`}
        config={config}
        feed={feed}
        status={query.youtube}
        title={`Chaine YouTube de ${artist.name}`}
        description="Colle le lien de la chaine de l'artiste (URL ou @handle) : ses dernieres videos s'affichent automatiquement sur sa fiche publique, apres les clips mis en avant."
        messageOverrides={{ cleared: "Chaine YouTube retiree. La fiche de l'artiste reste affichee (avec ses clips mis en avant s'il y en a)." }}
        unavailableHint="La fiche de l'artiste reste affichee avec ses clips mis en avant en attendant."
      />

      <ArtistForm action={updateArtistAction.bind(null, artist.profile.id, artist.id)} submitLabel="Enregistrer" item={artist} />

      <p className="mt-4 text-xs text-aodi-violet-700/60">
        Les artistes apparaissent dans la section publique &quot;Artistes accompagnes&quot; si elle est active dans <Link href={`/admin/profiles/${artist.profile.id}/config`} className="font-semibold underline">Configuration</Link>.
      </p>
    </div>
  );
}
