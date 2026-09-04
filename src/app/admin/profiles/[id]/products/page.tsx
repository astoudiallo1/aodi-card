/* eslint-disable @next/next/no-img-element */
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileContentNav } from "@/components/admin/ProfileContentNav";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProductAction, toggleProductAvailableAction, toggleProductFeaturedAction, toggleProductVisibleAction } from "../content-actions";

type PageProps = { params: Promise<{ id: string }> };

function money(value: number | null, currency = "FCFA") {
  return value === null ? "-" : `${new Intl.NumberFormat("fr-FR").format(value)} ${currency}`;
}

export default async function AdminProfileProductsPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true, slug: true } });
  if (!profile) notFound();
  const products = await prisma.product.findMany({ where: { profileId: profile.id }, orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }] });

  return (
    <div>
      <AdminHeader eyebrow="Boutique" title={profile.displayName} description={`Produits affiches sur /${profile.slug}.`} action={{ href: `/admin/profiles/${profile.id}/products/new`, label: "Ajouter un produit" }} />
      <ProfileContentNav profileId={profile.id} active="Boutique" />
      <section className="mt-6 overflow-hidden rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 shadow-sm">
        {products.length === 0 ? (
          <div className="p-6"><p className="text-sm text-aodi-violet-700/70">Aucun produit pour ce profil.</p><Link href={`/admin/profiles/${profile.id}/products/new`} className="mt-4 inline-flex rounded-lg bg-aodi-violet-900 px-4 py-2 text-sm font-semibold text-white">Ajouter le premier produit</Link></div>
        ) : products.map((product) => (
          <article key={product.id} className="grid gap-4 border-b border-aodi-violet-100 p-5 lg:grid-cols-[80px_1fr_120px_180px] lg:items-center">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-aodi-violet-950/10 text-[10px] font-bold uppercase tracking-[0.12em] text-aodi-violet-700/45">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <span>Image</span>}</div>
            <div><p className="font-semibold text-aodi-violet-900">{product.name}</p><p className="mt-1 text-sm text-aodi-violet-700/70">{money(product.price, product.currency)} {product.oldPrice ? <span className="line-through">{money(product.oldPrice, product.currency)}</span> : null}</p><p className="mt-1 text-xs text-aodi-violet-700/60">Ordre {product.displayOrder}</p></div>
            <div className="flex flex-wrap gap-2 text-xs"><span>{product.isVisible ? "Visible" : "Masque"}</span><span>{product.isFeatured ? "En avant" : "Standard"}</span><span>{product.isAvailable ? "Disponible" : "Indisponible"}</span></div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/profiles/${profile.id}/products/${product.id}/edit`} className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">Modifier</Link>
              <form action={toggleProductVisibleAction.bind(null, profile.id, product.id)}><button className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">{product.isVisible ? "Masquer" : "Afficher"}</button></form>
              <form action={toggleProductAvailableAction.bind(null, profile.id, product.id)}><button className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">{product.isAvailable ? "Indispo." : "Dispo."}</button></form>
              <form action={toggleProductFeaturedAction.bind(null, profile.id, product.id)}><button className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold">{product.isFeatured ? "Retirer" : "En avant"}</button></form>
              <form action={deleteProductAction.bind(null, profile.id, product.id)}><button className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700">Supprimer</button></form>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
