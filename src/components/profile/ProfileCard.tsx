/* eslint-disable @next/next/no-img-element */
import { AodiOfficialLogo } from "@/components/brand/AodiOfficialLogo";
import { ProfileContentSections } from "@/components/profile/ProfileContentSections";
import { ProfileUtilityCards } from "@/components/profile/ProfileUtilityCards";
import { SocialLinks } from "@/components/profile/SocialLinks";
import { getProfilePublicUrl } from "@/lib/public-url";
import { getWhatsAppHref } from "@/lib/social";
import type { ProfileSectionType, ProfileType, PublicProfile } from "@/types/profile";
import { FaArrowRight, FaBars, FaBriefcase, FaCalendarAlt, FaEnvelope, FaHome, FaImages, FaMusic, FaProjectDiagram, FaQrcode, FaSave, FaShoppingBag, FaTools } from "react-icons/fa";

function initials(profile: PublicProfile): string {
  const first = profile.firstName.trim().charAt(0);
  const last = profile.lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || profile.displayName.charAt(0).toUpperCase();
}

function contactHref(profile: PublicProfile) {
  if (profile.whatsapp) return getWhatsAppHref(profile.whatsapp);
  if (profile.email) return `mailto:${profile.email}`;
  if (profile.phone) return `tel:${profile.phone}`;
  return "#contact";
}

function shortBio(profile: PublicProfile) {
  return profile.tagline || profile.bio?.split(/[.!?]/)[0]?.trim() || null;
}

function positionClass(position: string) {
  const positions: Record<string, string> = { top: "object-top", bottom: "object-bottom", left: "object-left", right: "object-right", center: "object-center" };
  return positions[position] ?? "object-center";
}

function theme(profileType: ProfileType) {
  const shared = "from-[#111018] via-[#241421] to-[#5b3d22]";
  return {
    GENERAL: { gradient: shared, accent: "text-aodi-gold", surface: "bg-[#FDFBF7]", label: "AODI CARD" },
    CORPORATE: { gradient: "from-[#08080A] via-[#1F1720] to-[#80612A]", accent: "text-aodi-gold", surface: "bg-[#FDFBF7]", label: "LEADERSHIP" },
    ARCHITECTURE: { gradient: "from-[#07111E] via-[#1C2531] to-[#B47A2C]", accent: "text-[#F2C66D]", surface: "bg-[#FDFBF7]", label: "ARCHITECTURE" },
    COMMERCE: { gradient: "from-[#1A1018] via-[#4C1732] to-[#C88A43]", accent: "text-[#F7C873]", surface: "bg-[#FFF9F4]", label: "BOUTIQUE" },
    MUSIC: { gradient: "from-[#090711] via-[#251040] to-[#9B5A25]", accent: "text-[#F0BE5E]", surface: "bg-[#FCFAFF]", label: "MUSIC" },
    ACTOR_CREATOR: { gradient: "from-[#100B13] via-[#35142A] to-[#9B662E]", accent: "text-[#F2C66D]", surface: "bg-[#FFFCF8]", label: "CREATION" },
    TECH: { gradient: "from-[#071018] via-[#112D35] to-[#B08B37]", accent: "text-[#EAD07A]", surface: "bg-[#F8FCFB]", label: "DIGITAL" },
    CRAFT: { gradient: "from-[#160F0A] via-[#3D2517] to-[#B47A2C]", accent: "text-[#E6B45D]", surface: "bg-[#FFF8ED]", label: "ARTISANAT" },
  }[profileType];
}

