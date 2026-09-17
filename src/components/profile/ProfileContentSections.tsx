/* eslint-disable @next/next/no-img-element */
import type { ProfileSectionType, ProfileType, PublicCustomLink, PublicGalleryItem, PublicManagedArtist, PublicMusicTrack, PublicProduct, PublicYouTubeChannel, PublicYouTubeVideo, PublicProfileEvent, PublicProfileSection, PublicProject, PublicService } from "@/types/profile";
import { FaApple, FaExternalLinkAlt, FaGithub, FaImages, FaMusic, FaPlay, FaStore, FaTools, FaUser } from "react-icons/fa";
import { FaSpotify, FaYoutube } from "react-icons/fa6";
import { formatProductPrice as money, productOrderHref } from "@/lib/product-order";

// Section VIDEOS generique : le vocabulaire suit le metier, le moteur et la mise en page sont communs.
const VIDEO_SECTION_COPY: Record<ProfileType, { title: string; eyebrow: string }> = {
  GENERAL: { title: "Videos", eyebrow: "En video" },
  CORPORATE: { title: "Interviews et presentations", eyebrow: "Prises de parole" },
  ARCHITECTURE: { title: "Projets en video", eyebrow: "Visites et realisations" },
  COMMERCE: { title: "Videos", eyebrow: "Decouvrir en video" },
  MUSIC: { title: "Videos", eyebrow: "En video" },
  ACTOR_CREATOR: { title: "Creations en video", eyebrow: "Sketches et contenus" },
  TECH: { title: "Demonstrations", eyebrow: "Demos et tutoriels" },
  CRAFT: { title: "Realisations en video", eyebrow: "Fabrication et savoir-faire" },
};

function sectionLabel(type: ProfileSectionType, profileType: ProfileType, title?: string | null) {
  if (title) return title;
  if (type === "VIDEOS") return VIDEO_SECTION_COPY[profileType].title;
  if (type === "ARTISTS") return "Artistes accompagnes";
  if (type === "PRODUCTS") return profileType === "COMMERCE" ? "Nos collections" : "Boutique";
  if (type === "PROJECTS") return profileType === "ARCHITECTURE" || profileType === "CRAFT" || profileType === "ACTOR_CREATOR" ? "Mes realisations" : "Projets recents";
  if (type === "MUSIC") return "Dernieres sorties";
  if (type === "EVENTS") return profileType === "MUSIC" || profileType === "ACTOR_CREATOR" ? "Prochains evenements" : profileType === "COMMERCE" ? "Promotions" : "Actualites";
  if (type === "SERVICES") return "Mes services";
  if (type === "GALLERY") return "Galerie";
  if (type === "CUSTOM_LINKS") return "Liens utiles";
  if (type === "STATS") return "Chiffres cles";
  return "A propos";
}

/**
 * Socle responsive commun a tous les types : sur mobile, plusieurs apercus compacts par section
 * (grille 2 colonnes ou carrousel horizontal a defilement), jamais une seule carte plein ecran.
 * Le contenu et le style restent propres a chaque metier.
 */
const COMPACT_GRID = "grid grid-cols-2 gap-3 px-4 sm:px-7 md:gap-4";
const SCROLLER = "flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-3 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:scroll-px-7 sm:px-7 md:grid md:gap-4 md:overflow-visible md:pb-0";
const SCROLLER_CARD = "w-[64vw] max-w-[260px] shrink-0 snap-start md:w-auto md:max-w-none";

function SectionTitle({ title, actionHref, actionLabel }: { title: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-4 px-4 sm:px-7">
      <div className="min-w-0">
        <h2 className="break-words font-display text-[1.75rem] font-bold leading-none text-aodi-violet-950 sm:text-4xl">{title}</h2>
        <span className="mt-3 block h-0.5 w-16 bg-aodi-gold" />
      </div>
      {actionHref ? <a href={actionHref} className="hidden shrink-0 items-center gap-2 text-sm font-bold text-aodi-violet-950 sm:inline-flex">{actionLabel ?? "Voir tout"} <FaExternalLinkAlt className="h-3 w-3" /></a> : null}
    </div>
  );
}

function ProductImage({ product }: { product: PublicProduct }) {
  if (product.imageUrl) return <img src={product.imageUrl} alt={product.name} loading="lazy" className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-48" />;
  return <div className="flex aspect-[4/3] items-center justify-center bg-[#F5EAD8] text-aodi-violet-900/45 md:aspect-auto md:h-44"><FaStore className="h-9 w-9" /></div>;
}

