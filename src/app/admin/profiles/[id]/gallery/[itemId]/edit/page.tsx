import { AdminHeader } from "@/components/admin/AdminHeader";
import { GalleryForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateGalleryItemAction } from "../../../content-actions";

type PageProps = { params: Promise<{ id: string; itemId: string }> };

export default async function EditGalleryItemPage({ params }: PageProps) {
  const { id, itemId } = await params;
  const item = await prisma.galleryItem.findFirst({ where: { id: itemId, profileId: id }, include: { profile: { select: { id: true, displayName: true } } } });
  if (!item) notFound();
  return <div><AdminHeader eyebrow="Galerie" title={`Modifier ${item.title || "photo"}`} description={item.profile.displayName} /><GalleryForm action={updateGalleryItemAction.bind(null, item.profile.id, item.id)} submitLabel="Enregistrer" item={item} /></div>;
}