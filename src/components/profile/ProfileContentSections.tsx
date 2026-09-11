/* eslint-disable @next/next/no-img-element */
import type { ProfileSectionType, ProfileType, PublicCustomLink, PublicGalleryItem, PublicMusicTrack, PublicProduct, PublicProfileEvent, PublicProfileSection, PublicProject, PublicService } from "@/types/profile";
import { FaApple, FaExternalLinkAlt, FaGithub, FaImages, FaMusic, FaPlay, FaStore, FaTools } from "react-icons/fa";
import { FaSpotify, FaYoutube } from "react-icons/fa6";

function money(value: number | null, currency = "FCFA") {
  if (value === null) return null;
  return `${new Intl.NumberFormat("fr-FR").format(value)} ${currency}`;
}

function orderHref(product: PublicProduct) {
  if (product.orderUrl) return product.orderUrl;
  if (!product.whatsappNumber) return null;
  const text = `Bonjour, je souhaite commander :\n${product.name}\nPrix : ${money(product.price, product.currency)}`;
  return `https://wa.me/${product.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

function sectionLabel(type: ProfileSectionType, profileType: ProfileType, title?: string | null) {
  if (title) return title;
  if (type === "PRODUCTS") return profileType === "COMMERCE" ? "Nos collections" : "Boutique";
  if (type === "PROJECTS") return profileType === "CRAFT" || profileType === "TECH" || profileType === "ACTOR_CREATOR" ? "Mes realisations" : "Projets recents";
  if (type === "MUSIC") return "Dernieres sorties";
  if (type === "EVENTS") return profileType === "MUSIC" ? "Prochains evenements" : "Actualites";
  if (type === "SERVICES") return "Mes services";
  if (type === "GALLERY") return "Galerie";
  if (type === "CUSTOM_LINKS") return "Liens utiles";
  if (type === "STATS") return "Chiffres cles";
  return "A propos";
}

function SectionTitle({ title, actionHref, actionLabel }: { title: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-4 px-4 sm:px-7">
      <div className="min-w-0">
        <h2 className="break-words font-display text-3xl font-bold leading-none text-aodi-violet-950 sm:text-4xl">{title}</h2>
        <span className="mt-3 block h-0.5 w-16 bg-aodi-gold" />
      </div>
      {actionHref ? <a href={actionHref} className="hidden shrink-0 items-center gap-2 text-sm font-bold text-aodi-violet-950 sm:inline-flex">{actionLabel ?? "Voir tout"} <FaExternalLinkAlt className="h-3 w-3" /></a> : null}
    </div>
  );
}

function ProductImage({ product }: { product: PublicProduct }) {
  if (product.imageUrl) return <img src={product.imageUrl} alt={product.name} className="h-48 w-full object-cover" />;
  return <div className="flex h-44 items-center justify-center bg-[#F5EAD8] text-aodi-violet-900/45"><FaStore className="h-9 w-9" /></div>;
}

function ProductSection({ products, title, slug, profileType }: { products: PublicProduct[]; title?: string | null; slug: string; profileType: ProfileType }) {
  if (products.length === 0) return null;
  return (
    <section id="boutique" className="space-y-4 scroll-mt-24">
      <SectionTitle title={sectionLabel("PRODUCTS", profileType, title)} actionHref={`/${slug}/boutique`} actionLabel="Voir toute la boutique" />
      <div className="grid gap-4 px-4 sm:px-7 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => {
          const href = product.isAvailable ? orderHref(product) : null;
          return (
            <article key={product.id} className="overflow-hidden rounded-lg border border-black/5 bg-white shadow-[0_14px_30px_rgba(24,18,10,0.09)]">
              <ProductImage product={product} />
              <div className="p-4">
                <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-extrabold leading-snug text-aodi-violet-950">{product.name}</h3>
                {product.description ? <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-aodi-violet-950/70">{product.description}</p> : null}
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  {product.oldPrice ? <span className="text-xs font-semibold text-aodi-violet-700/45 line-through">{money(product.oldPrice, product.currency)}</span> : null}
                  <span className="text-lg font-black text-aodi-gold-dark">{money(product.price, product.currency)}</span>
                </div>
                {href ? <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-aodi-violet-950 px-4 py-3 text-xs font-extrabold text-white">Commander</a> : <p className="mt-4 rounded-lg bg-aodi-violet-100 px-4 py-3 text-center text-xs font-bold text-aodi-violet-700">Indisponible</p>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ServiceSection({ services, title, profileType }: { services: PublicService[]; title?: string | null; profileType: ProfileType }) {
  if (services.length === 0) return null;
  return (
    <section id="services" className="space-y-4 scroll-mt-24">
      <SectionTitle title={sectionLabel("SERVICES", profileType, title)} actionHref="#services" actionLabel="Voir tous les services" />
      <div className="grid gap-4 px-4 sm:px-7 md:grid-cols-4">
        {services.slice(0, 4).map((service) => (
          <article key={service.id} className="rounded-lg border border-black/5 bg-white p-4 shadow-[0_14px_30px_rgba(24,18,10,0.08)]">
            {service.imageUrl ? <img src={service.imageUrl} alt={service.name} className="mb-4 h-28 w-full rounded-lg object-cover" /> : <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[#FBF3E5] text-aodi-violet-950"><FaTools className="h-7 w-7" /></span>}
            <h3 className="text-sm font-extrabold leading-snug text-aodi-violet-950">{service.name}</h3>
            {service.description ? <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-aodi-violet-950/70">{service.description}</p> : null}
            {service.price !== null ? <p className="mt-3 text-sm font-extrabold text-aodi-gold-dark">{money(service.price, service.currency ?? "FCFA")}</p> : null}
            {service.ctaUrl ? <a href={service.ctaUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-xs font-extrabold text-aodi-violet-950">{service.ctaLabel || "En savoir plus"}</a> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectSection({ projects, title, profileType }: { projects: PublicProject[]; title?: string | null; profileType: ProfileType }) {
  if (projects.length === 0) return null;
  return (
    <section id="projets" className="space-y-4 scroll-mt-24">
      <SectionTitle title={sectionLabel("PROJECTS", profileType, title)} actionHref="#projets" actionLabel="Voir tous les projets" />
      <div className="grid gap-4 px-4 sm:px-7 md:grid-cols-4">
        {projects.slice(0, 4).map((project) => (
          <article key={project.id} className="overflow-hidden rounded-lg border border-black/5 bg-white shadow-[0_14px_30px_rgba(24,18,10,0.09)]">
            {project.imageUrl ? <img src={project.imageUrl} alt={project.title} className="h-36 w-full object-cover" /> : <div className="h-28 bg-[#F5EAD8]" />}
            <div className="p-4">
              <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-aodi-violet-950">{project.title}</h3>
              {project.technologies ? <span className="mt-3 inline-flex rounded-full bg-[#F9E6BF] px-3 py-1 text-[0.68rem] font-bold text-aodi-violet-950">{project.technologies}</span> : null}
              {project.description ? <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-aodi-violet-950/70">{project.description}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                {project.websiteUrl ? <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-aodi-violet-950">Voir</a> : null}
                {project.appUrl ? <a href={project.appUrl} target="_blank" rel="noopener noreferrer" className="text-aodi-gold-dark">App</a> : null}
                {project.githubUrl ? <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-aodi-violet-700"><FaGithub /> GitHub</a> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GallerySection({ items, title, profileType }: { items: PublicGalleryItem[]; title?: string | null; profileType: ProfileType }) {
  if (items.length === 0) return null;
  return (
    <section id="galerie" className="space-y-4 scroll-mt-24">
      <SectionTitle title={sectionLabel("GALLERY", profileType, title)} actionHref="#galerie" actionLabel="Voir toute la galerie" />
      <div className="grid grid-cols-2 gap-3 px-4 sm:px-7 md:grid-cols-5">
        {items.slice(0, 5).map((item) => <img key={item.id} src={item.imageUrl} alt={item.title || item.description || "Galerie"} className="aspect-[4/3] w-full rounded-lg object-cover shadow-[0_10px_22px_rgba(24,18,10,0.08)]" />)}
        {items.length > 5 ? <a href="#galerie" className="flex aspect-[4/3] items-center justify-center rounded-lg bg-white text-center text-sm font-bold text-aodi-violet-950 shadow-[0_10px_22px_rgba(24,18,10,0.08)]"><span><FaImages className="mx-auto mb-2 h-7 w-7" />Voir plus<br />de photos</span></a> : null}
      </div>
    </section>
  );
}

function LinkSection({ links, title, profileType }: { links: PublicCustomLink[]; title?: string | null; profileType: ProfileType }) {
  if (links.length === 0) return null;
  return <section id="liens" className="space-y-4 scroll-mt-24"><SectionTitle title={sectionLabel("CUSTOM_LINKS", profileType, title)} /><div className="grid gap-3 px-4 sm:px-7 md:grid-cols-2">{links.map((link) => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 rounded-lg border border-black/5 bg-white px-4 py-4 text-sm font-bold text-aodi-violet-950 shadow-[0_10px_22px_rgba(24,18,10,0.08)]"><span>{link.icon ? `${link.icon} ` : ""}{link.label}</span><FaExternalLinkAlt className="h-4 w-4 shrink-0 text-aodi-gold-dark" /></a>)}</div></section>;
}

function MusicSection({ tracks, title, profileType }: { tracks: PublicMusicTrack[]; title?: string | null; profileType: ProfileType }) {
  if (tracks.length === 0) return null;
  const [featured, ...others] = tracks;
  const listenHref = featured.spotifyUrl || featured.appleUrl || featured.youtubeUrl || featured.audioUrl;
  return <section id="musique" className="space-y-4 scroll-mt-24"><SectionTitle title={sectionLabel("MUSIC", profileType, title)} /><article className="mx-4 overflow-hidden rounded-lg bg-aodi-violet-950 text-white shadow-[0_18px_40px_rgba(24,18,10,0.18)] sm:mx-7 md:grid md:grid-cols-[220px_1fr]">{featured.coverUrl ? <img src={featured.coverUrl} alt={featured.title} className="aspect-square w-full object-cover" /> : <div className="flex aspect-square items-center justify-center bg-black text-aodi-gold"><FaMusic className="h-14 w-14" /></div>}<div className="p-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-aodi-gold">En avant</p><h3 className="mt-2 text-3xl font-extrabold text-white">{featured.title}</h3>{featured.artist ? <p className="mt-1 font-semibold text-aodi-cream/80">{featured.artist}</p> : null}<div className="mt-5 flex flex-wrap gap-2">{listenHref ? <a href={listenHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-aodi-gold px-5 py-3 text-sm font-bold text-aodi-violet-950"><FaPlay className="h-3 w-3" />Ecouter</a> : null}{featured.spotifyUrl ? <a aria-label="Spotify" href={featured.spotifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1DB954] text-white"><FaSpotify /></a> : null}{featured.appleUrl ? <a aria-label="Apple Music" href={featured.appleUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-white"><FaApple /></a> : null}{featured.youtubeUrl ? <a aria-label="YouTube" href={featured.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FF0000] text-white"><FaYoutube /></a> : null}</div></div></article>{others.length > 0 ? <div className="grid gap-3 px-4 sm:px-7 md:grid-cols-3">{others.map((track) => <article key={track.id} className="rounded-lg bg-white p-4 shadow-[0_10px_22px_rgba(24,18,10,0.08)]"><h3 className="font-extrabold text-aodi-violet-950">{track.title}</h3>{track.artist ? <p className="text-sm text-aodi-violet-700/75">{track.artist}</p> : null}</article>)}</div> : null}</section>;
}

function EventSection({ events, title, profileType }: { events: PublicProfileEvent[]; title?: string | null; profileType: ProfileType }) {
  if (events.length === 0) return null;
  return <section id="evenements" className="space-y-4 scroll-mt-24"><SectionTitle title={sectionLabel("EVENTS", profileType, title)} /><div className="grid gap-3 px-4 sm:px-7 md:grid-cols-2">{events.map((event) => <article key={event.id} className="grid grid-cols-[72px_1fr] gap-4 rounded-lg bg-white p-4 shadow-[0_10px_22px_rgba(24,18,10,0.08)]"><div className="rounded-lg bg-aodi-violet-950 px-3 py-3 text-center text-white"><p className="text-xs font-bold uppercase text-aodi-gold">{new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(event.startDate)}</p><p className="text-2xl font-extrabold">{new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(event.startDate)}</p></div><div><h3 className="font-extrabold text-aodi-violet-950">{event.title}</h3>{event.location ? <p className="mt-1 text-sm font-semibold text-aodi-gold-dark">{event.location}</p> : null}{event.description ? <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-aodi-violet-950/75">{event.description}</p> : null}{event.externalUrl ? <a href={event.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-extrabold text-aodi-violet-900">Reserver</a> : null}</div></article>)}</div></section>;
}

function StatsSection({ stats, title, profileType }: { stats: { id: string; label: string; value: string; icon: string | null }[]; title?: string | null; profileType: ProfileType }) {
  if (stats.length === 0) return null;
  return <section id="stats" className="space-y-4 scroll-mt-24"><SectionTitle title={sectionLabel("STATS", profileType, title)} /><div className="grid grid-cols-2 gap-3 px-4 sm:px-7 md:grid-cols-4">{stats.map((stat) => <article key={stat.id} className="rounded-lg bg-white p-4 text-center shadow-[0_10px_22px_rgba(24,18,10,0.08)]"><p className="text-2xl font-black text-aodi-violet-950">{stat.value}</p><p className="mt-1 text-xs font-bold leading-snug text-aodi-violet-700/75">{stat.label}</p></article>)}</div></section>;
}

function AboutSection({ bio, title }: { bio: string | null; title?: string | null }) {
  if (!bio) return null;
  return <section id="apropos" className="px-4 sm:px-7"><div className="rounded-lg bg-white p-5 shadow-[0_12px_26px_rgba(24,18,10,0.08)]"><h2 className="font-display text-3xl font-bold text-aodi-violet-950">{title || "A propos"}</h2><span className="mt-3 block h-0.5 w-16 bg-aodi-gold" /><p className="mt-5 whitespace-pre-line text-base leading-relaxed text-aodi-violet-950/80">{bio}</p></div></section>;
}

export function ProfileContentSections({ slug, bio, products, services, projects, galleryItems, customLinks, musicTracks, events, stats, sections, profileType }: { slug: string; bio: string | null; products: PublicProduct[]; services: PublicService[]; projects: PublicProject[]; galleryItems: PublicGalleryItem[]; customLinks: PublicCustomLink[]; musicTracks: PublicMusicTrack[]; events: PublicProfileEvent[]; stats: { id: string; label: string; value: string; icon: string | null }[]; sections: PublicProfileSection[]; profileType: ProfileType }) {
  const renderers: Record<ProfileSectionType, (section: PublicProfileSection) => React.ReactNode> = {
    SOCIALS: () => null,
    CONTACT: () => null,
    CTA: () => null,
    PRODUCTS: (section) => <ProductSection products={products} title={section.title} slug={slug} profileType={profileType} />,
    SERVICES: (section) => <ServiceSection services={services} title={section.title} profileType={profileType} />,
    PROJECTS: (section) => <ProjectSection projects={projects} title={section.title} profileType={profileType} />,
    GALLERY: (section) => <GallerySection items={galleryItems} title={section.title} profileType={profileType} />,
    CUSTOM_LINKS: (section) => <LinkSection links={customLinks} title={section.title} profileType={profileType} />,
    MUSIC: (section) => <MusicSection tracks={musicTracks} title={section.title} profileType={profileType} />,
    EVENTS: (section) => <EventSection events={events} title={section.title} profileType={profileType} />,
    STATS: (section) => <StatsSection stats={stats} title={section.title} profileType={profileType} />,
    ABOUT: (section) => <AboutSection bio={bio} title={section.title} />,
  };

  return <>{sections.map((section) => <div key={section.id}>{renderers[section.type](section)}</div>)}</>;
}