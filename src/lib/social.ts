import type { PublicProfile } from "@/types/profile";

export type SocialNetworkKey =
  | "instagram"
  | "snapchat"
  | "tiktok"
  | "facebook"
  | "linkedin"
  | "website";

export type SocialNetwork = {
  key: SocialNetworkKey;
  label: string;
};

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  { key: "instagram", label: "Instagram" },
  { key: "snapchat", label: "Snapchat" },
  { key: "tiktok", label: "TikTok" },
  { key: "facebook", label: "Facebook" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "website", label: "Site web" },
];

export function getVisibleSocials(profile: PublicProfile) {
  return SOCIAL_NETWORKS.filter((network) => Boolean(profile[network.key]));
}

export function getWhatsAppHref(whatsapp: string): string {
  if (whatsapp.startsWith("http://") || whatsapp.startsWith("https://")) {
    return whatsapp;
  }

  const digits = whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}
