/* eslint-disable @next/next/no-img-element */
import { AodiOfficialLogo } from "@/components/brand/AodiOfficialLogo";
import { ProfileContentSections } from "@/components/profile/ProfileContentSections";
import { ProfileMobileMenu, type ProfileMobileMenuItem } from "@/components/profile/ProfileMobileMenu";
import { ProfileUtilityCards } from "@/components/profile/ProfileUtilityCards";
import { SocialLinks } from "@/components/profile/SocialLinks";
import { hasContactActions, publicSectionNavItems } from "@/lib/profile-sections";
import { getProfilePublicUrl } from "@/lib/public-url";
import { getWhatsAppHref } from "@/lib/social";
import type { ProfileSectionType, ProfileType, PublicProfile } from "@/types/profile";
import { FaArrowRight, FaBriefcase, FaCalendarAlt, FaEnvelope, FaHome, FaImages, FaLink, FaMusic, FaProjectDiagram, FaQrcode, FaSave, FaShoppingBag, FaTools, FaUser, FaUsers, FaVideo } from "react-icons/fa";

/**
 * Socle UX commun a tous les profils AODI Card :
 * - hero compact porte par la photo de couverture (jamais par la photo de profil), voile leger et localise ;
 * - actions universelles sur une ligne, menu mobile dynamique, contenus compacts sur mobile.
 * Chaque type d'experience ne conserve que ses variantes visuelles (`theme`) et son contenu metier.
 */

function contactHref(profile: PublicProfile) {
  if (profile.whatsapp) return getWhatsAppHref(profile.whatsapp);
  if (profile.email) return `mailto:${profile.email}`;
  if (profile.phone) return `tel:${profile.phone}`;
  return "#contact";
}

function shortBio(profile: PublicProfile) {
  return profile.tagline || profile.bio?.split(/[.!?]/)[0]?.trim() || null;
}

function validExternalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

// Specifique MUSIC : le CTA final renvoie d'abord vers TikTok (clips), sinon vers l'URL configuree.
function musicFinalCtaHref(profile: PublicProfile) {
  return validExternalUrl(profile.tiktok) || profile.finalCtaUrl || null;
}

function positionClass(position: string) {
  const positions: Record<string, string> = { top: "object-top", bottom: "object-bottom", left: "object-left", right: "object-right", center: "object-center" };
  return positions[position] ?? "object-center";
}

// Variantes visuelles par experience : degrade de repli, accent, fond des sections, libelle et CTA metier.
function theme(profileType: ProfileType) {
  const shared = "from-[#111018] via-[#241421] to-[#5b3d22]";
  return {
    GENERAL: { gradient: shared, accent: "text-aodi-gold", surface: "bg-[#FDFBF7]", label: "AODI CARD", cta: "Construisons ensemble" },
    CORPORATE: { gradient: "from-[#08080A] via-[#1F1720] to-[#80612A]", accent: "text-aodi-gold", surface: "bg-[#FDFBF7]", label: "LEADERSHIP", cta: "Construisons ensemble" },
    ARCHITECTURE: { gradient: "from-[#07111E] via-[#1C2531] to-[#B47A2C]", accent: "text-[#F2C66D]", surface: "bg-[#FDFBF7]", label: "ARCHITECTURE", cta: "Construisons ensemble" },
    COMMERCE: { gradient: "from-[#1A1018] via-[#4C1732] to-[#C88A43]", accent: "text-[#F7C873]", surface: "bg-[#FFF9F4]", label: "BOUTIQUE", cta: "Commander maintenant" },
    MUSIC: { gradient: "from-[#090711] via-[#251040] to-[#9B5A25]", accent: "text-[#F0BE5E]", surface: "bg-[#FCFAFF]", label: "MUSIC", cta: "Ecouter maintenant" },
    ACTOR_CREATOR: { gradient: "from-[#100B13] via-[#35142A] to-[#9B662E]", accent: "text-[#F2C66D]", surface: "bg-[#FFFCF8]", label: "CREATION", cta: "Construisons ensemble" },
    TECH: { gradient: "from-[#071018] via-[#112D35] to-[#B08B37]", accent: "text-[#EAD07A]", surface: "bg-[#F8FCFB]", label: "DIGITAL", cta: "Construisons ensemble" },
    CRAFT: { gradient: "from-[#160F0A] via-[#3D2517] to-[#B47A2C]", accent: "text-[#E6B45D]", surface: "bg-[#FFF8ED]", label: "ARTISANAT", cta: "Demander un devis" },
  }[profileType];
}

