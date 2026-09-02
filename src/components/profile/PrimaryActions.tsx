"use client";

import { ContactIcon, MailIcon, PhoneIcon } from "@/components/icons/SocialIcons";
import { getWhatsAppHref } from "@/lib/social";
import type { PublicProfile } from "@/types/profile";
import type { IconType } from "react-icons";
import { FaWhatsapp } from "react-icons/fa";

type Action = {
  key: string;
  href: string | null;
  label: string;
  icon: IconType | typeof PhoneIcon;
  external?: boolean;
};

function getPrimaryActions(profile: PublicProfile): Action[] {
  return [
    { key: "phone", href: profile.phone ? `tel:${profile.phone}` : null, label: "Appeler", icon: PhoneIcon },
    { key: "whatsapp", href: profile.whatsapp ? getWhatsAppHref(profile.whatsapp) : null, label: "WhatsApp", icon: FaWhatsapp, external: true },
    { key: "email", href: profile.email ? `mailto:${profile.email}` : null, label: "E-mail", icon: MailIcon },
    { key: "save", href: `/api/vcard/${profile.slug}`, label: "Enregistrer", icon: ContactIcon },
  ];
}

export function PrimaryActions({ profile }: { profile: PublicProfile }) {
  const actions = getPrimaryActions(profile);

  return (
    <section id="contact" className="grid grid-cols-2 gap-3 px-4 min-[390px]:grid-cols-4 min-[430px]:gap-3 sm:px-6">
      {actions.map((action) => {
        const Icon = action.icon;
        const className = "group flex h-[98px] flex-col items-center justify-center rounded-[1.2rem] border border-aodi-violet-100/70 bg-white px-2 py-3 text-center shadow-[0_14px_30px_rgba(42,15,61,0.13)] transition hover:-translate-y-0.5 hover:border-aodi-gold/60 min-[390px]:h-[104px]";
        const content = (
          <>
            <Icon className="h-8 w-8 text-aodi-violet-900 min-[430px]:h-9 min-[430px]:w-9" />
            <span className="mt-3 max-w-full whitespace-nowrap text-[0.72rem] font-bold leading-tight text-aodi-violet-900 min-[430px]:text-sm">{action.label}</span>
            <span className="mt-2 h-0.5 w-10 bg-aodi-gold" />
          </>
        );

        if (!action.href) {
          return (
            <span key={action.key} aria-disabled="true" className={`${className} opacity-55`}>
              {content}
            </span>
          );
        }

        return (
          <a key={action.key} href={action.href} target={action.external ? "_blank" : undefined} rel={action.external ? "noopener noreferrer" : undefined} className={className}>
            {content}
          </a>
        );
      })}
    </section>
  );
}