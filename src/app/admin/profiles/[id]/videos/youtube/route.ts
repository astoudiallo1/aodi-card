import { requireAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { optionalFormString, submitSectionYouTubeChannel, type YouTubeSaveStatus } from "@/lib/youtube-admin";
import { ProfileSectionType } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

// Chaine YouTube de la section VIDEOS (module generique) : meme flux partage que la section MUSIC.
export async function POST(request: NextRequest, context: RouteContext) {
  await requireAdminAccess();
  const { id } = await context.params;

  const redirectToVideos = (status: YouTubeSaveStatus) => new Response(null, { status: 303, headers: { Location: `/admin/profiles/${id}/videos?youtube=${status}` } });

  try {
    const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, slug: true } });
    if (!profile) return NextResponse.redirect(new URL("/admin/profiles", request.url), { status: 303 });

    const formData = await request.formData();
    return redirectToVideos(await submitSectionYouTubeChannel(profile, ProfileSectionType.VIDEOS, optionalFormString(formData, "youtubeChannelUrl")));
  } catch (error) {
    console.error("[youtube] formulaire de chaine illisible", { profileId: id, error });
    return redirectToVideos("error");
  }
}
