import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileContentNav } from "@/components/admin/ProfileContentNav";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateProfileSectionsAction } from "../content-actions";

type PageProps = { params: Promise<{ id: string }> };
type SectionType = "SOCIALS" | "CONTACT" | "SERVICES" | "PRODUCTS" | "PROJECTS" | "GALLERY" | "CUSTOM_LINKS" | "MUSIC" | "EVENTS" | "STATS" | "ABOUT" | "CTA";
type SectionRow = { type: SectionType; enabled: boolean; sortOrder: number; title: string | null };

const MODULES: { type: SectionType; label: string; description: string; defaultOrder: number }[] = [
  { type: "SOCIALS", label: "Reseaux", description: "Icones sociales visibles dans le hero.", defaultOrder: 10 },
  { type: "CONTACT", label: "Contact", description: "Actions rapides de contact et vCard.", defaultOrder: 20 },
  { type: "STATS", label: "Statistiques", description: "Chiffres publics configures.", defaultOrder: 30 },
  { type: "MUSIC", label: "Musique", description: "Derniere sortie ou liens d'ecoute.", defaultOrder: 40 },
  { type: "EVENTS", label: "Evenements", description: "Dates publiques generiques.", defaultOrder: 50 },
  { type: "SERVICES", label: "Services", description: "Cartes services existantes.", defaultOrder: 60 },
  { type: "PROJECTS", label: "Projets", description: "Realisations et portfolios.", defaultOrder: 70 },
  { type: "PRODUCTS", label: "Boutique", description: "Preview de 2 a 3 produits.", defaultOrder: 80 },
  { type: "GALLERY", label: "Galerie", description: "Apercu visuel horizontal.", defaultOrder: 90 },
  { type: "CUSTOM_LINKS", label: "Liens", description: "Liens personnalises.", defaultOrder: 100 },
  { type: "ABOUT", label: "A propos", description: "Bio longue du profil.", defaultOrder: 110 },
  { type: "CTA", label: "CTA", description: "Emplacement reserve pour un appel a l'action futur.", defaultOrder: 120 },
];

async function getSections(profileId: string) {
  const exists = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ProfileSection'
    ) AS "exists"
  `;
  if (!exists[0]?.exists) return [];

  return prisma.$queryRaw<SectionRow[]>`
    SELECT "type"::text AS "type", "enabled", "sortOrder", "title"
    FROM "ProfileSection"
    WHERE "profileId" = ${profileId}
    ORDER BY "sortOrder" ASC
  `;
}

export default async function AdminProfileConfigPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true, slug: true } });
  if (!profile) notFound();

  const rows = await getSections(profile.id);
  const byType = new Map(rows.map((row) => [row.type, row]));

  return (
    <div>
      <AdminHeader eyebrow="Configuration du profil" title={profile.displayName} description={`Modules et ordre de la page publique /${profile.slug}.`} />
      <ProfileContentNav profileId={profile.id} active="Configuration" />

      <form action={updateProfileSectionsAction.bind(null, profile.id)} className="mt-6 space-y-4">
        <section className="overflow-hidden rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 shadow-sm">
          {MODULES.map((module) => {
            const section = byType.get(module.type);
            const enabled = section?.enabled ?? ["SOCIALS", "CONTACT", "SERVICES", "PROJECTS", "PRODUCTS", "GALLERY", "CUSTOM_LINKS", "ABOUT"].includes(module.type);
            return (
              <article key={module.type} className="grid gap-4 border-b border-aodi-violet-100 p-5 lg:grid-cols-[180px_1fr_110px_220px] lg:items-center">
                <label className="flex items-center gap-3 text-sm font-bold text-aodi-violet-900">
                  <input type="checkbox" name={`${module.type}.enabled`} defaultChecked={enabled} className="h-5 w-5 rounded border-aodi-violet-200 text-aodi-violet-900" />
                  {module.label}
                </label>
                <div>
                  <p className="text-sm text-aodi-violet-700/75">{module.description}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-aodi-gold-dark">{module.type}</p>
                </div>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-aodi-violet-700/60">Ordre</span>
                  <input name={`${module.type}.sortOrder`} type="number" defaultValue={section?.sortOrder ?? module.defaultOrder} className="mt-1 w-full rounded-lg border border-aodi-violet-100 bg-white px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-aodi-violet-700/60">Titre public</span>
                  <input name={`${module.type}.title`} defaultValue={section?.title ?? ""} placeholder={module.label} className="mt-1 w-full rounded-lg border border-aodi-violet-100 bg-white px-3 py-2 text-sm" />
                </label>
              </article>
            );
          })}
        </section>

        <div className="flex justify-end">
          <button type="submit" className="rounded-lg bg-aodi-violet-900 px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-aodi-violet-800">Enregistrer la configuration</button>
        </div>
      </form>
    </div>
  );
}
