import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createStatAction } from "../../content-actions";

type PageProps = { params: Promise<{ id: string }> };
export default async function NewStatPage({ params }: PageProps) { const { id } = await params; const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true } }); if (!profile) notFound(); return <div><AdminHeader eyebrow="Statistiques" title={`Nouvelle statistique - ${profile.displayName}`} /><StatForm action={createStatAction.bind(null, profile.id)} submitLabel="Ajouter" /></div>; }