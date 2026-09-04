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
};

export type ProfileLookup =
  | { status: "found"; profile: PublicProfile }
  | { status: "inactive" }
  | { status: "missing" };