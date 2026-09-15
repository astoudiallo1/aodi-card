"use client";

import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export type ProfileMobileMenuItem = {
  href: string;
  label: string;
};

// Un seul menu par page : identifiant fixe, identique cote serveur et cote client (pas de useId).
const MENU_ID = "profile-mobile-menu";

/**
 * Menu hamburger commun a tous les profils. Les entrees sont calculees a partir des sections reellement
 * presentes sur la page (voir `publicSectionNavItems`), jamais codees en dur par type d'experience.
 */
export function ProfileMobileMenu({ items }: { items: ProfileMobileMenuItem[] }) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls={MENU_ID}
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur focus:outline-none focus:ring-2 focus:ring-aodi-gold/50"
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {open ? <button type="button" aria-label="Fermer le menu" onClick={close} className="fixed inset-0 z-40 cursor-default bg-black/25 md:absolute" /> : null}

      {open ? (
        <div id={MENU_ID} role="menu" className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-lg border border-aodi-gold/25 bg-aodi-violet-950/95 p-2 text-aodi-cream shadow-[0_18px_44px_rgba(0,0,0,0.32)] backdrop-blur">
          {items.map((item) => (
            <a key={`${item.href}-${item.label}`} role="menuitem" href={item.href} onClick={close} className="block rounded-md px-3 py-3 text-sm font-bold transition hover:bg-aodi-gold hover:text-aodi-violet-950 focus:bg-aodi-gold focus:text-aodi-violet-950 focus:outline-none">
              {item.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
