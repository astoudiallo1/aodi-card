import { AdminHeader } from "@/components/admin/AdminHeader";
import { ArtistForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createArtistAction } from "../../content-actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function NewArtistPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true } });
  if (!profile) notFound();
  return (
    <div>
      <AdminHeader eyebrow="Artistes accompagnes" title={`Nouvel artiste - ${profile.displayName}`} description="Renseigne la fiche, puis connecte sa chaine YouTube a l'etape suivante." />
      <ArtistForm action={createArtistAction.bind(null, profile.id)} submitLabel="Ajouter" />
    </div>
  );
}
