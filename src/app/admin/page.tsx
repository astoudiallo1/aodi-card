import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { formatMoney, orderStatusLabels, paymentStatusLabels } from "@/lib/admin-labels";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const profileStatLabels = [
  { key: "total", label: "Profils" },
  { key: "active", label: "Profils actifs" },
  { key: "inactive", label: "Profils desactives" },
  { key: "newProfiles", label: "Nouveaux profils" },
] as const;

const orderStatLabels = [
  { key: "ordersTotal", label: "Commandes totales" },
  { key: "ordersOpen", label: "Commandes en cours" },
  { key: "ordersDelivered", label: "Commandes livrees" },
  { key: "paymentsPending", label: "Paiements en attente" },
] as const;

export default async function AdminDashboardPage() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    total,
    active,
    inactive,
    newProfiles,
    latestProfiles,
    ordersTotal,
    ordersOpen,
    ordersDelivered,
    paymentsPending,
    latestOrders,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({ where: { isActive: true } }),
    prisma.profile.count({ where: { isActive: false } }),
    prisma.profile.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.profile.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, displayName: true, company: true, slug: true, isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: { notIn: ["DELIVERED", "CANCELLED"] } } }),
    prisma.order.count({ where: { orderStatus: "DELIVERED" } }),
    prisma.order.count({ where: { paymentStatus: "PENDING" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, orderNumber: true, customerName: true, totalAmount: true, orderStatus: true, paymentStatus: true } }),
  ]);

  const profileStats = { total, active, inactive, newProfiles };
  const orderStats = { ordersTotal, ordersOpen, ordersDelivered, paymentsPending };

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        description="Pilotage commercial des profils, commandes et cartes AODI Card enregistres dans PostgreSQL."
        action={{ href: "/admin/orders/new", label: "Nouvelle commande" }}
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {profileStatLabels.map((stat) => (
          <article key={stat.key} className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aodi-violet-700/60">{stat.label}</p>
            <p className="mt-4 font-display text-5xl font-semibold text-aodi-violet-900">{profileStats[stat.key]}</p>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {orderStatLabels.map((stat) => (
          <article key={stat.key} className="rounded-lg border border-aodi-gold/30 bg-aodi-violet-950 p-5 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aodi-gold-light">{stat.label}</p>
            <p className="mt-4 font-display text-5xl font-semibold text-white">{orderStats[stat.key]}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <article className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-3xl font-semibold text-aodi-violet-900">Commandes recentes</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-aodi-violet-700 hover:text-aodi-gold-dark">Voir les commandes</Link>
          </div>
          <div className="mt-5 divide-y divide-aodi-violet-100/80">
            {latestOrders.length > 0 ? latestOrders.map((order) => (
              <div key={order.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-aodi-violet-900">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-aodi-violet-700/70">{order.customerName} - {formatMoney(order.totalAmount)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminBadge status={order.orderStatus} label={orderStatusLabels[order.orderStatus]} />
                  <AdminBadge kind="payment" status={order.paymentStatus} label={paymentStatusLabels[order.paymentStatus]} />
                </div>
              </div>
            )) : <p className="py-6 text-sm text-aodi-violet-700/70">Aucune commande pour le moment.</p>}
          </div>
        </article>

        <article className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-3xl font-semibold text-aodi-violet-900">Profils recents</h2>
            <Link href="/admin/profiles" className="text-sm font-semibold text-aodi-violet-700 hover:text-aodi-gold-dark">Voir tous les profils</Link>
          </div>
          <div className="mt-5 divide-y divide-aodi-violet-100/80">
            {latestProfiles.length > 0 ? latestProfiles.map((profile) => (
              <div key={profile.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-aodi-violet-900">{profile.displayName}</p>
                  <p className="mt-1 text-sm text-aodi-violet-700/70">{profile.company || "Entreprise non renseignee"} - /{profile.slug}</p>
                </div>
                <span className={profile.isActive ? "w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700" : "w-fit rounded-full bg-aodi-violet-100 px-3 py-1 text-xs font-semibold text-aodi-violet-700"}>
                  {profile.isActive ? "Actif" : "Desactive"}
                </span>
              </div>
            )) : <p className="py-6 text-sm text-aodi-violet-700/70">Aucun profil pour le moment.</p>}
          </div>
        </article>
      </section>
    </div>
  );
}
