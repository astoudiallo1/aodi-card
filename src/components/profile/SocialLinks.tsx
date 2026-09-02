import type { PublicProfile } from "@/types/profile";
import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaSnapchatGhost, FaTiktok } from "react-icons/fa";

type SocialItem = {
  key: "instagram" | "tiktok" | "snapchat" | "facebook" | "linkedin";
  label: string;
  icon: IconType;
  className: string;
};

const SOCIALS: SocialItem[] = [
  { key: "instagram", label: "Instagram", icon: FaInstagram, className: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white" },
  { key: "tiktok", label: "TikTok", icon: FaTiktok, className: "bg-black text-white" },
  { key: "snapchat", label: "Snapchat", icon: FaSnapchatGhost, className: "bg-[#FFFC00] text-black" },
  { key: "facebook", label: "Facebook", icon: FaFacebookF, className: "bg-[#1877F2] text-white" },
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedinIn, className: "bg-[#0A66C2] text-white" },
];

export function SocialLinks({ profile }: { profile: PublicProfile }) {
  return (
    <section className="px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-gradient-to-r from-aodi-gold to-transparent" />
        <h2 className="whitespace-nowrap text-center text-[0.92rem] font-extrabold uppercase text-aodi-violet-900">Retrouvez-moi sur</h2>
        <span className="h-px flex-1 bg-gradient-to-l from-aodi-gold to-transparent" />
      </div>
      <div className="mt-5 grid grid-cols-5 justify-items-center gap-2 min-[430px]:gap-4">
        {SOCIALS.map((network) => {
          const href = profile[network.key];
          const Icon = network.icon;
          const className = "group text-center";
          const content = (
            <>
              <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full shadow-[0_12px_24px_rgba(42,15,61,0.16)] transition group-hover:-translate-y-0.5 min-[390px]:h-[52px] min-[390px]:w-[52px] min-[430px]:h-14 min-[430px]:w-14 ${network.className}`}>
                <Icon className="h-7 w-7 min-[430px]:h-8 min-[430px]:w-8" />
              </span>
              <span className="mt-2 block whitespace-nowrap text-[0.65rem] font-medium leading-tight text-aodi-violet-900 min-[430px]:text-xs">{network.label}</span>
            </>
          );

          if (!href) {
            return (
              <span key={network.key} aria-disabled="true" className={`${className} opacity-55`}>
                {content}
              </span>
            );
          }

          return (
            <a key={network.key} href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label={network.label}>
              {content}
            </a>
          );
        })}
      </div>
    </section>
  );
}