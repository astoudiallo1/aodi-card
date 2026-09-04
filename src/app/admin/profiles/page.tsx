import { AdminHeader } from "@/components/admin/AdminHeader";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { toggleProfileStatusAction } from "./actions";

export const dynamic = "force-dynamic";

type ProfilesPageProps = {
  searchParams: Promise<{ q?: string }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function initials(displayName: string) {
  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export default async function AdminProfilesPage({ searchParams }: ProfilesPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const profiles = await prisma.profile.findMany({
    where: query
      ? {
          OR: [
            { displayName: { contains: query, mode: "insensitive" } },
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminHeader
        title="Profils clients"
        description="Tous les profils crees dans PostgreSQL pour les cartes NFC AODI Card."
        action={{ href: "/admin/profiles/new", label: "Nouveau profil" }}
      />

      <form className="mt-8 rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-4 shadow-sm" action="/admin/profiles">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-aodi-violet-700/70">
            Recherche
          </span>
          <input
            name="q"
            defaultValue={query}
            placeholder="Nom, entreprise ou slug"
            className="mt-2 w-full rounded-lg border border-aodi-violet-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-aodi-gold focus:ring-2 focus:ring-aodi-gold/20"
          />
        </label>
      </form>

      <section className="mt-5 overflow-hidden rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 shadow-sm">
        <div className="hidden grid-cols-[80px_1.3fr_1fr_1fr_1fr_1fr_1.5fr] gap-4 border-b border-aodi-violet-100 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-aodi-violet-700/60 xl:grid">
          <span>Photo</span>
          <span>Nom</span>
          <span>Fonction</span>
          <span>Entreprise</span>
          <span>Slug</span>
          <span>Statut</span>
          <span>Actions</span>
        </div>

        <div className="divide-y divide-aodi-violet-100">
          {profiles.length > 0 ? (
            profiles.map((profile) => (
              <article key={profile.id} className="grid gap-4 px-5 py-5 xl:grid-cols-[80px_1.3fr_1fr_1fr_1fr_1fr_1.5fr] xl:items-center">
                <div className="flex items-center gap-4 xl:block">
                  <div className="h-14 w-14 overflow-hidden rounded-full border border-aodi-gold/50 bg-aodi-violet-900">
                    {profile.profilePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.profilePhoto} alt={profile.displayName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-lg text-aodi-gold-light">
                        {initials(profile.displayName)}
                      </div>
                    )}
                  </div>
                  <div className="xl:hidden">
                    <p className="font-semibold text-aodi-violet-900">{profile.displayName}</p>
                    <p className="text-sm text-aodi-violet-700/70">/{profile.slug}</p>
                  </div>
                </div>

                <div className="hidden xl:block">
                  <p className="font-semibold text-aodi-violet-900">{profile.displayName}</p>
                  <p className="mt-1 text-xs text-aodi-violet-700/60">Cree le {formatDate(profile.createdAt)}</p>
                </div>
                <p className="text-sm text-aodi-violet-800">{profile.jobTitle || "-"}</p>
                <p className="text-sm text-aodi-violet-800">{profile.company || "-"}</p>
                <p className="text-sm font-semibold text-aodi-violet-700">/{profile.slug}</p>
                <span className={profile.isActive ? "w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700" : "w-fit rounded-full bg-aodi-violet-100 px-3 py-1 text-xs font-semibold text-aodi-violet-700"}>
                  {profile.isActive ? "Actif" : "Desactive"}
                </span>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/${profile.slug}`} className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold text-aodi-violet-900 hover:border-aodi-gold">
                    Voir le profil
                  </Link>
                  <Link href={`/admin/profiles/${profile.id}/edit`} className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold text-aodi-violet-900 hover:border-aodi-gold">
                    Modifier
                  </Link>
                  <Link href={`/admin/profiles/${profile.id}/products`} className="rounded-lg border border-aodi-gold/60 bg-aodi-gold/10 px-3 py-2 text-xs font-semibold text-aodi-violet-900 hover:bg-aodi-gold/20">
                    Contenus
                  </Link>
                  <Link href={`/admin/profiles/${profile.id}/card`} className="rounded-lg border border-aodi-gold/60 bg-aodi-gold/10 px-3 py-2 text-xs font-semibold text-aodi-violet-900 hover:bg-aodi-gold/20">
                    Configurer la carte
                  </Link>
                  <form action={toggleProfileStatusAction.bind(null, profile.id)}>
                    <button className="rounded-lg bg-aodi-violet-900 px-3 py-2 text-xs font-semibold text-white hover:bg-aodi-violet-800" type="submit">
                      {profile.isActive ? "Desactiver" : "Activer"}
                    </button>
                  </form>
                </div>
                <p className="text-xs text-aodi-violet-700/60 xl:hidden">Cree le {formatDate(profile.createdAt)}</p>
              </article>
            ))
          ) : (
            <p className="px-5 py-10 text-sm text-aodi-violet-700/70">Aucun profil trouve.</p>
          )}
        </div>
      </section>
    </div>
  );
}



