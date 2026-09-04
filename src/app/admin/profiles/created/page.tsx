import { AdminHeader } from "@/components/admin/AdminHeader";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

type CreatedProfilePageProps = {
  searchParams: Promise<{ slug?: string }>;
};

async function getConfirmationBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl && !/localhost|127\.0\.0\.1/i.test(configuredUrl)) {
    return configuredUrl.replace(/\/$/, "");
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") || "https";

  if (!host) {
    return "https://aodi-card.vercel.app";
  }

  return `${protocol}://${host}`.replace(/\/$/, "");
}

function logCreatedProfileStep(step: string, details: Record<string, unknown> = {}) {
  console.info("[AODI CreatedProfilePage]", step, details);
}

export default async function CreatedProfilePage({ searchParams }: CreatedProfilePageProps) {
  logCreatedProfileStep("start");
  const { slug } = await searchParams;
  logCreatedProfileStep("slug", { slug });

  if (!slug) {
    notFound();
  }

  const profile = await prisma.profile.findUnique({
    where: { slug },
    select: { slug: true },
  });

  if (!profile) {
    notFound();
  }

  const baseUrl = await getConfirmationBaseUrl();
  const profileUrl = `${baseUrl}/${profile.slug}`;
  logCreatedProfileStep("url", { slug: profile.slug, baseUrl });
  logCreatedProfileStep("render", { slug: profile.slug });

  return (
    <div>
      <AdminHeader
        eyebrow="Profil cree avec succes"
        title="Lien AODI Card pret"
        description="Le profil public a ete cree en base et peut maintenant etre associe a la carte NFC."
      />

      <section className="mt-8 rounded-lg border border-aodi-gold/40 bg-[#FBF8F1]/90 p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aodi-gold-dark">
          Lien AODI Card
        </p>
        <p className="mt-3 break-all font-display text-3xl font-semibold text-aodi-violet-900">
          {profileUrl}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={`/${profile.slug}`} className="inline-flex items-center justify-center rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-aodi-violet-800">
            Voir le profil
          </Link>
          <CopyLinkButton url={profileUrl} />
          <Link href="/admin/profiles" className="inline-flex items-center justify-center rounded-lg border border-aodi-violet-200 bg-white px-5 py-3 text-sm font-semibold text-aodi-violet-900 transition hover:border-aodi-gold">
            Retour aux profils
          </Link>
        </div>
      </section>
    </div>
  );
}