const SECTION_ICONS: Partial<Record<ProfileSectionType, React.ReactNode>> = {
  MUSIC: <FaMusic className="h-5 w-5" />,
  VIDEOS: <FaVideo className="h-5 w-5" />,
  ARTISTS: <FaUsers className="h-5 w-5" />,
  EVENTS: <FaCalendarAlt className="h-5 w-5" />,
  PRODUCTS: <FaShoppingBag className="h-5 w-5" />,
  PROJECTS: <FaProjectDiagram className="h-5 w-5" />,
  SERVICES: <FaTools className="h-5 w-5" />,
  GALLERY: <FaImages className="h-5 w-5" />,
  CUSTOM_LINKS: <FaLink className="h-5 w-5" />,
  ABOUT: <FaUser className="h-5 w-5" />,
};

function mobileMenuItems(profile: PublicProfile): ProfileMobileMenuItem[] {
  const items: ProfileMobileMenuItem[] = [{ href: "#", label: "Accueil" }, ...publicSectionNavItems(profile).map(({ href, label }) => ({ href, label }))];
  if (hasContactActions(profile)) items.push({ href: "#contact", label: "Contact" });
  return items;
}

function BottomNav({ profile }: { profile: PublicProfile }) {
  const moduleItems = publicSectionNavItems(profile)
    .filter((item) => item.type !== "ABOUT" && item.type !== "CUSTOM_LINKS")
    .slice(0, 3)
    .map((item) => ({ label: item.label, href: item.href, icon: SECTION_ICONS[item.type], active: false }));
  const items = [{ label: "Accueil", href: "#", icon: <FaHome className="h-5 w-5" />, active: true }, ...moduleItems, { label: "Contact", href: "#contact", icon: <FaEnvelope className="h-5 w-5" />, active: false }].slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto grid max-w-7xl border-t border-black/5 bg-white/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 text-center text-xs font-semibold text-aodi-violet-950 shadow-[0_-14px_34px_rgba(24,18,10,0.12)] backdrop-blur md:absolute" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((item) => <a key={`${item.label}-${item.href}`} href={item.href} className={item.active ? "flex min-w-0 flex-col items-center gap-1 text-aodi-gold-dark" : "flex min-w-0 flex-col items-center gap-1 text-aodi-violet-950/80"}>{item.icon}<span className="max-w-full truncate">{item.label}</span></a>)}
    </nav>
  );
}

// Desktop : chiffres cles poses sur la couverture, a droite du texte.
function StatsPanel({ profile }: { profile: PublicProfile }) {
  if (profile.stats.length === 0) return null;
  return (
    <aside className="rounded-lg bg-white/90 p-5 text-aodi-violet-950 shadow-[0_18px_44px_rgba(0,0,0,0.18)] backdrop-blur">
      <div className="grid gap-4">
        {profile.stats.slice(0, 4).map((stat) => <div key={stat.id} className="grid grid-cols-[42px_1fr] items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8E8C7] text-aodi-gold-dark"><FaBriefcase /></span><span><strong className="block text-xl font-black leading-none">{stat.value}</strong><span className="mt-1 block text-xs font-medium leading-tight text-aodi-violet-950/80">{stat.label}</span></span></div>)}
      </div>
    </aside>
  );
}

