import { AodiOfficialLogo } from "@/components/brand/AodiOfficialLogo";
import { PrimaryActions } from "@/components/profile/PrimaryActions";
import { ProfileContentSections } from "@/components/profile/ProfileContentSections";
import { ProfileUtilityCards } from "@/components/profile/ProfileUtilityCards";
import { SocialLinks } from "@/components/profile/SocialLinks";
import { getProfilePublicUrl } from "@/lib/public-url";
import { getWhatsAppHref } from "@/lib/social";
import type { ProfileSectionType, PublicProfile } from "@/types/profile";
import { FaCalendarAlt, FaEnvelope, FaHome, FaImages, FaLink, FaMusic, FaProjectDiagram, FaQrcode, FaSave, FaShoppingBag, FaStar, FaTools } from "react-icons/fa";

function initials(profile: PublicProfile): string {
  const first = profile.firstName.trim().charAt(0);
  const last = profile.lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || profile.displayName.charAt(0).toUpperCase();
}

function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-aodi-gold-light via-aodi-gold to-aodi-gold-dark text-white shadow-sm ${className}`} aria-label="Profil verifie">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
        <path d="m6 12 4 4 8-8" />
      </svg>
    </span>
  );
}

function contactHref(profile: PublicProfile) {
  if (profile.whatsapp) return getWhatsAppHref(profile.whatsapp);
  if (profile.email) return `mailto:${profile.email}`;
  if (profile.phone) return `tel:${profile.phone}`;
  return "#contact";
}

const navConfig: Partial<Record<ProfileSectionType, { label: string; href: string; icon: React.ReactNode }>> = {
  MUSIC: { label: "Musique", href: "#musique", icon: <FaMusic className="h-5 w-5" /> },
  EVENTS: { label: "Events", href: "#evenements", icon: <FaCalendarAlt className="h-5 w-5" /> },
  PRODUCTS: { label: "Boutique", href: "#boutique", icon: <FaShoppingBag className="h-5 w-5" /> },
  PROJECTS: { label: "Projets", href: "#projets", icon: <FaProjectDiagram className="h-5 w-5" /> },
  SERVICES: { label: "Services", href: "#services", icon: <FaTools className="h-5 w-5" /> },
  GALLERY: { label: "Galerie", href: "#galerie", icon: <FaImages className="h-5 w-5" /> },
  CUSTOM_LINKS: { label: "Liens", href: "#liens", icon: <FaLink className="h-5 w-5" /> },
  STATS: { label: "Stats", href: "#stats", icon: <FaStar className="h-5 w-5" /> },
};

function BottomNav({ profile, qrHref }: { profile: PublicProfile; qrHref: string }) {
  const moduleItems = profile.sections.map((section) => navConfig[section.type]).filter((item): item is NonNullable<typeof item> => Boolean(item)).slice(0, 3);
  const items = [
    { label: "Accueil", href: "#", icon: <FaHome className="h-5 w-5" />, active: true },
    ...moduleItems.map((item) => ({ ...item, active: false })),
    { label: "QR", href: qrHref, icon: <FaQrcode className="h-5 w-5" />, active: false },
    { label: "Contact", href: "#contact", icon: <FaEnvelope className="h-5 w-5" />, active: false },
  ].slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-[920px] rounded-t-[1.4rem] bg-aodi-violet-950 px-2 py-2 text-center text-[0.68rem] font-semibold text-white shadow-[0_-14px_34px_rgba(42,15,61,0.22)] md:absolute" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((item) => <a key={`${item.label}-${item.href}`} href={item.href} className={item.active ? "flex min-w-0 flex-col items-center gap-1 text-aodi-gold" : "flex min-w-0 flex-col items-center gap-1 text-aodi-cream"}>{item.icon}<span className="max-w-full truncate">{item.label}</span></a>)}
    </nav>
  );
}

export function ProfileCard({ profile }: { profile: PublicProfile }) {
  const publicUrl = getProfilePublicUrl(profile.slug);
  const qrHref = `/api/qr/${profile.slug}/svg`;
  const shortBio = profile.bio?.split(/[.!?]/)[0]?.trim();
  const heroPhoto = profile.coverPhoto || profile.profilePhoto;
  const contact = contactHref(profile);

  return (
    <article className="relative mx-auto min-h-dvh w-full max-w-[920px] overflow-hidden bg-[#FDFBF7] pb-28 shadow-card md:min-h-0 md:rounded-[2rem]">
      <header className="relative overflow-hidden bg-aodi-violet-950 text-white">
        <div className="absolute inset-0 public-bogolan-cover opacity-40" />
        <div className="relative grid min-h-[690px] gap-0 md:min-h-[560px] md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative z-10 flex flex-col px-5 pb-10 pt-6 sm:px-8 md:justify-between md:py-8">
            <div className="flex items-center justify-between gap-4">
              <AodiOfficialLogo className="w-[150px] max-w-[46vw]" />
              <a href={qrHref} aria-label="QR Code" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-aodi-gold text-aodi-gold"><FaQrcode /></a>
            </div>

            <div className="mt-9 md:mt-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-aodi-gold/40 bg-black/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-aodi-gold-light">AODI Card <VerifiedBadge className="h-5 w-5" /></div>
              <h1 className="mt-5 break-words font-display text-[2.8rem] font-bold uppercase leading-[0.95] text-white sm:text-[3.4rem] md:text-[4rem]">{profile.displayName}</h1>
              {profile.jobTitle || profile.company ? <p className="mt-4 max-w-[520px] text-lg font-semibold leading-relaxed text-aodi-gold-light">{[profile.jobTitle, profile.company].filter(Boolean).join(" - ")}</p> : null}
              {shortBio ? <p className="mt-5 max-w-[540px] text-base leading-relaxed text-aodi-cream/90">{shortBio}.</p> : null}
              <SocialLinks profile={profile} compact />
              <div className="mt-6 grid gap-3 min-[430px]:grid-cols-2">
                <a href={`/api/vcard/${profile.slug}`} className="inline-flex items-center justify-center gap-2 rounded-[1rem] bg-gradient-to-r from-aodi-gold-dark via-aodi-gold to-aodi-gold-light px-5 py-4 text-sm font-extrabold text-aodi-violet-950 shadow-sm"><FaSave /> Enregistrer mon contact</a>
                <a href={contact} target={profile.whatsapp ? "_blank" : undefined} rel={profile.whatsapp ? "noopener noreferrer" : undefined} className="inline-flex items-center justify-center gap-2 rounded-[1rem] border border-aodi-gold/60 bg-white/10 px-5 py-4 text-sm font-extrabold text-white backdrop-blur"><FaEnvelope /> Me contacter</a>
              </div>
            </div>
          </div>

          <div className="relative min-h-[360px] md:min-h-full">
            {heroPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroPhoto} alt={profile.displayName} className="absolute inset-0 h-full w-full object-contain object-bottom md:object-cover md:object-center" />
            ) : (
              <div className="absolute inset-6 flex items-center justify-center rounded-[2rem] border border-aodi-gold/30 bg-aodi-violet-900 font-display text-7xl text-aodi-gold-light">{initials(profile)}</div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-aodi-violet-950/75 to-transparent md:hidden" />
          </div>
        </div>
      </header>

      <div className="mt-7 space-y-8">
        <PrimaryActions profile={profile} />
        <ProfileUtilityCards displayName={profile.displayName} slug={profile.slug} publicUrl={publicUrl} />
        <ProfileContentSections slug={profile.slug} bio={profile.bio} products={profile.products} services={profile.services} projects={profile.projects} galleryItems={profile.galleryItems} customLinks={profile.customLinks} musicTracks={profile.musicTracks} events={profile.events} stats={profile.stats} sections={profile.sections} />
      </div>

      <BottomNav profile={profile} qrHref={qrHref} />
    </article>
  );
}
