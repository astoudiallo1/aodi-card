export type PublicProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  currency: string;
  imageUrl: string | null;
  whatsappNumber: string | null;
  orderUrl: string | null;
  isFeatured: boolean;
  isAvailable: boolean;
};

export type PublicService = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
};

export type PublicProject = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  websiteUrl: string | null;
  appUrl: string | null;
  githubUrl: string | null;
  technologies: string | null;
  isFeatured: boolean;
};

export type PublicGalleryItem = {
  id: string;
  title: string | null;
  imageUrl: string;
  description: string | null;
};

export type PublicCustomLink = {
  id: string;
  label: string;
  url: string;
  icon: string | null;
};

export type ProfileType =
  | "GENERAL"
  | "CORPORATE"
  | "ARCHITECTURE"
  | "COMMERCE"
  | "MUSIC"
  | "ACTOR_CREATOR"
  | "TECH"
  | "CRAFT";

export type ProfileSectionType =
  | "SOCIALS"
  | "CONTACT"
  | "SERVICES"
  | "PRODUCTS"
  | "PROJECTS"
  | "GALLERY"
  | "CUSTOM_LINKS"
  | "MUSIC"
  | "EVENTS"
  | "STATS"
  | "ABOUT"
  | "CTA";

export type PublicProfileSection = {
  id: string;
  type: ProfileSectionType;
  enabled: boolean;
  sortOrder: number;
  title: string | null;
  config: unknown;
};

export type PublicProfileStat = {
  id: string;
  label: string;
  value: string;
  icon: string | null;
};

export type PublicYouTubeVideo = {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
};

export type PublicYouTubeChannel = {
  url: string;
  title: string | null;
  handle: string | null;
};

export type PublicMusicTrack = {
  id: string;
  title: string;
  artist: string | null;
  coverUrl: string | null;
  audioUrl: string | null;
  spotifyUrl: string | null;
  appleUrl: string | null;
  youtubeUrl: string | null;
  duration: string | null;
  isFeatured: boolean;
  releaseDate: Date | null;
};

export type PublicProfileEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  externalUrl: string | null;
  imageUrl: string | null;
};

export type PublicProfile = {
  firstName: string;
  lastName: string;
  displayName: string;
  slug: string;
  jobTitle: string | null;
  company: string | null;
  bio: string | null;
  profilePhoto: string | null;
  coverPhoto: string | null;
  profileType: ProfileType;
  tagline: string | null;
  tags: string[];
  appointmentUrl: string | null;
  finalCtaLabel: string | null;
  finalCtaUrl: string | null;
  heroImagePosition: string;
  coverImagePosition: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  tiktok: string | null;
  snapchat: string | null;
  website: string | null;
  address: string | null;
  products: PublicProduct[];
  services: PublicService[];
  projects: PublicProject[];
  galleryItems: PublicGalleryItem[];
  customLinks: PublicCustomLink[];
  sections: PublicProfileSection[];
  stats: PublicProfileStat[];
  musicTracks: PublicMusicTrack[];
  youtubeVideos: PublicYouTubeVideo[];
  youtubeChannel: PublicYouTubeChannel | null;
  events: PublicProfileEvent[];
};

export type ProfileLookup =
  | { status: "found"; profile: PublicProfile }
  | { status: "inactive" }
  | { status: "missing" };