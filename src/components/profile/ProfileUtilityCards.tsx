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

export function ProfileUtilityCards({ displayName, slug, publicUrl, appointmentUrl, profileType }: ProfileUtilityCardsProps) {
  const [copied, setCopied] = useState(false);

  async function shareProfile() {
    if (navigator.share) {
      await navigator.share({ title: displayName, text: `AODI Card - ${displayName}`, url: publicUrl });
      return;
    }

    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const isMusic = profileType === "MUSIC";
  const cardClass = isMusic ? "grid min-h-[74px] grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-lg border border-aodi-gold/20 bg-[#121017] p-3 text-left text-aodi-cream shadow-[0_12px_24px_rgba(9,7,17,0.16)] transition hover:-translate-y-0.5 hover:border-aodi-gold/60 focus:outline-none focus:ring-2 focus:ring-aodi-gold/35 md:min-h-[84px] md:gap-3 md:bg-white md:p-4 md:text-aodi-violet-950" : "grid min-h-[84px] grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg border border-black/5 bg-white p-4 text-left shadow-[0_12px_28px_rgba(24,18,10,0.09)] transition hover:-translate-y-0.5 hover:border-aodi-gold/60 focus:outline-none focus:ring-2 focus:ring-aodi-gold/35";
  const iconClass = isMusic ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-aodi-gold text-aodi-violet-950 md:h-11 md:w-11 md:bg-[#FBF3E5]" : "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FBF3E5] text-aodi-violet-950";

  return (
    <section id="contact" className={isMusic ? "grid grid-cols-2 gap-2 px-4 md:grid-cols-4 md:gap-3 md:px-7" : "grid gap-3 px-4 min-[430px]:grid-cols-2 md:grid-cols-4 md:px-7"}>
      {appointmentUrl ? (
        <a href={appointmentUrl} target="_blank" rel="noopener noreferrer" className={cardClass}>
          <span className={iconClass}><FaCalendarAlt className="h-5 w-5" /></span>
          <span className="min-w-0"><span className={isMusic ? "block text-xs font-extrabold leading-tight text-aodi-cream md:text-sm md:text-aodi-violet-950" : "block text-sm font-extrabold text-aodi-violet-950"}>Rendez-vous</span></span>
        </a>
      ) : (
        <span aria-disabled="true" className={`${cardClass} opacity-55`}>
          <span className={iconClass}><FaCalendarAlt className="h-5 w-5" /></span>
          <span className="min-w-0"><span className={isMusic ? "block text-xs font-extrabold leading-tight text-aodi-cream md:text-sm md:text-aodi-violet-950" : "block text-sm font-extrabold text-aodi-violet-950"}>Rendez-vous</span></span>
        </span>
      )}

      <a href={`/api/vcard/${slug}`} className={cardClass}>
        <span className={iconClass}><FaDownload className="h-5 w-5" /></span>
        <span className="min-w-0"><span className={isMusic ? "block text-xs font-extrabold leading-tight text-aodi-cream md:text-sm md:text-aodi-violet-950" : "block text-sm font-extrabold text-aodi-violet-950"}>Telecharger</span></span>
      </a>

      <button type="button" onClick={shareProfile} className={cardClass}>
        <span className={iconClass}><FaShareAlt className="h-5 w-5" /></span>
        <span className="min-w-0"><span className={isMusic ? "block text-xs font-extrabold leading-tight text-aodi-cream md:text-sm md:text-aodi-violet-950" : "block text-sm font-extrabold text-aodi-violet-950"}>Partager</span>{copied ? <span className={isMusic ? "mt-1 block text-[0.68rem] text-aodi-gold md:text-xs md:text-aodi-violet-700/70" : "mt-1 block text-xs text-aodi-violet-700/70"}>Lien copie</span> : null}</span>
      </button>

      <a href={`/api/qr/${slug}/svg`} target="_blank" rel="noopener noreferrer" className={cardClass}>
        <span className={iconClass}><FaQrcode className="h-5 w-5" /></span>
        <span className="min-w-0"><span className={isMusic ? "block text-xs font-extrabold leading-tight text-aodi-cream md:text-sm md:text-aodi-violet-950" : "block text-sm font-extrabold text-aodi-violet-950"}>QR Code</span></span>
      </a>
    </section>
  );
}
