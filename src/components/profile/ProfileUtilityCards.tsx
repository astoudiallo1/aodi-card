"use client";

import { useState } from "react";
import type { ProfileType } from "@/types/profile";
import { FaCalendarAlt, FaDownload, FaQrcode, FaShareAlt } from "react-icons/fa";

type ProfileUtilityCardsProps = {
  displayName: string;
  slug: string;
  publicUrl: string;
  appointmentUrl: string | null;
  profileType?: ProfileType;
};

/**
 * Socle commun : les quatre actions (RDV, Telecharger, Partager, QR) tiennent sur une seule ligne sur mobile,
 * quel que soit le type d'experience, et redeviennent des cartes larges sur desktop.
 * Seule la teinte des cartes mobiles varie selon l'univers du type.
 */
const MOBILE_TONE: Record<ProfileType, "dark" | "light"> = {
  GENERAL: "light",
  CORPORATE: "light",
  ARCHITECTURE: "light",
  COMMERCE: "light",
  MUSIC: "dark",
  ACTOR_CREATOR: "dark",
  TECH: "light",
  CRAFT: "light",
};

const CARD_LAYOUT = "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-center shadow-[0_10px_20px_rgba(24,18,10,0.10)] transition hover:-translate-y-0.5 hover:border-aodi-gold/60 focus:outline-none focus:ring-2 focus:ring-aodi-gold/35 md:grid md:min-h-[84px] md:grid-cols-[auto_minmax(0,1fr)] md:gap-3 md:border-black/5 md:bg-white md:p-4 md:text-left md:text-aodi-violet-950";
const ICON_LAYOUT = "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[0.72rem] md:h-11 md:w-11 md:rounded-lg md:bg-[#FBF3E5] md:text-base md:text-aodi-violet-950";
const LABEL_LAYOUT = "block max-w-full truncate text-[0.62rem] font-extrabold leading-tight md:text-sm md:text-aodi-violet-950";

const TONES = {
  dark: {
    card: `${CARD_LAYOUT} border-aodi-gold/20 bg-[#121017] text-aodi-cream`,
    icon: `${ICON_LAYOUT} bg-aodi-gold text-aodi-violet-950`,
    label: `${LABEL_LAYOUT} text-aodi-cream`,
    hint: "mt-1 block text-[0.68rem] text-aodi-gold md:text-xs md:text-aodi-violet-700/70",
  },
  light: {
    card: `${CARD_LAYOUT} border-black/5 bg-white text-aodi-violet-950`,
    icon: `${ICON_LAYOUT} bg-[#FBF3E5] text-aodi-violet-950`,
    label: `${LABEL_LAYOUT} text-aodi-violet-950`,
    hint: "mt-1 block text-[0.68rem] text-aodi-gold-dark md:text-xs md:text-aodi-violet-700/70",
  },
};

export function ProfileUtilityCards({ displayName, slug, publicUrl, appointmentUrl, profileType = "GENERAL" }: ProfileUtilityCardsProps) {
  const [copied, setCopied] = useState(false);
  const tone = TONES[MOBILE_TONE[profileType]];

  async function shareProfile() {
    if (navigator.share) {
      await navigator.share({ title: displayName, text: `AODI Card - ${displayName}`, url: publicUrl });
      return;
    }

    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section id="contact" className="grid grid-cols-4 gap-1.5 px-3 scroll-mt-24 min-[430px]:gap-2 min-[430px]:px-4 md:gap-3 md:px-7">
      {appointmentUrl ? (
        <a href={appointmentUrl} target="_blank" rel="noopener noreferrer" className={tone.card}>
          <span className={tone.icon}><FaCalendarAlt className="h-5 w-5" /></span>
          <span className="min-w-0"><span className={tone.label}>RDV</span></span>
        </a>
      ) : (
        <span aria-disabled="true" className={`${tone.card} opacity-55`}>
          <span className={tone.icon}><FaCalendarAlt className="h-5 w-5" /></span>
          <span className="min-w-0"><span className={tone.label}>RDV</span></span>
        </span>
      )}

      <a href={`/api/vcard/${slug}`} className={tone.card}>
        <span className={tone.icon}><FaDownload className="h-5 w-5" /></span>
        <span className="min-w-0"><span className={tone.label}>Telecharger</span></span>
      </a>

      <button type="button" onClick={shareProfile} className={tone.card}>
        <span className={tone.icon}><FaShareAlt className="h-5 w-5" /></span>
        <span className="min-w-0"><span className={tone.label}>Partager</span>{copied ? <span className={tone.hint}>Lien copie</span> : null}</span>
      </button>

      <a href={`/api/qr/${slug}/svg`} target="_blank" rel="noopener noreferrer" className={tone.card}>
        <span className={tone.icon}><FaQrcode className="h-5 w-5" /></span>
        <span className="min-w-0"><span className={tone.label}>QR</span></span>
      </a>
    </section>
  );
}
