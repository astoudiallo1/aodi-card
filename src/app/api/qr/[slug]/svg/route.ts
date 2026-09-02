import { getProfilePublicUrl } from "@/lib/public-url";
import { createQrSvg } from "@/lib/qr-code";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type QrRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: QrRouteProps) {
  const { slug } = await params;
  const profile = await prisma.profile.findUnique({ where: { slug }, select: { slug: true } });

  if (!profile) {
    notFound();
  }

  const value = getProfilePublicUrl(profile.slug);
  const svg = await createQrSvg(value);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `inline; filename="aodi-card-${profile.slug}-qr.svg"`,
      "Cache-Control": "no-store",
    },
  });
}
