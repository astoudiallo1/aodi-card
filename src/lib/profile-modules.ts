import type { ProfileSectionType, ProfileType } from "@/types/profile";

/**
 * Registre des modules de contenu d'un profil.
 *
 * - `profileType` = experience visuelle (theme, ordre public) et modules recommandes par defaut.
 * - Les modules restent activables un a un depuis Configuration, quel que soit le type.
 * - Le metier libre (`jobTitle`) n'intervient jamais dans la selection des modules.
 *
 * Fichier sans dependance serveur : importable par les composants client comme serveur.
 */

export type ProfileModuleKey = "products" | "services" | "projects" | "gallery" | "music" | "videos" | "artists" | "events" | "stats";

export type AdminProfileNavKey = "overview" | "informations" | "configuration" | "links" | ProfileModuleKey;

export type ProfileModule = {
  key: ProfileModuleKey;
  sectionType: ProfileSectionType;
  routeSuffix: `/${string}`;
  label: string;
  labels?: Partial<Record<ProfileType, string>>;
};

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  GENERAL: "General",
  CORPORATE: "Corporate",
  ARCHITECTURE: "Architecture",
  COMMERCE: "Commerce",
  MUSIC: "Musique",
  ACTOR_CREATOR: "Artiste / Createur",
  TECH: "Tech",
  CRAFT: "Artisan / Metier",
};

export const PROFILE_MODULES: ProfileModule[] = [
  { key: "products", sectionType: "PRODUCTS", routeSuffix: "/products", label: "Boutique" },
  { key: "services", sectionType: "SERVICES", routeSuffix: "/services", label: "Services" },
  { key: "projects", sectionType: "PROJECTS", routeSuffix: "/projects", label: "Projets", labels: { ARCHITECTURE: "Realisations", CRAFT: "Realisations", ACTOR_CREATOR: "Realisations" } },
  { key: "gallery", sectionType: "GALLERY", routeSuffix: "/gallery", label: "Galerie" },
  { key: "music", sectionType: "MUSIC", routeSuffix: "/music", label: "Musique" },
  { key: "videos", sectionType: "VIDEOS", routeSuffix: "/videos", label: "Videos", labels: { CRAFT: "Videos de realisations", ARCHITECTURE: "Videos de realisations", TECH: "Videos / Demonstrations", ACTOR_CREATOR: "Videos / Creations" } },
  { key: "artists", sectionType: "ARTISTS", routeSuffix: "/artists", label: "Artistes accompagnes" },
  { key: "events", sectionType: "EVENTS", routeSuffix: "/events", label: "Evenements" },
  { key: "stats", sectionType: "STATS", routeSuffix: "/stats", label: "Statistiques" },
];

// Modules recommandes par experience, dans l'ordre d'affichage de la navigation admin.
// "videos" est propose la ou la video sert le metier ; "artists" n'est recommande nulle part :
// il apparait des qu'il est active dans Configuration ou qu'il contient des artistes.
export const RECOMMENDED_MODULES: Record<ProfileType, ProfileModuleKey[]> = {
  GENERAL: ["services", "projects", "gallery", "stats"],
  CORPORATE: ["services", "projects", "videos", "gallery", "stats"],
  ARCHITECTURE: ["services", "projects", "videos", "gallery", "stats"],
  COMMERCE: ["products", "gallery", "stats"],
  MUSIC: ["music", "events", "gallery", "stats"],
  ACTOR_CREATOR: ["projects", "videos", "events", "gallery", "stats"],
  TECH: ["services", "projects", "videos", "gallery", "stats"],
  CRAFT: ["services", "projects", "videos", "gallery", "stats"],
};

export type ProfileModuleUsage = Record<ProfileModuleKey, number>;

export type ProfileSectionState = {
  type: ProfileSectionType;
  enabled: boolean;
  sortOrder: number;
  title: string | null;
};

