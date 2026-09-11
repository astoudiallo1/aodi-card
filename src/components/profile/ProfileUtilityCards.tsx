"use client";

import { useState } from "react";
import { FaCalendarAlt, FaDownload, FaQrcode, FaShareAlt } from "react-icons/fa";

type ProfileUtilityCardsProps = {
  displayName: string;
  slug: string;
  publicUrl: string;
  appointmentUrl: string | null;
};

export function ProfileUtilityCards({ displayName, slug, publicUrl, appointmentUrl }: ProfileUtilityCardsProps) {
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

  const cardClass = "grid min-h-[84px] grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg border border-black/5 bg-white p-4 text-left shadow-[0_12px_28px_rgba(24,18,10,0.09)] transition hover:-translate-y-0.5 hover:border-aodi-gold/60 focus:outline-none focus:ring-2 focus:ring-aodi-gold/35";
  const iconClass = "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FBF3E5] text-aodi-violet-950";

  return (
    <section id="contact" className="grid gap-3 px-4 min-[430px]:grid-cols-2 md:grid-cols-4 md:px-7">
      {appointmentUrl ? (
        <a href={appointmentUrl} target="_blank" rel="noopener noreferrer" className={cardClass}>
          <span className={iconClass}><FaCalendarAlt className="h-5 w-5" /></span>
          <span className="min-w-0"><span className="block text-sm font-extrabold text-aodi-violet-950">Prendre rendez-vous</span></span>
        </a>
      ) : (
        <span aria-disabled="true" className={`${cardClass} opacity-55`}>
          <span className={iconClass}><FaCalendarAlt className="h-5 w-5" /></span>
          <span className="min-w-0"><span className="block text-sm font-extrabold text-aodi-violet-950">Prendre rendez-vous</span></span>
        </span>
      )}

      <a href={`/api/vcard/${slug}`} className={cardClass}>
        <span className={iconClass}><FaDownload className="h-5 w-5" /></span>
        <span className="min-w-0"><span className="block text-sm font-extrabold text-aodi-violet-950">Telecharger ma carte</span></span>
      </a>

      <button type="button" onClick={shareProfile} className={cardClass}>
        <span className={iconClass}><FaShareAlt className="h-5 w-5" /></span>
        <span className="min-w-0"><span className="block text-sm font-extrabold text-aodi-violet-950">Partager mon profil</span><span className="mt-1 block text-xs text-aodi-violet-700/70">{copied ? "Lien copie" : "AODI Card"}</span></span>
      </button>

      <a href={`/api/qr/${slug}/svg`} target="_blank" rel="noopener noreferrer" className={cardClass}>
        <span className={iconClass}><FaQrcode className="h-5 w-5" /></span>
        <span className="min-w-0"><span className="block text-sm font-extrabold text-aodi-violet-950">Mon QR Code</span></span>
      </a>
    </section>
  );
}