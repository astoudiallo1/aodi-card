import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileContentNav } from "@/components/admin/ProfileContentNav";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCustomLinkAction, toggleCustomLinkVisibleAction } from "../content-actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminProfileLinksPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true, slug: true } });
  if (!profile) notFound();
  const links = await prisma.customLink.findMany({ where: { profileId: profile.id }, orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }] });
  return <div><AdminHeader eyebrow="Liens" title={profile.displayName} description={`Liens personnalises affiches sur /${profile.slug}.`} action={{ href: `/admin/profiles/${profile.id}/links/new`, label: "Ajouter un lien" }} /><ProfileContentNav profileId={profile.id} active="Liens" /><section className="mt-6 overflow-hidden rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 shadow-sm">{links.length === 0 ? <div className="p-6"><p className="text-sm text-aodi-violet-700/70">Aucun lien pour ce profil.</p><Link href={`/admin/profiles/${profile.id}/links/new`} className="mt-4 inline-flex rounded-lg bg-aodi-violet-900 px-4 py-2 text-sm font-semibold text-white">Ajouter le premier lien</Link></div> : links.map((link) => <article key={link.id} className="grid gap-4 border-b border-aodi-violet-100 p-5 lg:grid-cols-[1fr_120px] lg:items-center"><div><p className="font-semibold text-aodi-violet-900">{link.label}</p><p className="mt-1 break-all text-sm text-aodi-violet-700/70">{link.url}</p><p className="mt-1 text-xs text-aodi-violet-700/60">Ordre {link.displayOrder} - {link.isVisible ? "Visible" : "Masque"}</p></div><div className="flex flex-wrap gap-2"><Link href={`/admin/profiles/${profile.id}/links/${link.id}/edit`} className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">Modifier</Link><form action={toggleCustomLinkVisibleAction.bind(null, profile.id, link.id)}><button className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">{link.isVisible ? "Masquer" : "Afficher"}</button></form><form action={deleteCustomLinkAction.bind(null, profile.id, link.id)}><button className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700">Supprimer</button></form></div></article>)}</section></div>;
}