export type ProfileModuleContext = {
  profileType: ProfileType;
  usage: ProfileModuleUsage;
  sections: ProfileSectionState[];
  /** Valeurs reellement presentes dans l'enum PostgreSQL : un module dont la section n'existe pas encore en base est masque. */
  availableSectionTypes: Set<ProfileSectionType>;
};

/** Pourquoi un module est propose dans la navigation admin. */
export type ProfileModuleReason = "recommended" | "enabled" | "used" | "current";

export type ResolvedProfileModule = {
  module: ProfileModule;
  label: string;
  reason: ProfileModuleReason;
};

export function emptyProfileModuleUsage(): ProfileModuleUsage {
  return { products: 0, services: 0, projects: 0, gallery: 0, music: 0, videos: 0, artists: 0, events: 0, stats: 0 };
}

export const ALL_SECTION_TYPES: ProfileSectionType[] = ["SOCIALS", "CONTACT", "SERVICES", "PRODUCTS", "PROJECTS", "GALLERY", "CUSTOM_LINKS", "MUSIC", "EVENTS", "STATS", "ABOUT", "CTA", "VIDEOS", "ARTISTS"];

export function isModuleAvailable(module: ProfileModule, context: ProfileModuleContext) {
  return context.availableSectionTypes.has(module.sectionType);
}

export function getProfileModule(key: ProfileModuleKey): ProfileModule {
  const found = PROFILE_MODULES.find((candidate) => candidate.key === key);
  if (!found) throw new Error(`Module de profil inconnu : ${key}`);
  return found;
}

export function getProfileModuleBySection(sectionType: ProfileSectionType): ProfileModule | null {
  return PROFILE_MODULES.find((candidate) => candidate.sectionType === sectionType) ?? null;
}

export function moduleLabel(module: ProfileModule, profileType: ProfileType) {
  return module.labels?.[profileType] ?? module.label;
}

export function isModuleRecommended(key: ProfileModuleKey, profileType: ProfileType) {
  return RECOMMENDED_MODULES[profileType].includes(key);
}

/** Active = une ligne ProfileSection existe et est cochee. Sans ligne, le module n'est ni active ni desactive. */
export function isModuleEnabled(module: ProfileModule, sections: ProfileSectionState[]) {
  return sections.some((section) => section.type === module.sectionType && section.enabled);
}

/** Desactive = une ligne ProfileSection existe et est decochee (sans ligne, la section publique suit le comportement par defaut). */
export function isModuleDisabled(module: ProfileModule, sections: ProfileSectionState[]) {
  return sections.some((section) => section.type === module.sectionType && !section.enabled);
}

export function moduleReason(module: ProfileModule, context: ProfileModuleContext): Exclude<ProfileModuleReason, "current"> | null {
  if (!isModuleAvailable(module, context)) return null;
  if (isModuleRecommended(module.key, context.profileType)) return "recommended";
  if (isModuleEnabled(module, context.sections)) return "enabled";
  if (context.usage[module.key] > 0) return "used";
  return null;
}

/**
 * Modules a afficher dans la navigation admin : les recommandes (dans l'ordre du type), puis ceux actives
 * ou contenant deja des donnees (ordre du registre). Le module en cours est toujours conserve pour que
 * la page reste reperable, meme s'il n'est ni recommande, ni active, ni utilise.
 */
export function resolveAdminModules(context: ProfileModuleContext, activeKey?: AdminProfileNavKey): ResolvedProfileModule[] {
  const recommended = RECOMMENDED_MODULES[context.profileType].map((key) => getProfileModule(key));
  const others = PROFILE_MODULES.filter((module) => !recommended.includes(module));

  return [...recommended, ...others].flatMap((module) => {
    const reason = moduleReason(module, context) ?? (module.key === activeKey && isModuleAvailable(module, context) ? "current" : null);
    if (!reason) return [];
    return [{ module, label: moduleLabel(module, context.profileType), reason }];
  });
}
