import { requireAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  emptyYouTubeChannelConfig,
  parseYouTubeChannelInput,
  resolveYouTubeChannel,
  revalidateYouTubeFeed,
  YouTubeInputError,
  youtubeHandleUrl,
  type YouTubeChannelConfig,
} from "@/lib/youtube";
import { Prisma, ProfileSectionType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };
type ProfileRef = { id: string; slug: string };

type YouTubeSaveStatus = "saved" | "saved-feed" | "saved-no-api" | "saved-api-error" | "cleared" | "invalid" | "not-found" | "error";

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function redirectToMusic(profileId: string, status: YouTubeSaveStatus) {
  return new Response(null, { status: 303, headers: { Location: `/admin/profiles/${profileId}/music?youtube=${status}` } });
}

function revalidateProfile(profile: ProfileRef) {
  revalidatePath(`/admin/profiles/${profile.id}`);
  revalidatePath(`/admin/profiles/${profile.id}/music`);
  revalidatePath(`/${profile.slug}`);
}

// Les autres cles du config MUSIC sont conservees : seule la partie YouTube est remplacee.
async function saveYouTubeConfig(profileId: string, config: YouTubeChannelConfig) {
  const existing = await prisma.profileSection.findUnique({
    where: { profileId_type: { profileId, type: ProfileSectionType.MUSIC } },
    select: { config: true },
  });
  const previous = existing?.config && typeof existing.config === "object" && !Array.isArray(existing.config) ? existing.config : {};
  const nextConfig = { ...previous, ...config } satisfies Prisma.InputJsonObject;

  await prisma.profileSection.upsert({
    where: { profileId_type: { profileId, type: ProfileSectionType.MUSIC } },
    create: { profileId, type: ProfileSectionType.MUSIC, enabled: true, sortOrder: 40, title: "Dernieres sorties", config: nextConfig },
    update: { config: nextConfig },
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  await requireAdminAccess();
  const { id } = await context.params;

  try {
    const formData = await request.formData();
    const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, slug: true } });
    if (!profile) return NextResponse.redirect(new URL("/admin/profiles", request.url), { status: 303 });

    const rawUrl = optionalString(formData, "youtubeChannelUrl");
    if (!rawUrl) {
      await saveYouTubeConfig(profile.id, emptyYouTubeChannelConfig());
      revalidateProfile(profile);
      return redirectToMusic(profile.id, "cleared");
    }

    let input;
    try {
      input = parseYouTubeChannelInput(rawUrl);
    } catch (error) {
      if (error instanceof YouTubeInputError) return redirectToMusic(profile.id, "invalid");
      throw error;
    }

    const resolution = await resolveYouTubeChannel(input);
    if (resolution.status === "not_found") return redirectToMusic(profile.id, "not-found");

    const resolved = resolution.status === "resolved" ? resolution.channel : null;
    const handle = resolved?.handle ?? (input.kind === "handle" ? input.handle : null);
    const config: YouTubeChannelConfig = {
      youtubeChannelUrl: handle ? youtubeHandleUrl(handle) : input.url,
      youtubeChannelId: resolved?.channelId ?? (input.kind === "channelId" ? input.channelId : null),
      youtubeChannelTitle: resolved?.title ?? null,
      youtubeHandle: handle,
      youtubeUploadsPlaylistId: resolved?.uploadsPlaylistId ?? null,
    };

    await saveYouTubeConfig(profile.id, config);
    revalidateYouTubeFeed(config);
    revalidateProfile(profile);

    if (resolved) return redirectToMusic(profile.id, "saved");
    if (resolution.status === "api_error") return redirectToMusic(profile.id, "saved-api-error");
    // Sans cle API, un ID de chaine reste synchronisable via le flux public ; un @handle ne peut pas etre resolu.
    return redirectToMusic(profile.id, config.youtubeChannelId ? "saved-feed" : "saved-no-api");
  } catch (error) {
    console.error("[youtube] enregistrement de la chaine impossible", { profileId: id, error });
    return redirectToMusic(id, "error");
  }
}
