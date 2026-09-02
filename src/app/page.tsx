import { AodiOfficialLogo } from "@/components/brand/AodiOfficialLogo";
import { BogolanPattern } from "@/components/brand/BogolanPattern";

export default function HomePage() {
  return (
    <main className="bogolan-page flex min-h-dvh items-center justify-center px-4 py-10">
      <section className="relative w-full max-w-[560px] overflow-hidden rounded-[2rem] bg-[#FBF8F1] px-8 py-14 text-center shadow-card">
        <div className="bogolan-header absolute inset-x-0 top-0 h-36" />
        <BogolanPattern className="pointer-events-none absolute -left-4 top-6 h-20 w-20 opacity-25" />
        <BogolanPattern className="pointer-events-none absolute -right-4 top-10 h-20 w-20 rotate-180 opacity-25" />

        <div className="relative flex justify-center">
          <AodiOfficialLogo className="w-[240px] max-w-full" />
        </div>

        <h1 className="relative mt-28 font-display text-3xl leading-tight text-aodi-violet-900">
          La carte de visite NFC, unique et &eacute;l&eacute;gante
        </h1>
        <p className="relative mx-auto mt-4 max-w-sm text-sm leading-relaxed text-aodi-violet-700/80">
          Une seule plateforme. Un profil num&eacute;rique par client. L&apos;URL de
          la carte reste stable, m&ecirc;me lorsque les informations changent.
        </p>
      </section>
    </main>
  );
}