import { AdminHeader } from "@/components/admin/AdminHeader";
import { EventForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateEventAction } from "../../../content-actions";

type PageProps = { params: Promise<{ id: string; itemId: string }> };
export default async function EditEventPage({ params }: PageProps) { const { id, itemId } = await params; const event = await prisma.profileEvent.findFirst({ where: { id: itemId, profileId: id }, include: { profile: { select: { id: true, displayName: true } } } }); if (!event) notFound(); return <div><AdminHeader eyebrow="Evenements" title={`Modifier ${event.title}`} description={event.profile.displayName} /><EventForm action={updateEventAction.bind(null, event.profile.id, event.id)} submitLabel="Enregistrer" item={event} /></div>; }