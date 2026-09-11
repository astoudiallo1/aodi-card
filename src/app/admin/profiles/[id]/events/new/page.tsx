import { AdminHeader } from "@/components/admin/AdminHeader";
import { EventForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createEventAction } from "../../content-actions";

type PageProps = { params: Promise<{ id: string }> };
export default async function NewEventPage({ params }: PageProps) { const { id } = await params; const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true } }); if (!profile) notFound(); return <div><AdminHeader eyebrow="Evenements" title={`Nouvel evenement - ${profile.displayName}`} /><EventForm action={createEventAction.bind(null, profile.id)} submitLabel="Ajouter" /></div>; }