import { AodiOfficialLogo } from "@/components/brand/AodiOfficialLogo";
import { PrimaryActions } from "@/components/profile/PrimaryActions";
import { ProfileContentSections } from "@/components/profile/ProfileContentSections";
import { ProfileUtilityCards } from "@/components/profile/ProfileUtilityCards";
import { SocialLinks } from "@/components/profile/SocialLinks";
import { getProfilePublicUrl } from "@/lib/public-url";
import { getWhatsAppHref } from "@/lib/social";
import type { PublicProfile } from "@/types/profile";
import { FaHandshake, FaWhatsapp } from "react-icons/fa";

function initials(profile: PublicProfile): string {
  const first = profile.firstName.trim().charAt(0);
  const last = profile.lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || profile.displayName.charAt(0).toUpperCase();
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.7 10.7 15.3 6.3M8.7 13.3l6.6 4.4" />
    </svg>
  );
}

function DotsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="6" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="18" cy="12" r="1.8" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3.5 11.2 12 4l8.5 7.2" />
      <path d="M5.5 10.5V20h5v-5.6h3V20h5v-9.5" />
    </svg>
  );
}

function QrIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
      <path d="M14 14h2v2h-2zM18 14h2v6h-4v-2h2zM14 18h2v2h-2z" />
    </svg>
  );
}

function MailNavIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="m5 8 7 5 7-5" />
    </svg>
  );
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