const sectionNav: Partial<Record<ProfileSectionType, { href: string; icon: React.ReactNode; label: Record<ProfileType, string> & { default: string } }>> = {
  MUSIC: { href: "#musique", icon: <FaMusic className="h-5 w-5" />, label: { default: "Musique", GENERAL: "Musique", CORPORATE: "Musique", ARCHITECTURE: "Musique", COMMERCE: "Musique", MUSIC: "Musique", ACTOR_CREATOR: "Musique", TECH: "Musique", CRAFT: "Musique" } },
  EVENTS: { href: "#evenements", icon: <FaCalendarAlt className="h-5 w-5" />, label: { default: "Actualites", GENERAL: "Actualites", CORPORATE: "Actualites", ARCHITECTURE: "Actualites", COMMERCE: "Promotions", MUSIC: "Events", ACTOR_CREATOR: "Events", TECH: "Actualites", CRAFT: "Services" } },
  PRODUCTS: { href: "#boutique", icon: <FaShoppingBag className="h-5 w-5" />, label: { default: "Boutique", GENERAL: "Boutique", CORPORATE: "Boutique", ARCHITECTURE: "Boutique", COMMERCE: "Boutique", MUSIC: "Boutique", ACTOR_CREATOR: "Boutique", TECH: "Boutique", CRAFT: "Boutique" } },
  PROJECTS: { href: "#projets", icon: <FaProjectDiagram className="h-5 w-5" />, label: { default: "Projets", GENERAL: "Projets", CORPORATE: "Projets", ARCHITECTURE: "Projets", COMMERCE: "Projets", MUSIC: "Projets", ACTOR_CREATOR: "Realisations", TECH: "Projets", CRAFT: "Realisations" } },
  SERVICES: { href: "#services", icon: <FaTools className="h-5 w-5" />, label: { default: "Services", GENERAL: "Services", CORPORATE: "Services", ARCHITECTURE: "Services", COMMERCE: "Services", MUSIC: "Services", ACTOR_CREATOR: "Services", TECH: "Services", CRAFT: "Services" } },
  GALLERY: { href: "#galerie", icon: <FaImages className="h-5 w-5" />, label: { default: "Galerie", GENERAL: "Galerie", CORPORATE: "Galerie", ARCHITECTURE: "Galerie", COMMERCE: "Galerie", MUSIC: "Galerie", ACTOR_CREATOR: "Galerie", TECH: "Galerie", CRAFT: "Galerie" } },
};

function BottomNav({ profile }: { profile: PublicProfile }) {
  const moduleItems = profile.sections
    .map((section) => sectionNav[section.type])
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({ label: item.label[profile.profileType] ?? item.label.default, href: item.href, icon: item.icon, active: false }));
  const deduped = moduleItems.filter((item, index, list) => list.findIndex((candidate) => candidate.href === item.href) === index).slice(0, 3);
  const items = [{ label: "Accueil", href: "#", icon: <FaHome className="h-5 w-5" />, active: true }, ...deduped, { label: "Contact", href: "#contact", icon: <FaEnvelope className="h-5 w-5" />, active: false }].slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto grid max-w-7xl border-t border-black/5 bg-white/95 px-2 py-2 text-center text-xs font-semibold text-aodi-violet-950 shadow-[0_-14px_34px_rgba(24,18,10,0.12)] backdrop-blur md:absolute" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((item) => <a key={`${item.label}-${item.href}`} href={item.href} className={item.active ? "flex min-w-0 flex-col items-center gap-1 text-aodi-gold-dark" : "flex min-w-0 flex-col items-center gap-1 text-aodi-violet-950/80"}>{item.icon}<span className="max-w-full truncate">{item.label}</span></a>)}
    </nav>
  );
}

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


