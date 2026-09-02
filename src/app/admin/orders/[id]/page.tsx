import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { cardStatusLabels, formatDate, formatMoney, orderStatusLabels, orderTimeline, paymentStatusLabels } from "@/lib/admin-labels";
import { prisma } from "@/lib/prisma";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assignCardsAction, associateProfileAction, markDeliveredAction, markProgrammedAction, markReadyAction, updateOrderStatusAction } from "../actions";

type OrderPageProps = { params: Promise<{ id: string }> };

const orderStatuses = Object.keys(orderStatusLabels) as OrderStatus[];
const paymentStatuses = Object.keys(paymentStatusLabels) as PaymentStatus[];

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { profile: true, cards: { orderBy: { createdAt: "asc" } } },
  });

  if (!order) notFound();

  const profiles = await prisma.profile.findMany({
    orderBy: { displayName: "asc" },
    select: { id: true, displayName: true, slug: true },
  });
  const timelineIndex = orderTimeline.indexOf(order.orderStatus);

  return (
    <div>
      <AdminHeader
        eyebrow="Fiche commande"
        title={order.orderNumber}
        description={`${order.customerName} - ${formatMoney(order.totalAmount)}`}
        action={{ href: "/admin/orders", label: "Retour commandes" }}
      />

      <section className="mt-8 grid gap-4 lg:grid-cols-4">
        <article className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm lg:col-span-3">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Client" value={order.customerName} />
            <Info label="Telephone" value={order.customerPhone || "-"} />
            <Info label="Entreprise" value={order.companyName || "-"} />
            <Info label="Quantite" value={String(order.quantity)} />
            <Info label="Prix unitaire" value={formatMoney(order.unitPrice)} />
            <Info label="Montant total" value={formatMoney(order.totalAmount)} />
            <div><Label>Paiement</Label><AdminBadge kind="payment" status={order.paymentStatus} label={paymentStatusLabels[order.paymentStatus]} /></div>
            <div><Label>Statut</Label><AdminBadge status={order.orderStatus} label={orderStatusLabels[order.orderStatus]} /></div>
          </div>
        </article>

        <article className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm">
          <Label>Dates importantes</Label>
          <p className="mt-3 text-sm text-aodi-violet-800">Creee : {formatDate(order.createdAt)}</p>
          <p className="mt-2 text-sm text-aodi-violet-800">Payee : {formatDate(order.paidAt)}</p>
          <p className="mt-2 text-sm text-aodi-violet-800">Livree : {formatDate(order.completedAt)}</p>
        </article>
      </section>

      <section className="mt-5 rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-3xl font-semibold text-aodi-violet-900">Timeline</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-4 xl:grid-cols-7">
          {orderTimeline.map((status, index) => (
            <div key={status} className={index <= timelineIndex ? "rounded-lg border border-aodi-gold/40 bg-aodi-gold/15 p-4" : "rounded-lg border border-aodi-violet-100 bg-white/70 p-4"}>
              <p className="text-sm font-semibold text-aodi-violet-900">{orderStatusLabels[status]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <article className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-3xl font-semibold text-aodi-violet-900">Profil lie</h2>
          {order.profile ? (
            <div className="mt-4">
              <p className="font-semibold text-aodi-violet-900">{order.profile.displayName}</p>
              <p className="mt-1 text-sm text-aodi-violet-700/70">/{order.profile.slug}</p>
              <Link href={`/${order.profile.slug}`} className="mt-4 inline-flex rounded-lg border border-aodi-violet-200 bg-white px-4 py-2 text-sm font-semibold text-aodi-violet-900 hover:border-aodi-gold">Voir le profil</Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <form action={associateProfileAction.bind(null, order.id)} className="flex flex-col gap-3 sm:flex-row">
                <select name="profileId" required className="flex-1 rounded-lg border border-aodi-violet-100 bg-white px-4 py-3 text-sm">
                  <option value="">Choisir un profil existant</option>
                  {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.displayName} - /{profile.slug}</option>)}
                </select>
                <button type="submit" className="rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-semibold text-white">Associer</button>
              </form>
              <Link href={`/admin/orders/${order.id}/profile/new`} className="inline-flex rounded-lg border border-aodi-violet-200 bg-white px-5 py-3 text-sm font-semibold text-aodi-violet-900 hover:border-aodi-gold">Creer le profil AODI Card</Link>
            </div>
          )}
        </article>

        <article className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-3xl font-semibold text-aodi-violet-900">Cartes associees</h2>
          <div className="mt-4 space-y-3">
            {order.cards.length > 0 ? order.cards.map((card) => (
              <div key={card.id} className="rounded-lg border border-aodi-violet-100 bg-white/80 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-aodi-violet-900">{card.cardNumber}</p>
                  <AdminBadge kind="card" status={card.status} label={cardStatusLabels[card.status]} />
                </div>
                <p className="mt-2 text-sm text-aodi-violet-700/70">URL NFC : {card.nfcUrl || "-"}</p>
              </div>
            )) : <p className="text-sm text-aodi-violet-700/70">Aucune carte attribuee.</p>}
          </div>
          <form action={assignCardsAction.bind(null, order.id)} className="mt-5">
            <button type="submit" className="rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40" disabled={!order.profile}>
              Attribuer une carte NFC
            </button>
          </form>
        </article>
      </section>

      <section className="mt-5 rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-3xl font-semibold text-aodi-violet-900">Actions</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <form action={updateOrderStatusAction.bind(null, order.id)} className="grid gap-3 sm:grid-cols-3">
            <select name="paymentStatus" defaultValue={order.paymentStatus} className="rounded-lg border border-aodi-violet-100 bg-white px-4 py-3 text-sm">
              {paymentStatuses.map((status) => <option key={status} value={status}>{paymentStatusLabels[status]}</option>)}
            </select>
            <select name="orderStatus" defaultValue={order.orderStatus} className="rounded-lg border border-aodi-violet-100 bg-white px-4 py-3 text-sm">
              {orderStatuses.map((status) => <option key={status} value={status}>{orderStatusLabels[status]}</option>)}
            </select>
            <button type="submit" className="rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-semibold text-white">Mettre a jour</button>
          </form>
          <div className="flex flex-wrap gap-3">
            <form action={markProgrammedAction.bind(null, order.id)}><button className="rounded-lg border border-aodi-violet-200 bg-white px-4 py-3 text-sm font-semibold text-aodi-violet-900 hover:border-aodi-gold" type="submit">Marquer programmee</button></form>
            <form action={markReadyAction.bind(null, order.id)}><button className="rounded-lg border border-aodi-violet-200 bg-white px-4 py-3 text-sm font-semibold text-aodi-violet-900 hover:border-aodi-gold" type="submit">Marquer comme prete</button></form>
            <form action={markDeliveredAction.bind(null, order.id)}><button className="rounded-lg bg-aodi-violet-900 px-4 py-3 text-sm font-semibold text-white" type="submit">Marquer comme livree</button></form>
          </div>
        </div>
      </section>

      {order.notes ? (
        <section className="mt-5 rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-3xl font-semibold text-aodi-violet-900">Notes</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-aodi-violet-800">{order.notes}</p>
        </section>
      ) : null}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-aodi-violet-700/60">{children}</p>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><Label>{label}</Label><p className="text-sm font-semibold text-aodi-violet-900">{value}</p></div>;
}
