import { AdminHeader } from "@/components/admin/AdminHeader";
import { MusicTrackForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateMusicTrackAction } from "../../../content-actions";

type PageProps = { params: Promise<{ id: string; itemId: string }> };
export default async function EditMusicPage({ params }: PageProps) { const { id, itemId } = await params; const track = await prisma.musicTrack.findFirst({ where: { id: itemId, profileId: id }, include: { profile: { select: { id: true, displayName: true } } } }); if (!track) notFound(); return <div><AdminHeader eyebrow="Musique" title={`Modifier ${track.title}`} description={track.profile.displayName} /><MusicTrackForm action={updateMusicTrackAction.bind(null, track.profile.id, track.id)} submitLabel="Enregistrer" item={track} /></div>; }