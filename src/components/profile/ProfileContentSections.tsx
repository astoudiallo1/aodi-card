/* eslint-disable @next/next/no-img-element */
import type { ProfileSectionType, PublicCustomLink, PublicGalleryItem, PublicMusicTrack, PublicProduct, PublicProfileEvent, PublicProfileSection, PublicProject, PublicService } from "@/types/profile";
import { FaApple, FaCalendarAlt, FaExternalLinkAlt, FaGithub, FaImages, FaLink, FaMusic, FaPlay, FaShoppingBag, FaStar, FaStore } from "react-icons/fa";
import { FaSpotify, FaYoutube } from "react-icons/fa6";

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

function SectionTitle({ icon, title, eyebrow }: { icon: React.ReactNode; title: string; eyebrow?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 sm:px-7">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-aodi-violet-950 text-aodi-gold">{icon}</span>
      <div className="min-w-0">
        {eyebrow ? <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-aodi-gold-dark">{eyebrow}</p> : null}
        <h2 className="break-words text-xl font-extrabold uppercase leading-tight text-aodi-violet-900">{title}</h2>
        <span className="mt-2 block h-0.5 w-12 bg-aodi-gold" />
      </div>
    </div>
  );
}

function ProductImage({ product }: { product: PublicProduct }) {
  if (product.imageUrl) {
    return <img src={product.imageUrl} alt={product.name} className="h-48 w-full object-cover" />;
  }

  return (
    <div className="flex h-40 items-center justify-center bg-aodi-violet-950/10 text-aodi-violet-900/40">
      <FaStore className="h-9 w-9" />
    </div>
  );
}

function ProductSection({ products, title, slug }: { products: PublicProduct[]; title?: string | null; slug: string }) {
  if (products.length === 0) return null;
  return (
    <section id="boutique" className="space-y-4 scroll-mt-6">
      <SectionTitle title={title || "Boutique"} icon={<FaShoppingBag className="h-5 w-5" />} />
      <div className="flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:px-7">
        {products.map((product) => {
          const href = product.isAvailable ? orderHref(product) : null;
          return (
            <article key={product.id} className="w-[78vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-[1.35rem] border border-aodi-violet-100 bg-white shadow-[0_12px_26px_rgba(42,15,61,0.10)]">
              <ProductImage product={product} />
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="min-w-0 flex-1 break-words text-lg font-extrabold text-aodi-violet-950">{product.name}</h3>
                  {product.isFeatured ? <span className="rounded-full bg-aodi-gold/20 px-3 py-1 text-xs font-bold text-aodi-violet-950">Selection</span> : null}
                </div>
                {product.description ? <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-aodi-violet-950/75">{product.description}</p> : null}
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  {product.oldPrice ? <span className="text-sm font-semibold text-aodi-violet-700/50 line-through">{money(product.oldPrice, product.currency)}</span> : null}
                  <span className="text-xl font-extrabold text-aodi-gold-dark">{money(product.price, product.currency)}</span>
                </div>
                {product.isAvailable ? (href ? <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-bold text-white">Commander</a> : null) : <p className="mt-4 rounded-lg bg-aodi-violet-100 px-4 py-3 text-center text-sm font-bold text-aodi-violet-700">Indisponible</p>}
              </div>
            </article>
          );
        })}
      </div>
      <div className="px-4 sm:px-7"><a href={`/${slug}/boutique`} className="inline-flex text-sm font-extrabold text-aodi-violet-900">Voir toute la boutique -&gt;</a></div>
    </section>
  );
}

function ServiceSection({ services, title }: { services: PublicService[]; title?: string | null }) {
  if (services.length === 0) return null;
  return <section id="services" className="space-y-4 scroll-mt-6"><SectionTitle title={title || "Services"} icon={<FaExternalLinkAlt className="h-5 w-5" />} /><div className="grid gap-4 px-4 sm:px-7">{services.map((service) => <article key={service.id} className="rounded-[1.35rem] border border-aodi-violet-100 bg-white p-5 shadow-[0_12px_26px_rgba(42,15,61,0.10)]">{service.imageUrl ? <img src={service.imageUrl} alt={service.name} className="mb-4 h-40 w-full rounded-lg object-cover" /> : null}<h3 className="break-words text-lg font-extrabold text-aodi-violet-950">{service.name}</h3>{service.description ? <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-aodi-violet-950/75">{service.description}</p> : null}{service.price !== null ? <p className="mt-4 text-lg font-extrabold text-aodi-gold-dark">{money(service.price, service.currency ?? "FCFA")}</p> : null}{service.ctaUrl ? <a href={service.ctaUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-bold text-white">{service.ctaLabel || "En savoir plus"}</a> : null}</article>)}</div><div className="px-4 sm:px-7"><a href="#services" className="inline-flex text-sm font-extrabold text-aodi-violet-900">Voir tous les services -&gt;</a></div></section>;
}

function ProjectSection({ projects, title }: { projects: PublicProject[]; title?: string | null }) {
  if (projects.length === 0) return null;
  return <section id="projets" className="space-y-4 scroll-mt-6"><SectionTitle title={title || "Projets / Realisations"} icon={<FaExternalLinkAlt className="h-5 w-5" />} /><div className="grid gap-4 px-4 sm:px-7 md:grid-cols-2">{projects.map((project) => <article key={project.id} className="overflow-hidden rounded-[1.35rem] border border-aodi-violet-100 bg-white shadow-[0_12px_26px_rgba(42,15,61,0.10)]">{project.imageUrl ? <img src={project.imageUrl} alt={project.title} className="h-44 w-full object-cover" /> : null}<div className="p-5"><div className="flex flex-wrap gap-2"><h3 className="min-w-0 flex-1 break-words text-lg font-extrabold text-aodi-violet-950">{project.title}</h3>{project.isFeatured ? <span className="rounded-full bg-aodi-gold/20 px-3 py-1 text-xs font-bold text-aodi-violet-950">En avant</span> : null}</div>{project.technologies ? <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-aodi-gold-dark">{project.technologies}</p> : null}{project.description ? <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-aodi-violet-950/75">{project.description}</p> : null}<div className="mt-4 flex flex-wrap gap-2">{project.websiteUrl ? <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-aodi-violet-900 px-4 py-2 text-xs font-bold text-white">Voir le site</a> : null}{project.appUrl ? <a href={project.appUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-aodi-gold px-4 py-2 text-xs font-bold text-aodi-violet-950">Voir l&apos;application</a> : null}{project.githubUrl ? <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-aodi-violet-200 bg-white px-4 py-2 text-xs font-bold text-aodi-violet-950"><FaGithub /> GitHub</a> : null}</div></div></article>)}</div></section>;
}

function GallerySection({ items, title }: { items: PublicGalleryItem[]; title?: string | null }) {
  if (items.length === 0) return null;
  return <section id="galerie" className="space-y-4 scroll-mt-6"><SectionTitle title={title || "Galerie"} icon={<FaImages className="h-5 w-5" />} /><div className="flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:px-7">{items.map((item) => <article key={item.id} className="w-[42vw] min-w-36 max-w-52 shrink-0 snap-start overflow-hidden rounded-lg bg-white shadow-[0_12px_24px_rgba(42,15,61,0.10)]"><img src={item.imageUrl} alt={item.title || "Galerie"} className="aspect-square w-full object-cover" />{item.title || item.description ? <div className="p-3"><h3 className="break-words text-sm font-bold text-aodi-violet-950">{item.title}</h3>{item.description ? <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-aodi-violet-950/70">{item.description}</p> : null}</div> : null}</article>)}</div><div className="px-4 sm:px-7"><a href="#galerie" className="inline-flex text-sm font-extrabold text-aodi-violet-900">Voir toute la galerie -&gt;</a></div></section>;
}

function LinkSection({ links, title }: { links: PublicCustomLink[]; title?: string | null }) {
  if (links.length === 0) return null;
  return <section id="liens" className="space-y-4 scroll-mt-6"><SectionTitle title={title || "Liens"} icon={<FaLink className="h-5 w-5" />} /><div className="grid gap-3 px-4 sm:px-7">{links.map((link) => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 rounded-lg border border-aodi-violet-100 bg-white px-4 py-4 text-sm font-bold text-aodi-violet-950 shadow-[0_10px_22px_rgba(42,15,61,0.08)]"><span className="break-words">{link.icon ? `${link.icon} ` : ""}{link.label}</span><FaExternalLinkAlt className="h-4 w-4 shrink-0 text-aodi-gold-dark" /></a>)}</div></section>;
}

function MusicSection({ tracks, title }: { tracks: PublicMusicTrack[]; title?: string | null }) {
  if (tracks.length === 0) return null;
  const featured = tracks[0];
  const listenHref = featured.spotifyUrl || featured.appleUrl || featured.youtubeUrl || featured.audioUrl;
  return <section id="musique" className="space-y-4 scroll-mt-6"><SectionTitle title={title || featured.title} eyebrow="Derniere sortie" icon={<FaMusic className="h-5 w-5" />} /><article className="mx-4 overflow-hidden rounded-[1.35rem] border border-aodi-violet-100 bg-white shadow-[0_12px_26px_rgba(42,15,61,0.10)] sm:mx-7 min-[520px]:grid min-[520px]:grid-cols-[160px_1fr]">{featured.coverUrl ? <img src={featured.coverUrl} alt={featured.title} className="aspect-square w-full object-cover" /> : <div className="flex aspect-square items-center justify-center bg-aodi-violet-950 text-aodi-gold"><FaMusic className="h-12 w-12" /></div>}<div className="p-5"><h3 className="text-2xl font-extrabold text-aodi-violet-950">{featured.title}</h3>{featured.artist ? <p className="mt-1 font-semibold text-aodi-gold-dark">{featured.artist}</p> : null}<div className="mt-5 flex flex-wrap gap-2">{listenHref ? <a href={listenHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-bold text-white"><FaPlay className="h-3 w-3" />Ecouter maintenant</a> : null}{featured.spotifyUrl ? <a aria-label="Spotify" href={featured.spotifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1DB954] text-white"><FaSpotify /></a> : null}{featured.appleUrl ? <a aria-label="Apple Music" href={featured.appleUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-white"><FaApple /></a> : null}{featured.youtubeUrl ? <a aria-label="YouTube" href={featured.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FF0000] text-white"><FaYoutube /></a> : null}</div></div></article></section>;
}

function EventSection({ events, title }: { events: PublicProfileEvent[]; title?: string | null }) {
  if (events.length === 0) return null;
  return <section id="evenements" className="space-y-4 scroll-mt-6"><SectionTitle title={title || "Evenements"} icon={<FaCalendarAlt className="h-5 w-5" />} /><div className="grid gap-3 px-4 sm:px-7">{events.map((event) => <article key={event.id} className="grid grid-cols-[72px_1fr] gap-4 rounded-[1.2rem] border border-aodi-violet-100 bg-white p-4 shadow-[0_10px_22px_rgba(42,15,61,0.08)]"><div className="rounded-lg bg-aodi-violet-950 px-3 py-3 text-center text-white"><p className="text-xs font-bold uppercase text-aodi-gold">{new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(event.startDate)}</p><p className="text-2xl font-extrabold">{new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(event.startDate)}</p></div><div><h3 className="font-extrabold text-aodi-violet-950">{event.title}</h3>{event.location ? <p className="mt-1 text-sm font-semibold text-aodi-gold-dark">{event.location}</p> : null}{event.description ? <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-aodi-violet-950/75">{event.description}</p> : null}{event.externalUrl ? <a href={event.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-extrabold text-aodi-violet-900">Voir les details -&gt;</a> : null}</div></article>)}</div></section>;
}

function StatsSection({ stats, title }: { stats: { id: string; label: string; value: string; icon: string | null }[]; title?: string | null }) {
  if (stats.length === 0) return null;
  return <section id="stats" className="space-y-4 scroll-mt-6"><SectionTitle title={title || "Chiffres cles"} icon={<FaStar className="h-5 w-5" />} /><div className="grid grid-cols-2 gap-3 px-4 sm:px-7">{stats.map((stat) => <article key={stat.id} className="rounded-[1.1rem] border border-aodi-violet-100 bg-white p-4 text-center shadow-[0_10px_22px_rgba(42,15,61,0.08)]"><p className="text-2xl font-extrabold text-aodi-violet-950">{stat.value}</p><p className="mt-1 text-xs font-bold uppercase leading-snug text-aodi-violet-700/70">{stat.label}</p></article>)}</div></section>;
}

function AboutSection({ bio, title }: { bio: string | null; title?: string | null }) {
  if (!bio) return null;
  return <section id="apropos" className="px-4 sm:px-7"><div className="relative min-h-36 overflow-hidden rounded-[1.35rem] border border-aodi-violet-100 bg-white p-5 text-left shadow-[0_12px_26px_rgba(42,15,61,0.10)] min-[430px]:p-6"><div className="absolute bottom-0 right-0 h-32 w-36 opacity-30 public-bogolan-cream" /><h2 className="relative text-xl font-extrabold uppercase text-aodi-violet-900">{title || "A propos de moi"}</h2><span className="relative mt-3 block h-0.5 w-12 bg-aodi-gold" /><p className="relative mt-5 whitespace-pre-line text-base leading-relaxed text-aodi-violet-950/85">{bio}</p></div></section>;
}

export function ProfileContentSections({ slug, bio, products, services, projects, galleryItems, customLinks, musicTracks, events, stats, sections }: { slug: string; bio: string | null; products: PublicProduct[]; services: PublicService[]; projects: PublicProject[]; galleryItems: PublicGalleryItem[]; customLinks: PublicCustomLink[]; musicTracks: PublicMusicTrack[]; events: PublicProfileEvent[]; stats: { id: string; label: string; value: string; icon: string | null }[]; sections: PublicProfileSection[] }) {
  const renderers: Record<ProfileSectionType, (section: PublicProfileSection) => React.ReactNode> = {
    SOCIALS: () => null,
    CONTACT: () => null,
    CTA: () => null,
    PRODUCTS: (section) => <ProductSection products={products} title={section.title} slug={slug} />,
    SERVICES: (section) => <ServiceSection services={services} title={section.title} />,
    PROJECTS: (section) => <ProjectSection projects={projects} title={section.title} />,
    GALLERY: (section) => <GallerySection items={galleryItems} title={section.title} />,
    CUSTOM_LINKS: (section) => <LinkSection links={customLinks} title={section.title} />,
    MUSIC: (section) => <MusicSection tracks={musicTracks} title={section.title} />,
    EVENTS: (section) => <EventSection events={events} title={section.title} />,
    STATS: (section) => <StatsSection stats={stats} title={section.title} />,
    ABOUT: (section) => <AboutSection bio={bio} title={section.title} />,
  };

  return <>{sections.map((section) => <div key={section.id}>{renderers[section.type](section)}</div>)}</>;
}
