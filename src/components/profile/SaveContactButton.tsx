import { ContactIcon } from "@/components/icons/SocialIcons";

export function SaveContactButton({ slug }: { slug: string }) {
  return (
    <div className="px-6">
      <a
        href={`/api/vcard/${slug}`}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-aodi-gold-dark via-aodi-gold to-aodi-gold-light px-5 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-aodi-violet-950 shadow-sm transition-opacity duration-300 hover:opacity-90"
      >
        <ContactIcon className="h-4 w-4" />
        Enregistrer mon contact
      </a>
    </div>
  );
}
