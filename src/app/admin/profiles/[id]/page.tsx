import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileContentNav } from "@/components/admin/ProfileContentNav";
import { QrCodePanel } from "@/components/admin/QrCodePanel";
import { prisma } from "@/lib/prisma";
import { getProfilePublicUrl } from "@/lib/public-url";
import Link from "next/link";
import { notFound } from "next/navigation";

type AdminProfilePageProps = { params: Promise<{ id: string }> };

export default async function AdminProfilePage({ params }: AdminProfilePageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({
    where: { id },
    include: { cards: { orderBy: { createdAt: "desc" } }, orders: { orderBy: { createdAt: "desc" }, take: 5 } },
  });

  if (!profile) notFound();

  const publicUrl = getProfilePublicUrl(profile.slug);

  return (
    <div>
      <AdminHeader
        eyebrow="Fiche profil"
        title={profile.displayName}
        description={`QR personnel et URL stable : /${profile.slug}`}
        action={{ href: `/admin/profiles/${profile.id}/edit`, label: "Modifier" }}
      />

      <ProfileContentNav profileId={profile.id} active="Apercu" />

      <div className="mt-8">
        <QrCodePanel displayName={profile.displayName} slug={profile.slug} publicUrl={publicUrl} photo={profile.profilePhoto} />
      </div>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <article className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-3xl font-semibold text-aodi-violet-900">Cartes liees</h2>
          <div className="mt-4 space-y-3">
            {profile.cards.length > 0 ? profile.cards.map((card) => (
              <Link key={card.id} href={`/admin/cards/${card.id}`} className="block rounded-lg border border-aodi-violet-100 bg-white/80 p-4 hover:border-aodi-gold">
                <p className="font-semibold text-aodi-violet-900">{card.cardNumber}</p>
                <p className="mt-1 text-sm text-aodi-violet-700/70">NFC : {card.nfcUrl || "-"}</p>
              </Link>
            )) : <p className="text-sm text-aodi-violet-700/70">Aucune carte liee.</p>}
          </div>
        </article>

        <article className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-3xl font-semibold text-aodi-violet-900">Commandes liees</h2>
          <div className="mt-4 space-y-3">
            {profile.orders.length > 0 ? profile.orders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="block rounded-lg border border-aodi-violet-100 bg-white/80 p-4 hover:border-aodi-gold">
                <p className="font-semibold text-aodi-violet-900">{order.orderNumber}</p>
                <p className="mt-1 text-sm text-aodi-violet-700/70">{order.customerName}</p>
              </Link>
            )) : <p className="text-sm text-aodi-violet-700/70">Aucune commande liee.</p>}
          </div>
        </article>
      </section>
    </div>
  );
}
