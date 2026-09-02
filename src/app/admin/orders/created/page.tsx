import { AdminHeader } from "@/components/admin/AdminHeader";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type CreatedOrderPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function CreatedOrderPage({ searchParams }: CreatedOrderPageProps) {
  const { id } = await searchParams;
  if (!id) notFound();

  const order = await prisma.order.findUnique({ where: { id }, select: { id: true, orderNumber: true, profileId: true } });
  if (!order) notFound();

  return (
    <div>
      <AdminHeader
        eyebrow="Commande creee avec succes"
        title={order.orderNumber}
        description="La commande est enregistree dans PostgreSQL et peut maintenant avancer dans le parcours AODI Card."
      />
      <section className="mt-8 rounded-lg border border-aodi-gold/40 bg-[#FBF8F1]/90 p-6 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={`/admin/orders/${order.id}/profile/new`} className="inline-flex items-center justify-center rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-aodi-violet-800">
            Creer le profil client
          </Link>
          <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center justify-center rounded-lg border border-aodi-violet-200 bg-white px-5 py-3 text-sm font-semibold text-aodi-violet-900 transition hover:border-aodi-gold">
            Associer un profil existant
          </Link>
          <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center justify-center rounded-lg border border-aodi-violet-200 bg-white px-5 py-3 text-sm font-semibold text-aodi-violet-900 transition hover:border-aodi-gold">
            Voir la commande
          </Link>
        </div>
      </section>
    </div>
  );
}
