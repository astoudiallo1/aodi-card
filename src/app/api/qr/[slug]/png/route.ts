import { getProfilePublicUrl } from "@/lib/public-url";
import { createQrPngBuffer } from "@/lib/qr-code";
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
  const png = new Uint8Array(await createQrPngBuffer(value));

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="aodi-card-${profile.slug}-qr.png"`,
      "Cache-Control": "no-store",
    },
  });
}

