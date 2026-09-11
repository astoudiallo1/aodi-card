import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateStatAction } from "../../../content-actions";

type PageProps = { params: Promise<{ id: string; itemId: string }> };
export default async function EditStatPage({ params }: PageProps) { const { id, itemId } = await params; const stat = await prisma.profileStat.findFirst({ where: { id: itemId, profileId: id }, include: { profile: { select: { id: true, displayName: true } } } }); if (!stat) notFound(); return <div><AdminHeader eyebrow="Statistiques" title={`Modifier ${stat.label}`} description={stat.profile.displayName} /><StatForm action={updateStatAction.bind(null, stat.profile.id, stat.id)} submitLabel="Enregistrer" item={stat} /></div>; }