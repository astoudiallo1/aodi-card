import { requireAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { optionalFormString, submitArtistYouTubeChannel, type YouTubeSaveStatus } from "@/lib/youtube-admin";
import { NextResponse, type NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string; itemId: string }> };

// Chaine YouTube d'un artiste accompagne : meme flux partage que les sections MUSIC / VIDEOS, cible = ManagedArtist.
export async function POST(request: NextRequest, context: RouteContext) {
  await requireAdminAccess();
  const { id, itemId } = await context.params;

  const redirectToArtist = (status: YouTubeSaveStatus) => new Response(null, { status: 303, headers: { Location: `/admin/profiles/${id}/artists/${itemId}/edit?youtube=${status}` } });

  try {
    const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, slug: true } });
    if (!profile) return NextResponse.redirect(new URL("/admin/profiles", request.url), { status: 303 });

    const formData = await request.formData();
    return redirectToArtist(await submitArtistYouTubeChannel(profile, itemId, optionalFormString(formData, "youtubeChannelUrl")));
  } catch (error) {
    console.error("[youtube] formulaire de chaine artiste illisible", { profileId: id, artistId: itemId, error });
    return redirectToArtist("error");
  }
}
