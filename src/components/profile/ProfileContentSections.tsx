/* eslint-disable @next/next/no-img-element */
import type { ProfileSectionType, ProfileType, PublicCustomLink, PublicGalleryItem, PublicMusicTrack, PublicProduct, PublicYouTubeChannel, PublicYouTubeVideo, PublicProfileEvent, PublicProfileSection, PublicProject, PublicService } from "@/types/profile";
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

function formatVideoDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function YouTubeVideoCard({ video, compact = false }: { video: PublicYouTubeVideo; compact?: boolean }) {
  const date = formatVideoDate(video.publishedAt);
  return (
    <article className={compact ? "w-[29vw] min-w-[104px] max-w-[124px] shrink-0 snap-start overflow-hidden rounded-lg border border-black/5 bg-white shadow-[0_10px_22px_rgba(24,18,10,0.08)] md:w-auto md:max-w-none" : "w-[74vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-lg border border-black/5 bg-white shadow-[0_14px_30px_rgba(24,18,10,0.09)] sm:w-[46%] md:w-auto md:max-w-none"}>
      <a href={video.url} target="_blank" rel="noopener noreferrer" className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-aodi-gold">
        <div className="relative aspect-video overflow-hidden bg-aodi-violet-950">
          <img src={video.thumbnail} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <span aria-hidden className="absolute inset-0 flex items-center justify-center"><span className={compact ? "flex h-8 w-8 items-center justify-center rounded-full bg-aodi-gold text-aodi-violet-950 shadow-[0_8px_18px_rgba(0,0,0,0.28)] transition group-hover:scale-110 md:h-12 md:w-12" : "flex h-12 w-12 items-center justify-center rounded-full bg-aodi-gold text-aodi-violet-950 shadow-[0_10px_24px_rgba(0,0,0,0.32)] transition group-hover:scale-110"}><FaPlay className={compact ? "ml-0.5 h-3 w-3 md:h-4 md:w-4" : "ml-0.5 h-4 w-4"} /></span></span>
        </div>
        <div className={compact ? "p-2 md:p-4" : "p-4"}>
          <h3 className={compact ? "line-clamp-2 min-h-[2rem] text-[0.68rem] font-extrabold leading-tight text-aodi-violet-950 md:min-h-[2.5rem] md:text-sm md:leading-snug" : "line-clamp-2 min-h-[2.5rem] text-sm font-extrabold leading-snug text-aodi-violet-950"}>{video.title}</h3>
          <div className={compact ? "mt-2 flex items-center justify-between gap-2 md:mt-3 md:gap-3" : "mt-3 flex items-center justify-between gap-3"}>
            {date ? <time dateTime={video.publishedAt} className={compact ? "hidden text-xs font-semibold text-aodi-violet-700/65 min-[430px]:inline md:inline" : "text-xs font-semibold text-aodi-violet-700/65"}>{date}</time> : <span />}
            <span className={compact ? "inline-flex items-center gap-1 text-[0.65rem] font-extrabold text-aodi-gold-dark md:gap-1.5 md:text-xs" : "inline-flex items-center gap-1.5 text-xs font-extrabold text-aodi-gold-dark"}><FaYoutube className="h-3.5 w-3.5" /> {compact ? "Voir" : "Regarder"}</span>
          </div>
        </div>
      </a>
    </article>
  );
}

