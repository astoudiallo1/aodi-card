import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { cardStatusLabels, formatDate } from "@/lib/admin-labels";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  const cards = await prisma.card.findMany({
    orderBy: { createdAt: "desc" },
    include: { profile: { select: { displayName: true, slug: true } }, order: { select: { id: true, orderNumber: true } } },
  });

  return (
    <div>
      <AdminHeader title="Cartes NFC" description="Cartes AODI Card disponibles, attribuees, verifiees et livrees." />
      <section className="mt-8 overflow-hidden rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 shadow-sm">
        <div className="hidden grid-cols-[1fr_1fr_1.2fr_1fr_1fr_1fr] gap-4 border-b border-aodi-violet-100 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-aodi-violet-700/60 xl:grid">
          <span>Numero</span><span>Statut</span><span>Profil</span><span>Commande</span><span>URL NFC</span><span>Date</span>
        </div>
        <div className="divide-y divide-aodi-violet-100">
          {cards.length > 0 ? cards.map((card) => (
            <article key={card.id} className="grid gap-3 px-5 py-5 xl:grid-cols-[1fr_1fr_1.2fr_1fr_1fr_1fr] xl:items-center">
              <Link href={`/admin/cards/${card.id}`} className="font-semibold text-aodi-violet-900 hover:text-aodi-gold-dark">{card.cardNumber}</Link>
              <AdminBadge kind="card" status={card.status} label={cardStatusLabels[card.status]} />
              <p className="text-sm text-aodi-violet-800">{card.profile ? `${card.profile.displayName} - /${card.profile.slug}` : "-"}</p>
              <p className="text-sm text-aodi-violet-800">{card.order ? <Link href={`/admin/orders/${card.order.id}`} className="font-semibold hover:text-aodi-gold-dark">{card.order.orderNumber}</Link> : "-"}</p>
              <p className="text-sm text-aodi-violet-800">{card.nfcUrl || "-"}</p>
              <p className="text-sm text-aodi-violet-700/70">{formatDate(card.createdAt)}</p>
            </article>
          )) : <p className="px-5 py-10 text-sm text-aodi-violet-700/70">Aucune carte pour le moment.</p>}
        </div>
      </section>
    </div>
  );
}
