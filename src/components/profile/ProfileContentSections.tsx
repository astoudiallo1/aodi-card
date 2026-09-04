/* eslint-disable @next/next/no-img-element */
import type { PublicCustomLink, PublicGalleryItem, PublicProduct, PublicProject, PublicService } from "@/types/profile";
import { FaExternalLinkAlt, FaGithub, FaImages, FaLink, FaStore } from "react-icons/fa";

function money(value: number | null, currency = "FCFA") {
  if (value === null) return null;
  return `${new Intl.NumberFormat("fr-FR").format(value)} ${currency}`;
}

function orderHref(product: PublicProduct) {
  if (product.orderUrl) return product.orderUrl;
  if (!product.whatsappNumber) return null;
  const text = `Bonjour, je souhaite commander :\n${product.name}\nPrix : ${money(product.price, product.currency)}`;
  return `https://wa.me/${product.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 px-4 sm:px-7">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-aodi-violet-950 text-aodi-gold">{icon}</span>
      <div className="min-w-0">
        <h2 className="break-words text-xl font-extrabold uppercase leading-tight text-aodi-violet-900">{title}</h2>
        <span className="mt-2 block h-0.5 w-12 bg-aodi-gold" />
      </div>
    </div>
  );
}

function ProductSection({ products }: { products: PublicProduct[] }) {
  if (products.length === 0) return null;
  return (
    <section id="boutique" className="space-y-4">
      <SectionTitle title="Boutique" icon={<FaStore className="h-5 w-5" />} />
      <div className="grid gap-4 px-4 sm:px-7">
        {products.map((product) => {
          const href = product.isAvailable ? orderHref(product) : null;
          return (
            <article key={product.id} className="overflow-hidden rounded-[1.35rem] border border-aodi-violet-100 bg-white shadow-[0_12px_26px_rgba(42,15,61,0.10)]">
              {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-48 w-full object-cover" /> : <div className="flex h-32 items-center justify-center bg-aodi-violet-950/10 text-aodi-violet-900/40"><FaStore className="h-9 w-9" /></div>}
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="min-w-0 flex-1 break-words text-lg font-extrabold text-aodi-violet-950">{product.name}</h3>
                  {product.isFeatured ? <span className="rounded-full bg-aodi-gold/20 px-3 py-1 text-xs font-bold text-aodi-violet-950">Selection</span> : null}
                </div>
                {product.description ? <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-aodi-violet-950/75">{product.description}</p> : null}
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  {product.oldPrice ? <span className="text-sm font-semibold text-aodi-violet-700/50 line-through">{money(product.oldPrice, product.currency)}</span> : null}
                  <span className="text-xl font-extrabold text-aodi-gold-dark">{money(product.price, product.currency)}</span>
                </div>
                {product.isAvailable ? (href ? <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-bold text-white">Commander sur WhatsApp</a> : null) : <p className="mt-4 rounded-lg bg-aodi-violet-100 px-4 py-3 text-center text-sm font-bold text-aodi-violet-700">Indisponible</p>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ServiceSection({ services }: { services: PublicService[] }) {
  if (services.length === 0) return null;
  return <section className="space-y-4"><SectionTitle title="Services" icon={<FaExternalLinkAlt className="h-5 w-5" />} /><div className="grid gap-4 px-4 sm:px-7">{services.map((service) => <article key={service.id} className="rounded-[1.35rem] border border-aodi-violet-100 bg-white p-5 shadow-[0_12px_26px_rgba(42,15,61,0.10)]">{service.imageUrl ? <img src={service.imageUrl} alt={service.name} className="mb-4 h-40 w-full rounded-lg object-cover" /> : null}<h3 className="break-words text-lg font-extrabold text-aodi-violet-950">{service.name}</h3>{service.description ? <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-aodi-violet-950/75">{service.description}</p> : null}{service.price !== null ? <p className="mt-4 text-lg font-extrabold text-aodi-gold-dark">{money(service.price, service.currency ?? "FCFA")}</p> : null}{service.ctaUrl ? <a href={service.ctaUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-bold text-white">{service.ctaLabel || "En savoir plus"}</a> : null}</article>)}</div></section>;
}

function ProjectSection({ projects }: { projects: PublicProject[] }) {
  if (projects.length === 0) return null;
  return <section className="space-y-4"><SectionTitle title="Projets / Realisations" icon={<FaExternalLinkAlt className="h-5 w-5" />} /><div className="grid gap-4 px-4 sm:px-7">{projects.map((project) => <article key={project.id} className="overflow-hidden rounded-[1.35rem] border border-aodi-violet-100 bg-white shadow-[0_12px_26px_rgba(42,15,61,0.10)]">{project.imageUrl ? <img src={project.imageUrl} alt={project.title} className="h-44 w-full object-cover" /> : null}<div className="p-5"><div className="flex flex-wrap gap-2"><h3 className="min-w-0 flex-1 break-words text-lg font-extrabold text-aodi-violet-950">{project.title}</h3>{project.isFeatured ? <span className="rounded-full bg-aodi-gold/20 px-3 py-1 text-xs font-bold text-aodi-violet-950">En avant</span> : null}</div>{project.technologies ? <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-aodi-gold-dark">{project.technologies}</p> : null}{project.description ? <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-aodi-violet-950/75">{project.description}</p> : null}<div className="mt-4 flex flex-wrap gap-2">{project.websiteUrl ? <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-aodi-violet-900 px-4 py-2 text-xs font-bold text-white">Voir le site</a> : null}{project.appUrl ? <a href={project.appUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-aodi-gold px-4 py-2 text-xs font-bold text-aodi-violet-950">Voir l&apos;application</a> : null}{project.githubUrl ? <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-aodi-violet-200 bg-white px-4 py-2 text-xs font-bold text-aodi-violet-950"><FaGithub /> GitHub</a> : null}</div></div></article>)}</div></section>;
}

function GallerySection({ items }: { items: PublicGalleryItem[] }) {
  if (items.length === 0) return null;
  return <section className="space-y-4"><SectionTitle title="Galerie" icon={<FaImages className="h-5 w-5" />} /><div className="grid grid-cols-2 gap-3 px-4 sm:px-7">{items.map((item) => <article key={item.id} className="overflow-hidden rounded-lg bg-white shadow-[0_12px_24px_rgba(42,15,61,0.10)]"><img src={item.imageUrl} alt={item.title || "Galerie"} className="aspect-square w-full object-cover" />{item.title || item.description ? <div className="p-3"><h3 className="break-words text-sm font-bold text-aodi-violet-950">{item.title}</h3>{item.description ? <p className="mt-1 text-xs leading-relaxed text-aodi-violet-950/70">{item.description}</p> : null}</div> : null}</article>)}</div></section>;
}

function LinkSection({ links }: { links: PublicCustomLink[] }) {
  if (links.length === 0) return null;
  return <section className="space-y-4"><SectionTitle title="Liens" icon={<FaLink className="h-5 w-5" />} /><div className="grid gap-3 px-4 sm:px-7">{links.map((link) => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 rounded-lg border border-aodi-violet-100 bg-white px-4 py-4 text-sm font-bold text-aodi-violet-950 shadow-[0_10px_22px_rgba(42,15,61,0.08)]"><span className="break-words">{link.icon ? `${link.icon} ` : ""}{link.label}</span><FaExternalLinkAlt className="h-4 w-4 shrink-0 text-aodi-gold-dark" /></a>)}</div></section>;
}

export function ProfileContentSections({ products, services, projects, galleryItems, customLinks }: { products: PublicProduct[]; services: PublicService[]; projects: PublicProject[]; galleryItems: PublicGalleryItem[]; customLinks: PublicCustomLink[] }) {
  return (
    <>
      <ProductSection products={products} />
      <ServiceSection services={services} />
      <ProjectSection projects={projects} />
      <GallerySection items={galleryItems} />
      <LinkSection links={customLinks} />
    </>
  );
}