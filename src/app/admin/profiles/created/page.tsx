import { AdminHeader } from "@/components/admin/AdminHeader";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

type CreatedProfilePageProps = {
  searchParams: Promise<{ slug?: string }>;
};

async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || "http";

  return `${protocol}://${host}`;
}

export default async function CreatedProfilePage({ searchParams }: CreatedProfilePageProps) {
  const { slug } = await searchParams;

  if (!slug) {
    notFound();
  }

  const baseUrl = await getBaseUrl();
  const profileUrl = `${baseUrl}/${slug}`;

  return (
    <div>
      <AdminHeader
        eyebrow="Profil cree avec succes"
        title="Lien AODI Card pret"
        description="Le profil public a ete cree dans PostgreSQL et peut maintenant etre associe a la carte NFC."
      />

      <section className="mt-8 rounded-lg border border-aodi-gold/40 bg-[#FBF8F1]/90 p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aodi-gold-dark">
          Lien AODI Card
        </p>
        <p className="mt-3 break-all font-display text-3xl font-semibold text-aodi-violet-900">
          {profileUrl}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={`/${slug}`} className="inline-flex items-center justify-center rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-aodi-violet-800">
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
