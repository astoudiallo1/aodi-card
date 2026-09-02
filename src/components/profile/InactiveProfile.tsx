import { AodiOfficialLogo } from "@/components/brand/AodiOfficialLogo";

export function InactiveProfile() {
  return (
    <article className="relative mx-auto flex min-h-dvh w-full max-w-[560px] flex-col items-center justify-center overflow-hidden bg-[#FBF8F1] px-8 text-center md:min-h-[560px] md:rounded-[2rem] md:shadow-card">
      <AodiOfficialLogo className="mx-auto w-[240px] max-w-full" />
      <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-aodi-gold to-transparent" />
      <h1 className="mt-8 font-display text-2xl text-aodi-violet-900">
        Carte indisponible
      </h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-aodi-violet-700/80">
        Ce profil AODI Card est actuellement indisponible.
      </p>
    </article>
  );
}