import { getWhatsAppHref } from "@/lib/social";
import type { PublicProfile } from "@/types/profile";
import type { IconType } from "react-icons";
import { FaEnvelope, FaFacebookF, FaGlobe, FaInstagram, FaLinkedinIn, FaSnapchatGhost, FaTiktok, FaWhatsapp } from "react-icons/fa";

type SocialItem = {
  key: "whatsapp" | "instagram" | "tiktok" | "snapchat" | "facebook" | "linkedin" | "website" | "email";
  label: string;
  icon: IconType;
  className: string;
  href: (profile: PublicProfile) => string | null;
};

const SOCIALS: SocialItem[] = [
  { key: "whatsapp", label: "WhatsApp", icon: FaWhatsapp, className: "bg-[#25D366] text-white", href: (profile) => profile.whatsapp ? getWhatsAppHref(profile.whatsapp) : null },
  { key: "instagram", label: "Instagram", icon: FaInstagram, className: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white", href: (profile) => profile.instagram },
  { key: "tiktok", label: "TikTok", icon: FaTiktok, className: "bg-black text-white", href: (profile) => profile.tiktok },
  { key: "snapchat", label: "Snapchat", icon: FaSnapchatGhost, className: "bg-[#FFFC00] text-black", href: (profile) => profile.snapchat },
  { key: "facebook", label: "Facebook", icon: FaFacebookF, className: "bg-[#1877F2] text-white", href: (profile) => profile.facebook },
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedinIn, className: "bg-[#0A66C2] text-white", href: (profile) => profile.linkedin },
  { key: "website", label: "Site web", icon: FaGlobe, className: "bg-aodi-violet-950 text-aodi-gold", href: (profile) => profile.website },
  { key: "email", label: "Email", icon: FaEnvelope, className: "bg-aodi-gold text-aodi-violet-950", href: (profile) => profile.email ? `mailto:${profile.email}` : null },
];

export function SocialLinks({ profile, compact = false }: { profile: PublicProfile; compact?: boolean }) {
  const visibleSocials = SOCIALS.map((network) => ({ ...network, url: network.href(profile) })).filter((network) => Boolean(network.url));
  if (visibleSocials.length === 0) return null;

  return (
    <section className={compact ? "" : "px-4 sm:px-6"}>
      {!compact ? <div className="flex items-center gap-4"><span className="h-px flex-1 bg-gradient-to-r from-aodi-gold to-transparent" /><h2 className="whitespace-nowrap text-center text-[0.92rem] font-extrabold uppercase text-aodi-violet-900">Retrouvez-moi sur</h2><span className="h-px flex-1 bg-gradient-to-l from-aodi-gold to-transparent" /></div> : null}
      <div className={compact ? "mt-5 flex flex-wrap justify-center gap-3 md:justify-start" : "mt-5 flex flex-wrap justify-center gap-3"}>
        {visibleSocials.map((network) => {
          const Icon = network.icon;
          return (
            <a key={network.key} href={network.url || "#"} target={network.key === "email" ? undefined : "_blank"} rel={network.key === "email" ? undefined : "noopener noreferrer"} className="group text-center" aria-label={network.label}>
              <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full shadow-[0_12px_24px_rgba(42,15,61,0.16)] transition group-hover:-translate-y-0.5 min-[430px]:h-14 min-[430px]:w-14 ${network.className}`}>
                <Icon className="h-6 w-6 min-[430px]:h-7 min-[430px]:w-7" />
              </span>
              {!compact ? <span className="mt-2 block whitespace-nowrap text-[0.65rem] font-medium leading-tight text-aodi-violet-900 min-[430px]:text-xs">{network.label}</span> : null}
            </a>
          );
        })}
      </div>
    </section>
  );
}