function StatsStrip({ profile }: { profile: PublicProfile }) {
  if (profile.stats.length === 0) return null;
  return (
    <section id="stats" className="relative z-10 -mt-8 px-4 sm:px-7">
      <div className="grid gap-3 rounded-lg border border-white/20 bg-aodi-violet-950/90 p-4 text-white shadow-[0_18px_42px_rgba(24,18,10,0.18)] backdrop-blur md:grid-cols-4">
        {profile.stats.slice(0, 4).map((stat) => (
          <article key={stat.id} className="grid grid-cols-[42px_1fr] items-center gap-3 border-white/10 md:border-r md:last:border-r-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-aodi-gold/20 text-aodi-gold"><FaBriefcase /></span>
            <span><strong className="block text-xl font-black leading-none">{stat.value}</strong><span className="mt-1 block text-xs leading-tight text-aodi-cream/80">{stat.label}</span></span>
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
  const heroPhoto = profile.profilePhoto || profile.coverPhoto;
  const coverPhoto = profile.coverPhoto || profile.profilePhoto;
  const hasHeroVisual = Boolean(heroPhoto || profile.stats.length > 0);
  const tags = profile.tags.length > 0 ? profile.tags : [profile.jobTitle, profile.company].filter(Boolean).slice(0, 3) as string[];
  const finalCtaHref = profile.finalCtaUrl || profile.appointmentUrl || (contact === "#contact" ? null : contact);
  const finalCtaLabel = profile.finalCtaLabel || (profile.profileType === "COMMERCE" ? "Commander maintenant" : profile.profileType === "MUSIC" ? "Ecouter maintenant" : profile.profileType === "CRAFT" ? "Demander un devis" : "Construisons ensemble");

  return (
    <article className={`relative mx-auto min-h-dvh w-full max-w-7xl overflow-hidden ${visual.surface} pb-24 shadow-card md:min-h-0 md:rounded-[1.5rem]`}>
      <header className={`relative overflow-hidden bg-gradient-to-br ${visual.gradient} text-white ${hasHeroVisual ? "min-h-[760px] md:min-h-[690px]" : "min-h-[560px] md:min-h-[560px]"}`}>
        {coverPhoto ? <img src={coverPhoto} alt="" aria-hidden className={`absolute inset-0 h-full w-full object-cover ${positionClass(profile.coverImagePosition)} opacity-55 mix-blend-screen`} /> : <div className="absolute inset-0 public-bogolan-cover opacity-35" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/75 md:bg-gradient-to-r md:from-black/80 md:via-black/35 md:to-black/20" />
        <div className={`relative z-10 flex flex-col px-5 pb-7 pt-5 sm:px-9 ${hasHeroVisual ? "min-h-[760px] md:min-h-[690px]" : "min-h-[560px] md:min-h-[560px]"}`}>
          <div className="flex items-start justify-between gap-4">
            <AodiOfficialLogo className="w-[150px] max-w-[46vw]" />
            <div className="flex items-center gap-3">
              <a href={qrHref} aria-label="QR Code" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur focus:outline-none focus:ring-2 focus:ring-aodi-gold/50"><FaQrcode /></a>
              <button type="button" aria-label="Menu" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur"><FaBars /></button>
            </div>
          </div>

          <div className={`grid flex-1 gap-6 pt-9 md:items-end md:pt-0 ${hasHeroVisual ? "md:grid-cols-[0.82fr_1.18fr]" : "md:grid-cols-1"}`}>
            <div className="relative z-10 pb-3 md:pb-12">
              <p className={`text-xs font-bold uppercase tracking-[0.34em] ${visual.accent}`}>{visual.label}{profile.jobTitle ? ` - ${profile.jobTitle}` : ""}</p>
              <h1 className="mt-4 max-w-[720px] break-words font-display text-[3.7rem] font-bold leading-[0.82] text-white sm:text-[5rem] md:text-[6.4rem]">{profile.displayName}</h1>
              {profile.jobTitle || profile.company ? <p className="mt-6 max-w-[560px] text-xl font-semibold leading-snug text-white">{[profile.jobTitle, profile.company].filter(Boolean).join(" - ")}</p> : null}
              {heroCopy ? <p className="mt-4 max-w-[520px] text-lg leading-relaxed text-aodi-cream/95">{heroCopy}.</p> : null}
              {tags.length > 0 ? <div className="mt-5 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full border border-aodi-gold/60 bg-black/20 px-4 py-2 text-xs font-semibold text-aodi-gold-light backdrop-blur">{tag}</span>)}</div> : null}
              <SocialLinks profile={profile} compact />
              <div className="mt-6 grid gap-3 min-[430px]:grid-cols-2">
                <a href={`/api/vcard/${profile.slug}`} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-aodi-gold-light via-aodi-gold to-aodi-gold-dark px-5 py-4 text-sm font-extrabold text-aodi-violet-950 shadow-[0_12px_30px_rgba(0,0,0,0.24)]"><FaSave /> Enregistrer mon contact</a>
                <a href={contact} target={profile.whatsapp ? "_blank" : undefined} rel={profile.whatsapp ? "noopener noreferrer" : undefined} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-white px-5 py-4 text-sm font-extrabold text-aodi-violet-950 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"><FaEnvelope /> Me contacter</a>
              </div>
            </div>

            <div className="relative min-h-[390px] md:min-h-[620px]">
              {heroPhoto ? <img src={heroPhoto} alt={profile.displayName} className={`absolute inset-x-0 bottom-0 mx-auto h-full w-full object-contain ${positionClass(profile.heroImagePosition)} drop-shadow-[0_28px_44px_rgba(0,0,0,0.45)] md:object-cover`} /> : <div className="absolute inset-x-4 bottom-8 flex h-[340px] items-center justify-center rounded-lg border border-aodi-gold/40 bg-black/25 font-display text-7xl text-aodi-gold-light">{initials(profile)}</div>}
              <div className="absolute bottom-7 right-0 hidden w-[220px] md:block"><StatsPanel profile={profile} /></div>
            </div>
          </div>
        </div>
      </header>

      <StatsStrip profile={profile} />

      {profile.bio ? <section className="relative z-10 mt-4 px-4 sm:px-7"><div className="grid gap-4 rounded-lg border border-white/50 bg-white/70 p-5 text-aodi-violet-950 shadow-[0_18px_42px_rgba(24,18,10,0.16)] backdrop-blur md:grid-cols-[1fr_auto] md:items-center"><p className="font-display text-xl font-semibold italic leading-relaxed">{profile.bio.split("\n")[0]}</p><a href="#apropos" className="inline-flex items-center justify-center gap-3 rounded-full bg-aodi-gold px-5 py-3 text-sm font-extrabold text-aodi-violet-950">Decouvrir mon parcours <FaArrowRight /></a></div></section> : null}

      <div className="mt-6 space-y-7">
        <ProfileUtilityCards displayName={profile.displayName} slug={profile.slug} publicUrl={publicUrl} appointmentUrl={profile.appointmentUrl} />
        <ProfileContentSections slug={profile.slug} bio={profile.bio} products={profile.products} services={profile.services} projects={profile.projects} galleryItems={profile.galleryItems} customLinks={profile.customLinks} musicTracks={profile.musicTracks} events={profile.events} sections={profile.sections} profileType={profile.profileType} />
        {finalCtaHref ? <section className="relative overflow-hidden bg-aodi-violet-950 px-5 py-10 text-white sm:px-9"><div className="absolute inset-0 public-bogolan-cover opacity-25" /><div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><p className="font-display text-3xl font-semibold italic leading-tight text-aodi-cream">{profile.tagline || heroCopy || "Votre identite, sans limites."}</p><a href={finalCtaHref} target={finalCtaHref.startsWith("http") ? "_blank" : undefined} rel={finalCtaHref.startsWith("http") ? "noopener noreferrer" : undefined} className="inline-flex items-center justify-center gap-3 rounded-full bg-aodi-gold px-6 py-4 text-sm font-extrabold text-aodi-violet-950">{finalCtaLabel} <FaArrowRight /></a></div></section> : null}
      </div>

      <BottomNav profile={profile} />
    </article>
  );
}