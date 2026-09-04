/* eslint-disable @next/next/no-img-element */
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileContentNav } from "@/components/admin/ProfileContentNav";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteServiceAction, toggleServiceVisibleAction } from "../content-actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminProfileServicesPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true, slug: true } });
  if (!profile) notFound();
  const services = await prisma.service.findMany({ where: { profileId: profile.id }, orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }] });
  return <div><AdminHeader eyebrow="Services" title={profile.displayName} description={`Services affiches sur /${profile.slug}.`} action={{ href: `/admin/profiles/${profile.id}/services/new`, label: "Ajouter un service" }} /><ProfileContentNav profileId={profile.id} active="Services" /><section className="mt-6 overflow-hidden rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 shadow-sm">{services.length === 0 ? <div className="p-6"><p className="text-sm text-aodi-violet-700/70">Aucun service pour ce profil.</p><Link href={`/admin/profiles/${profile.id}/services/new`} className="mt-4 inline-flex rounded-lg bg-aodi-violet-900 px-4 py-2 text-sm font-semibold text-white">Ajouter le premier service</Link></div> : services.map((service) => <article key={service.id} className="grid gap-4 border-b border-aodi-violet-100 p-5 lg:grid-cols-[80px_1fr_120px] lg:items-center"><div className="h-16 w-16 overflow-hidden rounded-lg bg-aodi-violet-950/10">{service.imageUrl ? <img src={service.imageUrl} alt={service.name} className="h-full w-full object-cover" /> : null}</div><div><p className="font-semibold text-aodi-violet-900">{service.name}</p><p className="mt-1 text-sm text-aodi-violet-700/70">{service.price === null ? "Prix non renseigne" : `${new Intl.NumberFormat("fr-FR").format(service.price)} ${service.currency ?? "FCFA"}`}</p><p className="mt-1 text-xs text-aodi-violet-700/60">Ordre {service.displayOrder} - {service.isVisible ? "Visible" : "Masque"}</p></div><div className="flex flex-wrap gap-2"><Link href={`/admin/profiles/${profile.id}/services/${service.id}/edit`} className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">Modifier</Link><form action={toggleServiceVisibleAction.bind(null, profile.id, service.id)}><button className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">{service.isVisible ? "Masquer" : "Afficher"}</button></form><form action={deleteServiceAction.bind(null, profile.id, service.id)}><button className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700">Supprimer</button></form></div></article>)}</section></div>;
}