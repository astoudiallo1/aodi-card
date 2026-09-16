import type { ProfileSectionType, ProfileType, PublicProfile } from "@/types/profile";

/**
 * Navigation publique commune a tous les profils : ancre et libelle court de chaque section.
 * Le libelle varie selon l'experience (Projets / Realisations...), jamais selon le metier libre.
 * Utilise par le menu mobile et la barre basse : aucune navigation n'est codee en dur par type.
 */

type NavEntry = { href: string; label: string; byType?: Partial<Record<ProfileType, string>> };

const SECTION_NAV: Partial<Record<ProfileSectionType, NavEntry>> = {
  MUSIC: { href: "#musique", label: "Musique" },
  VIDEOS: { href: "#videos", label: "Videos", byType: { TECH: "Demos", ACTOR_CREATOR: "Creations" } },
  ARTISTS: { href: "#artistes", label: "Artistes" },
  EVENTS: { href: "#evenements", label: "Actualites", byType: { MUSIC: "Events", ACTOR_CREATOR: "Events", COMMERCE: "Promotions" } },
  SERVICES: { href: "#services", label: "Services" },
  PROJECTS: { href: "#projets", label: "Projets", byType: { ARCHITECTURE: "Realisations", CRAFT: "Realisations", ACTOR_CREATOR: "Realisations" } },
  PRODUCTS: { href: "#boutique", label: "Boutique" },
  GALLERY: { href: "#galerie", label: "Galerie" },
  CUSTOM_LINKS: { href: "#liens", label: "Liens" },
  ABOUT: { href: "#apropos", label: "A propos" },
};

export type PublicSectionNavItem = { type: ProfileSectionType; href: string; label: string };

export function publicSectionNavItem(type: ProfileSectionType, profileType: ProfileType): PublicSectionNavItem | null {
  const entry = SECTION_NAV[type];
  if (!entry) return null;
  return { type, href: entry.href, label: entry.byType?.[profileType] ?? entry.label };
}

/**
 * Sections navigables du profil, dans l'ordre d'affichage de la page publique.
 * `profile.sections` ne contient deja que les sections activees et qui ont du contenu.
 */
export function publicSectionNavItems(profile: PublicProfile): PublicSectionNavItem[] {
  const items: PublicSectionNavItem[] = [];
  for (const section of profile.sections) {
    const item = publicSectionNavItem(section.type, profile.profileType);
    if (item && !items.some((existing) => existing.href === item.href)) items.push(item);
  }
  return items;
}

export function hasContactActions(profile: PublicProfile) {
  return Boolean(profile.appointmentUrl || profile.whatsapp || profile.email || profile.phone);
}
