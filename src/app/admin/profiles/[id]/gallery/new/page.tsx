import { AdminHeader } from "@/components/admin/AdminHeader";
import { GalleryForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createGalleryItemAction } from "../../content-actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function NewGalleryItemPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true } });
  if (!profile) notFound();
  return <div><AdminHeader eyebrow="Galerie" title={`Nouvelle photo - ${profile.displayName}`} /><GalleryForm action={createGalleryItemAction.bind(null, profile.id)} submitLabel="Ajouter la photo" /></div>;
}