// Le badge "Indisponible" ne depend que de `isAvailable`. Un produit disponible sans lien de commande
// (ni URL, ni WhatsApp produit, ni WhatsApp profil) reste affiche "Disponible", jamais "Indisponible".
function ProductAction({ product, href }: { product: PublicProduct; href: string | null }) {
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex w-full items-center justify-center rounded-lg bg-aodi-violet-950 px-3 py-2.5 text-[0.7rem] font-extrabold text-white md:mt-4 md:px-4 md:py-3 md:text-xs">Commander</a>;
  if (!product.isAvailable) return <p className="mt-auto rounded-lg bg-aodi-violet-100 px-3 py-2.5 text-center text-[0.7rem] font-bold text-aodi-violet-700 md:mt-4 md:px-4 md:py-3 md:text-xs">Indisponible</p>;
  return <p className="mt-auto rounded-lg bg-emerald-50 px-3 py-2.5 text-center text-[0.7rem] font-bold text-emerald-700 md:mt-4 md:px-4 md:py-3 md:text-xs">Disponible</p>;
}

function ProductSection({ products, title, slug, profileType, whatsapp }: { products: PublicProduct[]; title?: string | null; slug: string; profileType: ProfileType; whatsapp: string | null }) {
  if (products.length === 0) return null;
  return (
    <section id="boutique" className="space-y-4 scroll-mt-24">
      <SectionTitle title={sectionLabel("PRODUCTS", profileType, title)} actionHref={`/${slug}/boutique`} actionLabel="Voir toute la boutique" />
      <div className={`${COMPACT_GRID} md:grid-cols-3 lg:grid-cols-4`}>
        {products.slice(0, 4).map((product) => {
          const href = productOrderHref(product, whatsapp);
          return (
            <article key={product.id} className="flex flex-col overflow-hidden rounded-lg border border-black/5 bg-white shadow-[0_14px_30px_rgba(24,18,10,0.09)]">
              <ProductImage product={product} />
              <div className="flex flex-1 flex-col p-3 md:p-4">
                <h3 className="line-clamp-2 min-h-[2.2rem] text-[0.8rem] font-extrabold leading-snug text-aodi-violet-950 md:min-h-[2.6rem] md:text-sm">{product.name}</h3>
                {product.description ? <p className="mt-1.5 line-clamp-2 text-[0.7rem] leading-relaxed text-aodi-violet-950/70 md:mt-2 md:text-xs">{product.description}</p> : null}
                <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-0.5 md:mt-3">
                  {product.oldPrice ? <span className="text-[0.68rem] font-semibold text-aodi-violet-700/45 line-through md:text-xs">{money(product.oldPrice, product.currency)}</span> : null}
                  <span className="text-sm font-black text-aodi-gold-dark md:text-lg">{money(product.price, product.currency)}</span>
                </div>
                <ProductAction product={product} href={href} />
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
      <div className={`${COMPACT_GRID} md:grid-cols-4`}>
        {services.slice(0, 4).map((service) => (
          <article key={service.id} className="rounded-lg border border-black/5 bg-white p-3 shadow-[0_14px_30px_rgba(24,18,10,0.08)] md:p-4">
            {service.imageUrl ? <img src={service.imageUrl} alt={service.name} loading="lazy" className="mb-3 h-20 w-full rounded-lg object-cover md:mb-4 md:h-28" /> : <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FBF3E5] text-aodi-violet-950 md:mb-4 md:h-14 md:w-14"><FaTools className="h-5 w-5 md:h-7 md:w-7" /></span>}
            <h3 className="line-clamp-2 text-[0.8rem] font-extrabold leading-snug text-aodi-violet-950 md:text-sm">{service.name}</h3>
            {service.description ? <p className="mt-1.5 line-clamp-2 text-[0.7rem] leading-relaxed text-aodi-violet-950/70 md:mt-2 md:line-clamp-3 md:text-xs">{service.description}</p> : null}
            {service.price !== null ? <p className="mt-2 text-[0.8rem] font-extrabold text-aodi-gold-dark md:mt-3 md:text-sm">{money(service.price, service.currency ?? "FCFA")}</p> : null}
            {service.ctaUrl ? <a href={service.ctaUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-[0.7rem] font-extrabold text-aodi-violet-950 md:mt-3 md:text-xs">{service.ctaLabel || "En savoir plus"}</a> : null}
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
      <div className={`${SCROLLER} md:grid-cols-4`}>
        {projects.slice(0, 4).map((project) => (
          <article key={project.id} className={`${SCROLLER_CARD} overflow-hidden rounded-lg border border-black/5 bg-white shadow-[0_14px_30px_rgba(24,18,10,0.09)]`}>
            {project.imageUrl ? <img src={project.imageUrl} alt={project.title} loading="lazy" className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-36" /> : <div className="aspect-[4/3] bg-[#F5EAD8] md:aspect-auto md:h-28" />}
            <div className="p-3 md:p-4">
              <h3 className="line-clamp-2 text-[0.8rem] font-extrabold leading-snug text-aodi-violet-950 md:text-sm">{project.title}</h3>
              {project.technologies ? <span className="mt-2 inline-flex max-w-full truncate rounded-full bg-[#F9E6BF] px-3 py-1 text-[0.66rem] font-bold text-aodi-violet-950 md:mt-3 md:text-[0.68rem]">{project.technologies}</span> : null}
              {project.description ? <p className="mt-1.5 line-clamp-2 text-[0.7rem] leading-relaxed text-aodi-violet-950/70 md:mt-2 md:text-xs">{project.description}</p> : null}
              <div className="mt-2 flex flex-wrap gap-2 text-[0.7rem] font-bold md:mt-3 md:text-xs">
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
      <div className="grid grid-cols-3 gap-2 px-4 sm:px-7 md:grid-cols-5 md:gap-3">
        {items.slice(0, 5).map((item) => <img key={item.id} src={item.imageUrl} alt={item.title || item.description || "Galerie"} loading="lazy" className="aspect-square w-full rounded-lg object-cover shadow-[0_10px_22px_rgba(24,18,10,0.08)] md:aspect-[4/3]" />)}
        {items.length > 5 ? <a href="#galerie" className="flex aspect-square items-center justify-center rounded-lg bg-white text-center text-[0.7rem] font-bold text-aodi-violet-950 shadow-[0_10px_22px_rgba(24,18,10,0.08)] md:aspect-[4/3] md:text-sm"><span><FaImages className="mx-auto mb-1.5 h-5 w-5 md:mb-2 md:h-7 md:w-7" />Voir plus<br />de photos</span></a> : null}
      </div>
    </section>
  );
}

function LinkSection({ links, title, profileType }: { links: PublicCustomLink[]; title?: string | null; profileType: ProfileType }) {
  if (links.length === 0) return null;
  return <section id="liens" className="space-y-4 scroll-mt-24"><SectionTitle title={sectionLabel("CUSTOM_LINKS", profileType, title)} /><div className="grid gap-2.5 px-4 sm:px-7 min-[430px]:grid-cols-2 md:gap-3">{links.map((link) => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-lg border border-black/5 bg-white px-3.5 py-3 text-[0.8rem] font-bold text-aodi-violet-950 shadow-[0_10px_22px_rgba(24,18,10,0.08)] md:px-4 md:py-4 md:text-sm"><span className="min-w-0 truncate">{link.icon ? `${link.icon} ` : ""}{link.label}</span><FaExternalLinkAlt className="h-4 w-4 shrink-0 text-aodi-gold-dark" /></a>)}</div></section>;
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

function formatVideoDateShort(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(date);
}

// Carte video du module generique : vignette 16/9, titre, date. Volontairement differente des vignettes MUSIC.
function VideoCard({ video }: { video: PublicYouTubeVideo }) {
  const date = video.publishedAt ? formatVideoDateShort(video.publishedAt) : null;
  return (
    <article className="w-[70vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-lg border border-black/5 bg-white shadow-[0_12px_26px_rgba(24,18,10,0.08)] md:w-auto md:max-w-none">
      <a href={video.url} target="_blank" rel="noopener noreferrer" className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-aodi-gold">
        <div className="relative aspect-video overflow-hidden bg-aodi-violet-950">
          <img src={video.thumbnail} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <span aria-hidden className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-white backdrop-blur"><FaPlay className="h-2.5 w-2.5" /> Lire</span>
        </div>
        <div className="p-3 md:p-4">
          <h3 className="line-clamp-2 min-h-[2.4rem] text-[0.82rem] font-extrabold leading-snug text-aodi-violet-950 md:text-sm">{video.title || "Voir la video"}</h3>
          <div className="mt-2 flex items-center justify-between gap-2 text-[0.68rem] font-semibold text-aodi-violet-700/65 md:text-xs">
            {date ? <time dateTime={video.publishedAt}>{date}</time> : <span />}
            <span className="inline-flex items-center gap-1 text-aodi-gold-dark"><FaYoutube className="h-3.5 w-3.5" /> YouTube</span>
          </div>
        </div>
      </a>
    </article>
  );
}

/** Module VIDEOS : dernieres videos de la chaine generique du profil (tous types), carrousel compact sur mobile. */
function VideoSection({ videos, channel, title, profileType }: { videos: PublicYouTubeVideo[]; channel: PublicYouTubeChannel | null; title?: string | null; profileType: ProfileType }) {
  if (videos.length === 0) return null;
  const copy = VIDEO_SECTION_COPY[profileType];
  return (
    <section id="videos" className="space-y-4 scroll-mt-24">
      <div>
        <p className="px-4 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-aodi-gold-dark sm:px-7">{copy.eyebrow}</p>
        <div className="mt-1"><SectionTitle title={sectionLabel("VIDEOS", profileType, title)} actionHref={channel?.url} actionLabel="Voir la chaine" /></div>
      </div>
      <div className={`${SCROLLER} md:grid-cols-3`}>
        {videos.slice(0, 6).map((video) => <VideoCard key={video.videoId} video={video} />)}
      </div>
      {channel ? <YouTubeChannelLink channel={channel} label="Voir toute la chaine" /> : null}
    </section>
  );
}

function artistInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

// Fiche artiste compacte : identite, role, description courte, puis 3 vignettes (clips mis en avant, puis dernieres videos).
function ArtistCard({ artist }: { artist: PublicManagedArtist }) {
  return (
    <article className="overflow-hidden rounded-lg border border-black/5 bg-white p-3 shadow-[0_12px_26px_rgba(24,18,10,0.08)] md:p-4">
      <div className="flex items-start gap-3">
        {artist.photoUrl ? <img src={artist.photoUrl} alt={artist.name} loading="lazy" className="h-14 w-14 shrink-0 rounded-lg object-cover md:h-16 md:w-16" /> : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-aodi-violet-950 font-display text-xl font-bold text-aodi-gold md:h-16 md:w-16"><span aria-hidden>{artistInitials(artist.name)}</span><FaUser className="sr-only" /></span>}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-extrabold leading-tight text-aodi-violet-950 md:text-lg">{artist.name}</h3>
          {artist.role ? <p className="mt-0.5 truncate text-xs font-bold uppercase tracking-[0.14em] text-aodi-gold-dark">{artist.role}</p> : null}
          {artist.description ? <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-aodi-violet-950/75 md:text-sm">{artist.description}</p> : null}
        </div>
      </div>
      {artist.videos.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {artist.videos.slice(0, 3).map((video) => (
            <a key={video.videoId} href={video.url} target="_blank" rel="noopener noreferrer" aria-label={video.title || "Voir la video"} className="group relative aspect-video overflow-hidden rounded-md bg-aodi-violet-950">
              <img src={video.thumbnail} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <span aria-hidden className="absolute inset-0 flex items-center justify-center bg-black/10"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-aodi-violet-950 shadow"><FaPlay className="ml-0.5 h-2.5 w-2.5" /></span></span>
            </a>
          ))}
        </div>
      ) : null}
      {artist.channel ? <a href={artist.channel.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-aodi-violet-950 hover:text-aodi-gold-dark"><FaYoutube className="h-3.5 w-3.5 text-[#FF0000]" /> {artist.channel.title ? `Chaine ${artist.channel.title}` : "Voir la chaine"}</a> : null}
    </article>
  );
}

/** Module ARTISTS : artistes accompagnes par un producteur, manager ou label. Suit le theme du profil principal. */
function ArtistsSection({ artists, title, profileType }: { artists: PublicManagedArtist[]; title?: string | null; profileType: ProfileType }) {
  if (artists.length === 0) return null;
  return (
    <section id="artistes" className="space-y-4 scroll-mt-24">
      <SectionTitle title={sectionLabel("ARTISTS", profileType, title)} />
      <div className="grid gap-3 px-4 sm:px-7 md:grid-cols-2 md:gap-4">
        {artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}
      </div>
    </section>
  );
}

function EventSection({ events, title, profileType }: { events: PublicProfileEvent[]; title?: string | null; profileType: ProfileType }) {
  if (events.length === 0) return null;
  return (
    <section id="evenements" className="space-y-4 scroll-mt-24">
      <SectionTitle title={sectionLabel("EVENTS", profileType, title)} />
      <div className={`${SCROLLER} md:grid-cols-2`}>
        {events.map((event) => (
          <article key={event.id} className="w-[76vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-lg bg-white shadow-[0_10px_22px_rgba(24,18,10,0.08)] md:w-auto md:max-w-none">
            {event.imageUrl ? <img src={event.imageUrl} alt={event.title} loading="lazy" className="aspect-[16/9] w-full bg-aodi-violet-950 object-cover md:aspect-[4/3] md:object-contain" /> : null}
            <div className="grid grid-cols-[56px_1fr] gap-3 p-3 md:grid-cols-[72px_1fr] md:gap-4 md:p-4">
              <div className="self-start rounded-lg bg-aodi-violet-950 px-2 py-2 text-center text-white md:px-3 md:py-3"><p className="text-[0.66rem] font-bold uppercase text-aodi-gold md:text-xs">{new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(event.startDate)}</p><p className="text-xl font-extrabold md:text-2xl">{new Intl.DateTimeFormat("fr-FR", { day: "2-digit" }).format(event.startDate)}</p></div>
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-aodi-violet-950 md:text-base">{event.title}</h3>
                {event.location ? <p className="mt-1 truncate text-xs font-semibold text-aodi-gold-dark md:text-sm">{event.location}</p> : null}
                {event.description ? <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-aodi-violet-950/75 md:mt-2 md:text-sm">{event.description}</p> : null}
                {event.externalUrl ? <a href={event.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-xs font-extrabold text-aodi-violet-900 md:mt-3 md:text-sm">Reserver</a> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AboutSection({ bio, title }: { bio: string | null; title?: string | null }) {
  if (!bio) return null;
  return <section id="apropos" className="px-4 scroll-mt-24 sm:px-7"><div className="rounded-lg bg-white p-4 shadow-[0_12px_26px_rgba(24,18,10,0.08)] md:p-5"><h2 className="font-display text-[1.75rem] font-bold text-aodi-violet-950 md:text-3xl">{title || "A propos"}</h2><span className="mt-3 block h-0.5 w-16 bg-aodi-gold" /><p className="mt-4 whitespace-pre-line text-[0.95rem] leading-relaxed text-aodi-violet-950/80 md:mt-5 md:text-base">{bio}</p></div></section>;
}

export function ProfileContentSections({ slug, bio, whatsapp, products, services, projects, galleryItems, customLinks, musicTracks, youtubeVideos, youtubeChannel, videos, videoChannel, artists, events, sections, profileType }: { slug: string; bio: string | null; whatsapp: string | null; products: PublicProduct[]; services: PublicService[]; projects: PublicProject[]; galleryItems: PublicGalleryItem[]; customLinks: PublicCustomLink[]; musicTracks: PublicMusicTrack[]; youtubeVideos: PublicYouTubeVideo[]; youtubeChannel: PublicYouTubeChannel | null; videos: PublicYouTubeVideo[]; videoChannel: PublicYouTubeChannel | null; artists: PublicManagedArtist[]; events: PublicProfileEvent[]; sections: PublicProfileSection[]; profileType: ProfileType }) {
  const renderers: Record<ProfileSectionType, (section: PublicProfileSection) => React.ReactNode> = {
    SOCIALS: () => null,
    CONTACT: () => null,
    CTA: () => null,
    PRODUCTS: (section) => <ProductSection products={products} title={section.title} slug={slug} profileType={profileType} whatsapp={whatsapp} />,
    SERVICES: (section) => <ServiceSection services={services} title={section.title} profileType={profileType} />,
    PROJECTS: (section) => <ProjectSection projects={projects} title={section.title} profileType={profileType} />,
    GALLERY: (section) => <GallerySection items={galleryItems} title={section.title} profileType={profileType} />,
    CUSTOM_LINKS: (section) => <LinkSection links={customLinks} title={section.title} profileType={profileType} />,
    MUSIC: (section) => <MusicSection tracks={musicTracks} youtubeVideos={youtubeVideos} youtubeChannel={youtubeChannel} title={section.title} profileType={profileType} />,
    VIDEOS: (section) => <VideoSection videos={videos} channel={videoChannel} title={section.title} profileType={profileType} />,
    ARTISTS: (section) => <ArtistsSection artists={artists} title={section.title} profileType={profileType} />,
    EVENTS: (section) => <EventSection events={events} title={section.title} profileType={profileType} />,
    STATS: () => null,
    ABOUT: (section) => <AboutSection bio={bio} title={section.title} />,
  };

  return <>{sections.map((section) => <div key={section.id}>{renderers[section.type](section)}</div>)}</>;
}