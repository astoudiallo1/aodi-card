"use client";

import { useState } from "react";
import { FaQrcode, FaShareAlt } from "react-icons/fa";

type ProfileUtilityCardsProps = {
  displayName: string;
  slug: string;
  publicUrl: string;
};

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function ProfileUtilityCards({ displayName, slug, publicUrl }: ProfileUtilityCardsProps) {
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

  const cardClass = "grid min-h-[86px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[1.1rem] border border-aodi-violet-100/70 bg-white p-4 text-left shadow-[0_12px_26px_rgba(42,15,61,0.10)] transition hover:-translate-y-0.5 hover:border-aodi-gold/60";

  return (
    <section className="grid gap-3 px-4 min-[430px]:grid-cols-2 sm:px-6">
      <button type="button" onClick={shareProfile} className={cardClass}>
        <FaShareAlt className="h-8 w-8 shrink-0 text-aodi-violet-900" />
        <span className="min-w-0 flex-1">
          <span className="block whitespace-nowrap text-[0.95rem] font-bold text-aodi-violet-900 min-[520px]:text-base">Partager mon profil</span>
          <span className="mt-1 block whitespace-nowrap text-[0.78rem] text-aodi-violet-700/80 min-[520px]:text-sm">{copied ? "Lien copie" : "Partagez ma AODI Carte"}</span>
        </span>
        <ArrowIcon className="h-6 w-6 shrink-0 text-aodi-gold" />
      </button>

      <a href={`/api/qr/${slug}/svg`} target="_blank" rel="noopener noreferrer" className={cardClass}>
        <FaQrcode className="h-8 w-8 shrink-0 text-aodi-violet-900" />
        <span className="min-w-0 flex-1">
          <span className="block whitespace-nowrap text-[0.95rem] font-bold text-aodi-violet-900 min-[520px]:text-base">Mon QR Code</span>
          <span className="mt-1 block whitespace-nowrap text-[0.78rem] text-aodi-violet-700/80 min-[520px]:text-sm">Afficher mon QR</span>
        </span>
        <ArrowIcon className="h-6 w-6 shrink-0 text-aodi-gold" />
      </a>
    </section>
  );
}