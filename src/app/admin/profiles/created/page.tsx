import { AdminHeader } from "@/components/admin/AdminHeader";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { getPublicAppUrl } from "@/lib/public-url";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type CreatedProfilePageProps = {
  searchParams: Promise<{ slug?: string }>;
};

export default async function CreatedProfilePage({ searchParams }: CreatedProfilePageProps) {
  const { slug } = await searchParams;

  if (!slug) {
    notFound();
  }

  const profile = await prisma.profile.findUnique({
    where: { slug },
    select: { slug: true, ownerToken: true },
  });

  if (!profile) {
    notFound();
  }

  const baseUrl = getPublicAppUrl();
  const profileUrl = `${baseUrl}/${profile.slug}`;
  const dashboardUrl = `${baseUrl}/dashboard?slug=${encodeURIComponent(profile.slug)}&token=${encodeURIComponent(profile.ownerToken)}`;

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

      <section className="mt-5 rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aodi-violet-700/70">
          Acces dashboard client
        </p>
        <p className="mt-3 break-all text-sm font-semibold text-aodi-violet-900">{dashboardUrl}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href={`/dashboard?slug=${encodeURIComponent(profile.slug)}&token=${encodeURIComponent(profile.ownerToken)}`} className="inline-flex items-center justify-center rounded-lg bg-aodi-gold px-5 py-3 text-sm font-semibold text-aodi-violet-950 transition hover:bg-aodi-gold-light">
            Ouvrir le dashboard
          </Link>
          <CopyLinkButton url={dashboardUrl} />
        </div>
      </section>
    </div>
  );
}
