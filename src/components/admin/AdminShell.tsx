import { AodiLogo } from "@/components/brand/AodiLogo";
import Link from "next/link";

const primaryItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Profils", href: "/admin/profiles" },
  { label: "Nouveau profil", href: "/admin/profiles/new" },
  { label: "Commandes", href: "/admin/orders" },
  { label: "Cartes", href: "/admin/cards" },
];

const futureItems = ["Statistiques", "Parametres"];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="bogolan-page min-h-dvh text-aodi-violet-900">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-aodi-violet-100/80 bg-aodi-violet-950 px-5 py-5 text-aodi-cream lg:sticky lg:top-0 lg:h-dvh lg:w-72 lg:border-b-0 lg:border-r lg:border-aodi-gold/20 lg:px-6 lg:py-8">
          <div className="flex items-center justify-between gap-4 lg:block">
            <AodiLogo className="items-start" />
            <div className="text-right lg:mt-8 lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-aodi-gold-light">
                AODI CARD
              </p>
              <p className="mt-1 font-display text-2xl text-white">Administration</p>
            </div>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:flex-col lg:overflow-visible lg:pb-0">
            {primaryItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-aodi-cream/90 transition hover:border-aodi-gold/60 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 hidden border-t border-white/10 pt-6 lg:block">
            {futureItems.map((item) => (
              <p key={item} className="rounded-lg px-4 py-3 text-sm text-aodi-cream/35" aria-disabled="true">
                {item}
              </p>
            ))}
          </div>
        </aside>

        <section className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</section>
      </div>
    </main>
  );
}
