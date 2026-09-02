"use client";

import { useState } from "react";

type QrCodePanelProps = {
  displayName: string;
  slug: string;
  publicUrl: string;
  photo?: string | null;
};

export function QrCodePanel({ displayName, slug, publicUrl, photo }: QrCodePanelProps) {
  const [copied, setCopied] = useState(false);
  const pngUrl = `/api/qr/${slug}/png`;
  const svgUrl = `/api/qr/${slug}/svg`;

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="rounded-lg border border-aodi-gold/35 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aodi-gold-dark">QR Code AODI Card</p>
      <div className="mt-5 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
        <div className="rounded-lg border border-aodi-violet-100 bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={svgUrl} alt={`QR Code ${displayName}`} className="aspect-square w-full object-contain" />
        </div>
        <div>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-aodi-gold/50 bg-aodi-violet-900">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-xl text-aodi-gold-light">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold text-aodi-violet-900">{displayName}</h2>
              <p className="mt-1 text-sm font-semibold text-aodi-violet-700">/{slug}</p>
            </div>
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-aodi-violet-700/60">URL publique</p>
          <p className="mt-2 break-all text-sm font-semibold text-aodi-violet-900">{publicUrl}</p>
          <p className="mt-4 text-sm leading-relaxed text-aodi-violet-700/75">
            Ce QR Code contient uniquement l&apos;URL publique stable du profil. Il ne contient aucune donnee personnelle.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={pngUrl} download={`aodi-card-${slug}-qr.png`} className="rounded-lg bg-aodi-violet-900 px-4 py-3 text-sm font-semibold text-white hover:bg-aodi-violet-800">Telecharger PNG</a>
            <a href={svgUrl} download={`aodi-card-${slug}-qr.svg`} className="rounded-lg border border-aodi-violet-200 bg-white px-4 py-3 text-sm font-semibold text-aodi-violet-900 hover:border-aodi-gold">SVG</a>
            <button type="button" onClick={copyLink} className="rounded-lg border border-aodi-violet-200 bg-white px-4 py-3 text-sm font-semibold text-aodi-violet-900 hover:border-aodi-gold">{copied ? "Lien copie" : "Copier le lien"}</button>
            <a href={`/${slug}`} className="rounded-lg border border-aodi-violet-200 bg-white px-4 py-3 text-sm font-semibold text-aodi-violet-900 hover:border-aodi-gold">Tester le QR Code</a>
          </div>
          <p className="mt-5 text-center font-display text-xl font-semibold text-aodi-violet-900 lg:text-left">{displayName}</p>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-aodi-gold-dark lg:text-left">AODI Card</p>
        </div>
      </div>
    </section>
  );
}
