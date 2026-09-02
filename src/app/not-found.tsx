import { AodiOfficialLogo } from "@/components/brand/AodiOfficialLogo";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bogolan-page flex min-h-dvh items-center justify-center px-4 py-10">
      <section className="w-full max-w-[560px] rounded-[2rem] bg-[#FBF8F1] px-8 py-16 text-center shadow-card">
        <AodiOfficialLogo className="mx-auto w-[240px] max-w-full" />
        <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-aodi-gold to-transparent" />
        <h1 className="mt-8 font-display text-2xl text-aodi-violet-900">
          Profil introuvable
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-aodi-violet-700/80">
          Cette carte AODI n&apos;existe pas ou l&apos;adresse est incorrecte.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-aodi-gold-dark"
        >
          Retour &agrave; l&apos;accueil
        </Link>
      </section>
    </main>
  );
}