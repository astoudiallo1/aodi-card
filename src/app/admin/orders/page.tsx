import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { formatDate, formatMoney, orderStatusLabels, paymentStatusLabels } from "@/lib/admin-labels";
import { prisma } from "@/lib/prisma";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import Link from "next/link";
import { updateOrderStatusAction } from "./actions";

export const dynamic = "force-dynamic";

type OrdersPageProps = {
  searchParams: Promise<{ q?: string; status?: string; payment?: string; sort?: string }>;
};

const orderStatuses = Object.keys(orderStatusLabels) as OrderStatus[];
const paymentStatuses = Object.keys(paymentStatusLabels) as PaymentStatus[];

function validOrderStatus(value?: string): OrderStatus | undefined {
  return orderStatuses.includes(value as OrderStatus) ? (value as OrderStatus) : undefined;
}

function validPaymentStatus(value?: string): PaymentStatus | undefined {
  return paymentStatuses.includes(value as PaymentStatus) ? (value as PaymentStatus) : undefined;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { q = "", status, payment, sort = "desc" } = await searchParams;
  const query = q.trim();
  const orderStatus = validOrderStatus(status);
  const paymentStatus = validPaymentStatus(payment);

  const orders = await prisma.order.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { orderNumber: { contains: query, mode: "insensitive" } },
              { customerName: { contains: query, mode: "insensitive" } },
              { customerPhone: { contains: query, mode: "insensitive" } },
              { companyName: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(orderStatus ? { orderStatus } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
    },
    orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
  });

  return (
    <div>
      <AdminHeader
        title="Commandes"
        description="Suivi commercial des commandes AODI Card, du paiement jusqu'a la livraison."
        action={{ href: "/admin/orders/new", label: "Nouvelle commande" }}
      />

      <form className="mt-8 grid gap-3 rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-4 shadow-sm lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]" action="/admin/orders">
        <input name="q" defaultValue={query} placeholder="Recherche" className="rounded-lg border border-aodi-violet-100 bg-white px-4 py-3 text-sm outline-none focus:border-aodi-gold" />
        <select name="status" defaultValue={orderStatus ?? ""} className="rounded-lg border border-aodi-violet-100 bg-white px-4 py-3 text-sm outline-none focus:border-aodi-gold">
          <option value="">Tous statuts</option>
          {orderStatuses.map((item) => <option key={item} value={item}>{orderStatusLabels[item]}</option>)}
        </select>
        <select name="payment" defaultValue={paymentStatus ?? ""} className="rounded-lg border border-aodi-violet-100 bg-white px-4 py-3 text-sm outline-none focus:border-aodi-gold">
          <option value="">Tous paiements</option>
          {paymentStatuses.map((item) => <option key={item} value={item}>{paymentStatusLabels[item]}</option>)}
        </select>
        <select name="sort" defaultValue={sort === "asc" ? "asc" : "desc"} className="rounded-lg border border-aodi-violet-100 bg-white px-4 py-3 text-sm outline-none focus:border-aodi-gold">
          <option value="desc">Plus recentes</option>
          <option value="asc">Plus anciennes</option>
        </select>
        <button className="rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-semibold text-white" type="submit">Filtrer</button>
      </form>

      <section className="mt-5 overflow-hidden rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 shadow-sm">
        <div className="hidden grid-cols-[1fr_1.2fr_1fr_.7fr_1fr_1fr_1fr_1fr_1.4fr] gap-3 border-b border-aodi-violet-100 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-aodi-violet-700/60 xl:grid">
          <span>Numero</span><span>Client</span><span>Telephone</span><span>Qte</span><span>Montant</span><span>Paiement</span><span>Statut</span><span>Date</span><span>Actions</span>
        </div>
        <div className="divide-y divide-aodi-violet-100">
          {orders.length > 0 ? orders.map((order) => (
            <article key={order.id} className="grid gap-3 px-5 py-5 xl:grid-cols-[1fr_1.2fr_1fr_.7fr_1fr_1fr_1fr_1fr_1.4fr] xl:items-center">
              <p className="font-semibold text-aodi-violet-900">{order.orderNumber}</p>
              <p className="text-sm text-aodi-violet-800">{order.customerName}</p>
              <p className="text-sm text-aodi-violet-800">{order.customerPhone || "-"}</p>
              <p className="text-sm text-aodi-violet-800">{order.quantity}</p>
              <p className="text-sm font-semibold text-aodi-violet-900">{formatMoney(order.totalAmount)}</p>
              <AdminBadge kind="payment" status={order.paymentStatus} label={paymentStatusLabels[order.paymentStatus]} />
              <AdminBadge status={order.orderStatus} label={orderStatusLabels[order.orderStatus]} />
              <p className="text-sm text-aodi-violet-700/70">{formatDate(order.createdAt)}</p>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/orders/${order.id}`} className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold text-aodi-violet-900 hover:border-aodi-gold">Voir</Link>
                <Link href={`/admin/orders/${order.id}/edit`} className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold text-aodi-violet-900 hover:border-aodi-gold">Modifier</Link>
                <form action={updateOrderStatusAction.bind(null, order.id)} className="flex gap-1">
                  <input type="hidden" name="paymentStatus" value={order.paymentStatus} />
                  <select name="orderStatus" defaultValue={order.orderStatus} className="max-w-32 rounded-lg border border-aodi-violet-100 bg-white px-2 py-2 text-xs">
                    {orderStatuses.map((item) => <option key={item} value={item}>{orderStatusLabels[item]}</option>)}
                  </select>
                  <button className="rounded-lg bg-aodi-violet-900 px-3 py-2 text-xs font-semibold text-white" type="submit">OK</button>
                </form>
              </div>
            </article>
          )) : <p className="px-5 py-10 text-sm text-aodi-violet-700/70">Aucune commande trouvee.</p>}
        </div>
      </section>
    </div>
  );
}
