/* eslint-disable @next/next/no-img-element */
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileContentNav } from "@/components/admin/ProfileContentNav";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteGalleryItemAction, toggleGalleryItemVisibleAction } from "../content-actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminProfileGalleryPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true, slug: true } });
  if (!profile) notFound();
  const items = await prisma.galleryItem.findMany({ where: { profileId: profile.id }, orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }] });
  return <div><AdminHeader eyebrow="Galerie" title={profile.displayName} description={`Photos affichees sur /${profile.slug}.`} action={{ href: `/admin/profiles/${profile.id}/gallery/new`, label: "Ajouter une photo" }} /><ProfileContentNav profileId={profile.id} active="Galerie" /><section className="mt-6 overflow-hidden rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 shadow-sm">{items.length === 0 ? <div className="p-6"><p className="text-sm text-aodi-violet-700/70">Aucune photo pour ce profil.</p><Link href={`/admin/profiles/${profile.id}/gallery/new`} className="mt-4 inline-flex rounded-lg bg-aodi-violet-900 px-4 py-2 text-sm font-semibold text-white">Ajouter la premiere photo</Link></div> : items.map((item) => <article key={item.id} className="grid gap-4 border-b border-aodi-violet-100 p-5 lg:grid-cols-[96px_1fr_140px] lg:items-center"><div className="h-20 w-20 overflow-hidden rounded-lg bg-aodi-violet-950/10"><img src={item.imageUrl} alt={item.title || "Galerie"} className="h-full w-full object-cover" /></div><div><p className="font-semibold text-aodi-violet-900">{item.title || "Photo sans titre"}</p><p className="mt-1 text-xs text-aodi-violet-700/60">Ordre {item.displayOrder} - {item.isVisible ? "Visible" : "Masquee"}</p></div><div className="flex flex-wrap gap-2"><Link href={`/admin/profiles/${profile.id}/gallery/${item.id}/edit`} className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">Modifier</Link><form action={toggleGalleryItemVisibleAction.bind(null, profile.id, item.id)}><button className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">{item.isVisible ? "Masquer" : "Afficher"}</button></form><form action={deleteGalleryItemAction.bind(null, profile.id, item.id)}><button className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700">Supprimer</button></form></div></article>)}</section></div>;
}