export function ProfileCard({ profile }: { profile: PublicProfile }) {
  const publicUrl = getProfilePublicUrl(profile.slug);
  const qrHref = `/api/qr/${profile.slug}/svg`;
  const contactHref = profile.whatsapp ? getWhatsAppHref(profile.whatsapp) : profile.email ? `mailto:${profile.email}` : profile.phone ? `tel:${profile.phone}` : "#contact";
  const shortBio = profile.bio?.split(/[.!?]/)[0]?.trim();

  return (
    <article className="relative mx-auto min-h-dvh w-full max-w-[560px] overflow-hidden bg-[#FDFBF7] pb-28 shadow-card md:min-h-0 md:rounded-[2rem]">
      <header className="relative h-[305px] overflow-hidden bg-aodi-violet-950 text-white">
        {profile.coverPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.coverPhoto} alt="Couverture" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className={profile.coverPhoto ? "absolute inset-0 bg-aodi-violet-950/70" : "absolute inset-0 public-bogolan-cover"} />
        <div className="absolute inset-y-0 left-0 w-[58px] border-r border-aodi-gold/30 bg-[linear-gradient(180deg,rgba(201,168,76,0.30),rgba(201,168,76,0.04))] opacity-95">
          <div className="h-full w-full bg-[radial-gradient(circle_at_center,#C9A84C_1.6px,transparent_2.2px)] [background-size:15px_15px]" />
          <div className="absolute inset-2 border-y border-aodi-gold/35" />
        </div>
        <div className="absolute right-8 top-7 flex gap-4">
          <a href={publicUrl} aria-label="Partager" className="flex h-14 w-14 items-center justify-center rounded-full border border-aodi-gold text-aodi-gold">
            <ShareIcon className="h-6 w-6" />
          </a>
          <a href={qrHref} aria-label="QR Code" className="flex h-14 w-14 items-center justify-center rounded-full border border-aodi-gold text-aodi-gold">
            <DotsIcon className="h-6 w-6" />
          </a>
        </div>
        <div className="relative z-10 flex h-full flex-col justify-start pl-[82px] pr-32 pt-6">
          <AodiOfficialLogo className="w-[145px] max-w-[42vw] min-[430px]:w-[155px]" />
        </div>
      </header>

      <section className="relative -mt-[82px] rounded-t-[3.6rem] border-t-[5px] border-aodi-gold bg-[#FDFBF7] px-4 pt-[84px] text-center sm:px-7">
        <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-aodi-gold-light via-aodi-gold to-aodi-gold-dark p-[5px] shadow-[0_18px_42px_rgba(42,15,61,0.30)]">
          <div className="h-full w-full rounded-full bg-aodi-cream p-1">
            {profile.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.profilePhoto} alt={profile.displayName} className="h-full w-full rounded-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-aodi-violet-900 font-display text-4xl text-aodi-gold-light">{initials(profile)}</div>
            )}
          </div>
          <VerifiedBadge className="absolute -bottom-1 -right-1 h-11 w-11" />
        </div>

        <h1 className="mx-auto flex max-w-full items-center justify-center gap-3 break-words font-display text-[2.55rem] font-bold uppercase leading-tight text-aodi-violet-900">
          <span>{profile.displayName}</span>
          <VerifiedBadge className="h-8 w-8 shrink-0" />
        </h1>
        {profile.jobTitle || profile.company ? <p className="mt-3 text-xl font-semibold text-aodi-gold-dark">{[profile.jobTitle, profile.company].filter(Boolean).join(" - ")}</p> : null}
        <div className="mx-auto mt-4 h-px w-28 bg-gradient-to-r from-transparent via-aodi-gold to-transparent" />
        {shortBio ? <p className="mx-auto mt-5 max-w-[420px] text-base leading-relaxed text-aodi-violet-950/85">{shortBio}.</p> : null}
      </section>

      <div className="mt-7 space-y-7">
        <PrimaryActions profile={profile} />
        <SocialLinks profile={profile} />

        <section className="px-4 sm:px-7">
          <div className="relative overflow-hidden rounded-[1.35rem] bg-aodi-violet-950 p-6 text-white shadow-[0_16px_36px_rgba(42,15,61,0.18)]">
            <div className="absolute inset-y-0 right-0 w-40 opacity-25 public-bogolan-side" />
            <div className="relative z-10 grid grid-cols-[64px_1fr] gap-3 min-[430px]:grid-cols-[64px_1fr_auto] min-[430px]:items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-aodi-gold text-aodi-gold">
                <FaHandshake className="h-8 w-8" />
              </div>
              <div>
                <h2 className="whitespace-nowrap text-lg font-extrabold uppercase leading-tight min-[430px]:text-xl">MES R&Eacute;ALISATIONS</h2>
                <p className="mt-2 text-base leading-relaxed text-aodi-cream">D&eacute;couvrez mes projets et mon univers.</p>
              </div>
              <a href={contactHref} target={profile.whatsapp ? "_blank" : undefined} rel={profile.whatsapp ? "noopener noreferrer" : undefined} className="col-span-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1rem] bg-gradient-to-r from-aodi-gold-dark via-aodi-gold to-aodi-gold-light px-5 py-3.5 text-base font-bold text-aodi-violet-950 shadow-sm min-[430px]:col-span-1">
                <FaWhatsapp className="h-6 w-6" />
                D&eacute;couvrir
              </a>
            </div>
          </div>
        </section>

        <ProfileUtilityCards displayName={profile.displayName} slug={profile.slug} publicUrl={publicUrl} />
        <ProfileContentSections products={profile.products} services={profile.services} projects={profile.projects} galleryItems={profile.galleryItems} customLinks={profile.customLinks} />


        {profile.bio ? (
          <section className="px-4 sm:px-7">
            <div className="relative min-h-36 overflow-hidden rounded-[1.35rem] border border-aodi-violet-100 bg-white p-5 text-left shadow-[0_12px_26px_rgba(42,15,61,0.10)] min-[430px]:p-6">
              <div className="absolute bottom-0 right-0 h-32 w-36 opacity-30 public-bogolan-cream" />
              <h2 className="relative text-xl font-extrabold uppercase text-aodi-violet-900">&Agrave; PROPOS DE MOI</h2>
              <span className="relative mt-3 block h-0.5 w-12 bg-aodi-gold" />
              <p className="relative mt-5 whitespace-pre-line text-base leading-relaxed text-aodi-violet-950/85">{profile.bio}</p>
            </div>
          </section>
        ) : null}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-[560px] grid-cols-3 rounded-t-[1.8rem] bg-aodi-violet-950 px-3 py-3 text-center text-sm font-semibold text-white shadow-[0_-14px_34px_rgba(42,15,61,0.22)] md:absolute">
        <a href="#" className="flex flex-col items-center gap-1 text-aodi-gold"><HomeIcon className="h-7 w-7" />Accueil</a>
        <a href={qrHref} className="flex flex-col items-center gap-1 text-aodi-cream"><QrIcon className="h-7 w-7" />QR</a>
        <a href="#contact" className="flex flex-col items-center gap-1 text-aodi-cream"><MailNavIcon className="h-7 w-7" />Contact</a>
      </nav>
    </article>
  );
}