function YouTubeChannelLink({ channel, label = "Voir toute la chaine" }: { channel: PublicYouTubeChannel; label?: string }) {
  return (
    <div className="flex justify-center px-4 sm:px-7">
      <a href={channel.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-aodi-violet-950 px-6 py-3 text-sm font-extrabold text-aodi-violet-950 transition hover:bg-aodi-violet-950 hover:text-white">
        <FaYoutube className="h-4 w-4" /> {label}
      </a>
    </div>
  );
}

function trackLinks(track: PublicMusicTrack) {
  return [
    track.spotifyUrl ? { key: "spotify", href: track.spotifyUrl, label: "Spotify", className: "bg-[#1DB954] text-white", icon: <FaSpotify /> } : null,
    track.appleUrl ? { key: "apple", href: track.appleUrl, label: "Apple Music", className: "bg-black text-white", icon: <FaApple /> } : null,
    track.youtubeUrl ? { key: "youtube", href: track.youtubeUrl, label: "YouTube", className: "bg-[#FF0000] text-white", icon: <FaYoutube /> } : null,
    track.audioUrl && !track.spotifyUrl && !track.appleUrl && !track.youtubeUrl ? { key: "audio", href: track.audioUrl, label: "Ecouter", className: "bg-aodi-gold text-aodi-violet-950", icon: <FaPlay className="h-3 w-3" /> } : null,
  ].filter((link): link is NonNullable<typeof link> => Boolean(link));
}

function ManualTrackList({ tracks }: { tracks: PublicMusicTrack[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 sm:px-7 md:grid-cols-2">
      {tracks.map((track) => (
        <article key={track.id} className="flex min-w-0 items-center gap-3 rounded-lg bg-white p-3 shadow-[0_10px_22px_rgba(24,18,10,0.08)]">
          {track.coverUrl ? <img src={track.coverUrl} alt={track.title} loading="lazy" className="h-14 w-14 shrink-0 rounded-lg object-cover" /> : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-aodi-violet-950 text-aodi-gold"><FaMusic className="h-5 w-5" /></span>}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-extrabold text-aodi-violet-950">{track.title}</h3>
            {track.artist ? <p className="truncate text-xs text-aodi-violet-700/75">{track.artist}</p> : null}
          </div>
          <div className="flex shrink-0 gap-2">
            {trackLinks(track).map((link) => <a key={link.key} aria-label={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${link.className}`}>{link.icon}</a>)}
          </div>
        </article>
      ))}
    </div>
  );
}

function FeaturedTrack({ track }: { track: PublicMusicTrack }) {
  const listenHref = track.spotifyUrl || track.appleUrl || track.youtubeUrl || track.audioUrl;
  return (
    <article className="mx-4 overflow-hidden rounded-lg bg-aodi-violet-950 text-white shadow-[0_18px_40px_rgba(24,18,10,0.18)] sm:mx-7 md:grid md:grid-cols-[220px_1fr]">
      {track.coverUrl ? <img src={track.coverUrl} alt={track.title} className="aspect-square w-full object-cover" /> : <div className="flex aspect-square items-center justify-center bg-black text-aodi-gold"><FaMusic className="h-14 w-14" /></div>}
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-aodi-gold">En avant</p>
        <h3 className="mt-2 text-3xl font-extrabold text-white">{track.title}</h3>
        {track.artist ? <p className="mt-1 font-semibold text-aodi-cream/80">{track.artist}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {listenHref ? <a href={listenHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-aodi-gold px-5 py-3 text-sm font-bold text-aodi-violet-950"><FaPlay className="h-3 w-3" />Ecouter</a> : null}
          {trackLinks(track).filter((link) => link.key !== "audio").map((link) => <a key={link.key} aria-label={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${link.className}`}>{link.icon}</a>)}
        </div>
      </div>
    </article>
  );
}

/**
 * Dernieres sorties : les videos YouTube synchronisees sont prioritaires ; sans elles, les MusicTrack manuels
 * prennent le relais ; sans aucun contenu, la section n'est pas rendue (elle est deja filtree cote serveur).
 */
function MusicSection({ tracks, youtubeVideos, youtubeChannel, title, profileType }: { tracks: PublicMusicTrack[]; youtubeVideos: PublicYouTubeVideo[]; youtubeChannel: PublicYouTubeChannel | null; title?: string | null; profileType: ProfileType }) {
  if (youtubeVideos.length === 0 && tracks.length === 0) return null;
  const heading = sectionLabel("MUSIC", profileType, title);

  if (youtubeVideos.length > 0) {
    return (
      <section id="musique" className={profileType === "MUSIC" ? "space-y-4 scroll-mt-24" : "space-y-5 scroll-mt-24"}>
        <SectionTitle title={heading} />
        <div className={profileType === "MUSIC" ? "flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-px-3 px-3 pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:scroll-px-7 sm:px-7 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0" : "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-3 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:scroll-px-7 sm:px-7 md:grid md:grid-cols-3 md:overflow-visible md:pb-0"}>
          {youtubeVideos.slice(0, 6).map((video) => <YouTubeVideoCard key={video.videoId} video={video} compact={profileType === "MUSIC"} />)}
        </div>
        {youtubeChannel ? <YouTubeChannelLink channel={youtubeChannel} /> : null}
        {tracks.length > 0 ? <div className="space-y-3 pt-2"><p className="px-4 text-xs font-bold uppercase tracking-[0.18em] text-aodi-violet-700/60 sm:px-7">Ecouter aussi</p><ManualTrackList tracks={tracks} /></div> : null}
      </section>
    );
  }

  const [featured, ...others] = tracks;
  return (
    <section id="musique" className="space-y-4 scroll-mt-24">
      <SectionTitle title={heading} />
      <FeaturedTrack track={featured} />
      {others.length > 0 ? <ManualTrackList tracks={others} /> : null}
      {youtubeChannel ? <YouTubeChannelLink channel={youtubeChannel} label="Voir la chaine YouTube" /> : null}
    </section>
  );
}

function EventSection({ events, title, profileType }: { events: PublicProfileEvent[]; title?: string | null; profileType: ProfileType }) {
  if (events.length === 0) return null;
  return <section id="evenements" className="space-y-4 scroll-mt-24"><SectionTitle title={sectionLabel("EVENTS", profileType, title)} /><div className="grid gap-3 px-4 sm:px-7 md:grid-cols-2">{events.map((event) => <article key={event.id} className="overflow-hidden rounded-lg bg-white shadow-[0_10px_22px_rgba(24,18,10,0.08)]">{event.imageUrl ? <img src={event.imageUrl} alt={event.title} loading="lazy" className="aspect-[4/3] w-full bg-aodi-violet-950 object-contain" /> : null}<div className="grid grid-cols-[72px_1fr] gap-4 p-4"><div className="self-start rounded-lg bg-aodi-violet-950 px-3 py-3 text-center text-white"><p className="text-xs font-bold uppercase text-aodi-gold">{new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(event.startDate)}</p><p className="text-2xl font-extrabold">{new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(event.startDate)}</p></div><div><h3 className="font-extrabold text-aodi-violet-950">{event.title}</h3>{event.location ? <p className="mt-1 text-sm font-semibold text-aodi-gold-dark">{event.location}</p> : null}{event.description ? <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-aodi-violet-950/75">{event.description}</p> : null}{event.externalUrl ? <a href={event.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-extrabold text-aodi-violet-900">Reserver</a> : null}</div></div></article>)}</div></section>;
}

function AboutSection({ bio, title }: { bio: string | null; title?: string | null }) {
  if (!bio) return null;
  return <section id="apropos" className="px-4 sm:px-7"><div className="rounded-lg bg-white p-5 shadow-[0_12px_26px_rgba(24,18,10,0.08)]"><h2 className="font-display text-3xl font-bold text-aodi-violet-950">{title || "A propos"}</h2><span className="mt-3 block h-0.5 w-16 bg-aodi-gold" /><p className="mt-5 whitespace-pre-line text-base leading-relaxed text-aodi-violet-950/80">{bio}</p></div></section>;
}

export function ProfileContentSections({ slug, bio, products, services, projects, galleryItems, customLinks, musicTracks, youtubeVideos, youtubeChannel, events, sections, profileType }: { slug: string; bio: string | null; products: PublicProduct[]; services: PublicService[]; projects: PublicProject[]; galleryItems: PublicGalleryItem[]; customLinks: PublicCustomLink[]; musicTracks: PublicMusicTrack[]; youtubeVideos: PublicYouTubeVideo[]; youtubeChannel: PublicYouTubeChannel | null; events: PublicProfileEvent[]; sections: PublicProfileSection[]; profileType: ProfileType }) {
  const renderers: Record<ProfileSectionType, (section: PublicProfileSection) => React.ReactNode> = {
    SOCIALS: () => null,
    CONTACT: () => null,
    CTA: () => null,
    PRODUCTS: (section) => <ProductSection products={products} title={section.title} slug={slug} profileType={profileType} />,
    SERVICES: (section) => <ServiceSection services={services} title={section.title} profileType={profileType} />,
    PROJECTS: (section) => <ProjectSection projects={projects} title={section.title} profileType={profileType} />,
    GALLERY: (section) => <GallerySection items={galleryItems} title={section.title} profileType={profileType} />,
    CUSTOM_LINKS: (section) => <LinkSection links={customLinks} title={section.title} profileType={profileType} />,
    MUSIC: (section) => <MusicSection tracks={musicTracks} youtubeVideos={youtubeVideos} youtubeChannel={youtubeChannel} title={section.title} profileType={profileType} />,
    EVENTS: (section) => <EventSection events={events} title={section.title} profileType={profileType} />,
    STATS: () => null,
    ABOUT: (section) => <AboutSection bio={bio} title={section.title} />,
  };

  return <>{sections.map((section) => <div key={section.id}>{renderers[section.type](section)}</div>)}</>;
}