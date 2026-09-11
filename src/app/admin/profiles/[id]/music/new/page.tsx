import { AdminHeader } from "@/components/admin/AdminHeader";
import { MusicTrackForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createMusicTrackAction } from "../../content-actions";

type PageProps = { params: Promise<{ id: string }> };
export default async function NewMusicPage({ params }: PageProps) { const { id } = await params; const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true } }); if (!profile) notFound(); return <div><AdminHeader eyebrow="Musique" title={`Nouvelle sortie - ${profile.displayName}`} /><MusicTrackForm action={createMusicTrackAction.bind(null, profile.id)} submitLabel="Ajouter" /></div>; }