// Mobile : bandeau compact 2 x 2 sous le hero (le panneau desktop est deja dans la couverture).
function StatsStrip({ profile }: { profile: PublicProfile }) {
  if (profile.stats.length === 0) return null;
  return (
    <section id="stats" className="relative z-10 -mt-6 px-4 sm:px-7 md:hidden">
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/20 bg-aodi-violet-950/90 p-3 text-white shadow-[0_18px_42px_rgba(24,18,10,0.18)] backdrop-blur">
        {profile.stats.slice(0, 4).map((stat) => (
          <article key={stat.id} className="grid min-w-0 grid-cols-[34px_1fr] items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-aodi-gold/20 text-sm text-aodi-gold"><FaBriefcase /></span>
            <span className="min-w-0"><strong className="block truncate text-base font-black leading-none">{stat.value}</strong><span className="mt-1 block truncate text-[0.68rem] leading-tight text-aodi-cream/80">{stat.label}</span></span>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProfileCard({ profile }: { profile: PublicProfile }) {
  const publicUrl = getProfilePublicUrl(profile.slug);
  const qrHref = `/api/qr/${profile.slug}/svg`;
  const contact = contactHref(profile);
  const visual = theme(profile.profileType);
  const heroCopy = shortBio(profile);
  const tags = profile.tags.length > 0 ? profile.tags : [profile.jobTitle, profile.company].filter(Boolean).slice(0, 3) as string[];
  const menuItems = mobileMenuItems(profile);
  const hasStats = profile.stats.length > 0;
  const finalCtaHref = profile.profileType === "MUSIC" ? musicFinalCtaHref(profile) : profile.finalCtaUrl || profile.appointmentUrl || (contact === "#contact" ? null : contact);
  const finalCtaLabel = profile.finalCtaLabel || visual.cta;

  return (
    <article className={`relative mx-auto min-h-dvh w-full max-w-7xl overflow-hidden ${visual.surface} pb-24 shadow-card md:min-h-0 md:rounded-[1.5rem]`}>
      <header className={`relative overflow-hidden bg-gradient-to-br ${visual.gradient} text-white`}>
        {/* La couverture est le visuel principal, affichee claire ; sans couverture, repli graphique du type (jamais la photo de profil). */}
        {profile.coverPhoto ? <img src={profile.coverPhoto} alt="" aria-hidden className={`absolute inset-0 h-full w-full object-cover ${positionClass(profile.coverImagePosition)}`} /> : <div className="absolute inset-0 public-bogolan-cover opacity-35" />}
        {/* Voile leger et localise : seulement la zone du texte (bas sur mobile, gauche sur desktop). */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.04)_32%,rgba(0,0,0,0.34)_58%,rgba(0,0,0,0.72)_100%)] md:bg-gradient-to-r md:from-black/70 md:via-black/30 md:to-black/5" />

        <div className={`relative z-10 flex min-h-[560px] flex-col px-5 pt-4 sm:px-9 md:min-h-[620px] md:pb-8 md:pt-5 ${hasStats ? "pb-10" : "pb-5"}`}>
          <div className="flex items-start justify-between gap-4">
            <AodiOfficialLogo className="w-[150px] max-w-[46vw]" />
            <div className="flex items-center gap-3">
              <a href={qrHref} aria-label="QR Code" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur focus:outline-none focus:ring-2 focus:ring-aodi-gold/50"><FaQrcode /></a>
              <ProfileMobileMenu items={menuItems} />
            </div>
          </div>

          <div className={`flex flex-1 flex-col justify-end pt-7 md:grid md:items-end md:gap-8 md:pt-6 ${hasStats ? "md:grid-cols-[minmax(0,1fr)_240px]" : "md:grid-cols-1"}`}>
            <div className="relative z-10 pb-1 md:pb-6">
              <p className={`text-[0.68rem] font-bold uppercase tracking-[0.3em] md:text-xs md:tracking-[0.34em] ${visual.accent}`}>{visual.label}{profile.jobTitle ? ` - ${profile.jobTitle}` : ""}</p>
              <h1 className="mt-3 max-w-[720px] break-words font-display text-[3.25rem] font-bold leading-[0.86] text-white min-[390px]:text-[3.55rem] sm:text-[5rem] md:mt-4 md:text-[6.4rem] md:leading-[0.82]">{profile.displayName}</h1>
              {profile.jobTitle || profile.company ? <p className="mt-3 max-w-[560px] text-base font-semibold leading-snug text-white md:mt-6 md:text-xl">{[profile.jobTitle, profile.company].filter(Boolean).join(" - ")}</p> : null}
              {heroCopy ? <p className="mt-3 line-clamp-2 max-w-[520px] text-sm leading-relaxed text-aodi-cream/95 md:mt-4 md:text-lg">{heroCopy}.</p> : null}
              {tags.length > 0 ? <div className="mt-4 flex flex-wrap gap-2 md:mt-5">{tags.map((tag) => <span key={tag} className="rounded-full border border-aodi-gold/60 bg-black/30 px-3 py-1.5 text-[0.72rem] font-semibold text-aodi-gold-light backdrop-blur md:px-4 md:py-2 md:text-xs">{tag}</span>)}</div> : null}
              <SocialLinks profile={profile} compact />
              <div className="mt-5 grid grid-cols-2 gap-2 md:mt-6 md:max-w-[560px] md:gap-3">
                <a href={`/api/vcard/${profile.slug}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-aodi-gold-light via-aodi-gold to-aodi-gold-dark px-3 py-3 text-xs font-extrabold text-aodi-violet-950 shadow-[0_12px_30px_rgba(0,0,0,0.24)] md:min-h-14 md:gap-3 md:px-5 md:py-4 md:text-sm"><FaSave className="shrink-0" /> <span className="md:hidden">Enregistrer</span><span className="hidden md:inline">Enregistrer mon contact</span></a>
                <a href={contact} target={profile.whatsapp ? "_blank" : undefined} rel={profile.whatsapp ? "noopener noreferrer" : undefined} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-3 py-3 text-xs font-extrabold text-aodi-violet-950 shadow-[0_12px_30px_rgba(0,0,0,0.18)] md:min-h-14 md:gap-3 md:px-5 md:py-4 md:text-sm"><FaEnvelope className="shrink-0" /> Me contacter</a>
              </div>
            </div>

            {hasStats ? <div className="hidden md:block md:pb-6"><StatsPanel profile={profile} /></div> : null}
          </div>
        </div>
      </header>

      <StatsStrip profile={profile} />

      {profile.bio ? <section className="relative z-10 mt-4 hidden px-4 sm:px-7 md:block"><div className="grid gap-4 rounded-lg border border-white/50 bg-white/70 p-5 text-aodi-violet-950 shadow-[0_18px_42px_rgba(24,18,10,0.16)] backdrop-blur md:grid-cols-[1fr_auto] md:items-center"><p className="font-display text-xl font-semibold italic leading-relaxed">{profile.bio.split("\n")[0]}</p><a href="#apropos" className="inline-flex items-center justify-center gap-3 rounded-full bg-aodi-gold px-5 py-3 text-sm font-extrabold text-aodi-violet-950">Decouvrir mon parcours <FaArrowRight /></a></div></section> : null}

      <div className="mt-4 space-y-6 md:mt-6 md:space-y-8">
        <ProfileUtilityCards displayName={profile.displayName} slug={profile.slug} publicUrl={publicUrl} appointmentUrl={profile.appointmentUrl} profileType={profile.profileType} />
        <ProfileContentSections slug={profile.slug} bio={profile.bio} products={profile.products} services={profile.services} projects={profile.projects} galleryItems={profile.galleryItems} customLinks={profile.customLinks} musicTracks={profile.musicTracks} youtubeVideos={profile.youtubeVideos} youtubeChannel={profile.youtubeChannel} videos={profile.videos} videoChannel={profile.videoChannel} artists={profile.artists} events={profile.events} sections={profile.sections} profileType={profile.profileType} />
        {finalCtaHref ? <section className="relative overflow-hidden bg-aodi-violet-950 px-5 py-8 text-white sm:px-9 md:py-10"><div className="absolute inset-0 public-bogolan-cover opacity-25" /><div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><p className="font-display text-2xl font-semibold italic leading-tight text-aodi-cream md:text-3xl">{profile.tagline || heroCopy || "Votre identite, sans limites."}</p><a href={finalCtaHref} target={finalCtaHref.startsWith("http") ? "_blank" : undefined} rel={finalCtaHref.startsWith("http") ? "noopener noreferrer" : undefined} className="inline-flex items-center justify-center gap-3 rounded-full bg-aodi-gold px-6 py-4 text-sm font-extrabold text-aodi-violet-950">{finalCtaLabel} <FaArrowRight /></a></div></section> : null}
      </div>

      <BottomNav profile={profile} />
    </article>
  );
}
