/* eslint-disable @next/next/no-img-element */
import { InactiveProfile } from "@/components/profile/InactiveProfile";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FaArrowLeft, FaStore } from "react-icons/fa";

type PageProps = { params: Promise<{ slug: string }> };

type ProductCard = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  currency: string;
  imageUrl: string | null;
  whatsappNumber: string | null;
  orderUrl: string | null;
  isFeatured: boolean;
  isAvailable: boolean;
};

function money(value: number | null, currency = "FCFA") {
  if (value === null) return null;
  return `${new Intl.NumberFormat("fr-FR").format(value)} ${currency}`;
}

function orderHref(product: ProductCard) {
  if (product.orderUrl) return product.orderUrl;
  if (!product.whatsappNumber) return null;
  const text = `Bonjour, je souhaite commander :\n${product.name}\nPrix : ${money(product.price, product.currency)}`;
  return `https://wa.me/${product.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export default async function PublicShopPage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await prisma.profile.findUnique({
    where: { slug: slug.trim().toLowerCase() },
    select: { id: true, displayName: true, slug: true, isActive: true },
  });

  if (!profile) notFound();
  if (!profile.isActive) return <main className="min-h-dvh bg-[#FDFBF7]"><InactiveProfile /></main>;

  const products = await prisma.product.findMany({
    where: { profileId: profile.id, isVisible: true, isActive: true },
    orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main className="min-h-dvh bg-[#FDFBF7] px-4 py-6 text-aodi-violet-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <a href={`/${profile.slug}`} className="inline-flex items-center gap-2 rounded-lg border border-aodi-violet-100 bg-white px-4 py-2 text-sm font-bold text-aodi-violet-900 shadow-sm"><FaArrowLeft /> Profil</a>
        <header className="mt-8 border-b border-aodi-violet-100 pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-aodi-gold-dark">Boutique AODI Card</p>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-tight text-aodi-violet-950 sm:text-5xl">{profile.displayName}</h1>
        </header>

        {products.length > 0 ? (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const href = product.isAvailable ? orderHref(product) : null;
              return (
                <article key={product.id} className="overflow-hidden rounded-[1.25rem] border border-aodi-violet-100 bg-white shadow-[0_12px_26px_rgba(42,15,61,0.10)]">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-56 w-full object-cover" /> : <div className="flex h-48 items-center justify-center bg-aodi-violet-950/10 text-aodi-violet-900/40"><FaStore className="h-10 w-10" /></div>}
                  <div className="p-5">
                    <h2 className="text-xl font-extrabold text-aodi-violet-950">{product.name}</h2>
                    {product.description ? <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-aodi-violet-950/75">{product.description}</p> : null}
                    <div className="mt-4 flex items-end gap-3">
                      {product.oldPrice ? <span className="text-sm font-semibold text-aodi-violet-700/50 line-through">{money(product.oldPrice, product.currency)}</span> : null}
                      <span className="text-2xl font-extrabold text-aodi-gold-dark">{money(product.price, product.currency)}</span>
                    </div>
                    {href ? <a href={href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-bold text-white">Commander</a> : null}
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}
      </div>
    </main>
  );
}