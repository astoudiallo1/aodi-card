import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileContentNav } from "@/components/admin/ProfileContentNav";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteStatAction, toggleStatVisibleAction } from "../content-actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminProfileStatsPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true, slug: true } });
  if (!profile) notFound();
  const stats = await prisma.profileStat.findMany({ where: { profileId: profile.id }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return <div><AdminHeader eyebrow="Statistiques" title={profile.displayName} description={`Chiffres affiches sur /${profile.slug}.`} action={{ href: `/admin/profiles/${profile.id}/stats/new`, label: "Ajouter une statistique" }} /><ProfileContentNav profileId={profile.id} active="Statistiques" /><section className="mt-6 overflow-hidden rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 shadow-sm">{stats.length === 0 ? <div className="p-6"><p className="text-sm text-aodi-violet-700/70">Aucune statistique pour le moment.</p><Link href={`/admin/profiles/${profile.id}/stats/new`} className="mt-4 inline-flex rounded-lg bg-aodi-violet-900 px-4 py-2 text-sm font-semibold text-white">Ajouter une statistique</Link></div> : stats.map((stat) => <article key={stat.id} className="grid gap-4 border-b border-aodi-violet-100 p-5 lg:grid-cols-[160px_1fr_120px] lg:items-center"><div><p className="text-2xl font-black text-aodi-violet-950">{stat.value}</p><p className="text-sm font-semibold text-aodi-violet-700/75">{stat.label}</p></div><p className="text-xs text-aodi-violet-700/60">Ordre {stat.sortOrder} - {stat.isVisible ? "Visible" : "Masque"}</p><div className="flex flex-wrap gap-2"><Link href={`/admin/profiles/${profile.id}/stats/${stat.id}/edit`} className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">Modifier</Link><form action={toggleStatVisibleAction.bind(null, profile.id, stat.id)}><button className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">{stat.isVisible ? "Masquer" : "Afficher"}</button></form><form action={deleteStatAction.bind(null, profile.id, stat.id)}><button className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700">Supprimer</button></form></div></article>)}</section></div>;
}