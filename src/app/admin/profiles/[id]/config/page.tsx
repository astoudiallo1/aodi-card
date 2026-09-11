import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileContentNav } from "@/components/admin/ProfileContentNav";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateProfileExperienceAction, updateProfileSectionsAction } from "../content-actions";

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
  { type: "PRODUCTS", label: "Boutique", description: "Preview de 2 a 4 produits.", defaultOrder: 80 },
  { type: "GALLERY", label: "Galerie", description: "Apercu visuel horizontal.", defaultOrder: 90 },
  { type: "CUSTOM_LINKS", label: "Liens", description: "Liens personnalises.", defaultOrder: 100 },
  { type: "ABOUT", label: "A propos", description: "Bio longue du profil.", defaultOrder: 110 },
  { type: "CTA", label: "CTA final", description: "Bandeau final configurable.", defaultOrder: 120 },
];

const PROFILE_TYPES = [
  ["GENERAL", "General"],
  ["CORPORATE", "Corporate"],
  ["ARCHITECTURE", "Architecture"],
  ["COMMERCE", "Commerce"],
  ["MUSIC", "Musique"],
  ["ACTOR_CREATOR", "Artiste / Createur"],
  ["TECH", "Tech"],
  ["CRAFT", "Artisan / Metier"],
];

const POSITIONS = [["center", "Centre"], ["top", "Haut"], ["bottom", "Bas"], ["left", "Gauche"], ["right", "Droite"]];

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

function Field({ label, name, defaultValue, placeholder }: { label: string; name: string; defaultValue?: string | null; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-aodi-violet-700/60">{label}</span>
      <input name={name} defaultValue={defaultValue ?? ""} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-aodi-violet-100 bg-white px-3 py-2 text-sm outline-none focus:border-aodi-gold focus:ring-2 focus:ring-aodi-gold/20" />
    </label>
  );
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue?: string | null; options: string[][] }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-aodi-violet-700/60">{label}</span>
      <select name={name} defaultValue={defaultValue ?? ""} className="mt-1 w-full rounded-lg border border-aodi-violet-100 bg-white px-3 py-2 text-sm outline-none focus:border-aodi-gold focus:ring-2 focus:ring-aodi-gold/20">
        {options.map(([value, labelText]) => <option key={value} value={value}>{labelText}</option>)}
      </select>
    </label>
  );
}

export default async function AdminProfileConfigPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true, slug: true, profileType: true, tagline: true, tags: true, appointmentUrl: true, finalCtaLabel: true, finalCtaUrl: true, heroImagePosition: true, coverImagePosition: true } });
  if (!profile) notFound();

  const rows = await getSections(profile.id);
  const byType = new Map(rows.map((row) => [row.type, row]));

  return (
    <div>
      <AdminHeader eyebrow="Configuration du profil" title={profile.displayName} description={`Experience, actions, modules et ordre de la page publique /${profile.slug}.`} />
      <ProfileContentNav profileId={profile.id} active="Configuration" />

      <form action={updateProfileExperienceAction.bind(null, profile.id)} className="mt-6 space-y-4">
        <section className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <SelectField label="Type d experience" name="profileType" defaultValue={profile.profileType} options={PROFILE_TYPES} />
            <Field label="Slogan court" name="tagline" defaultValue={profile.tagline} placeholder="Une phrase courte pour le hero" />
            <Field label="Tags publics" name="tags" defaultValue={profile.tags.join(", ")} placeholder="Architecture, Design, Conseil" />
            <Field label="URL rendez-vous" name="appointmentUrl" defaultValue={profile.appointmentUrl} />
            <Field label="Label CTA final" name="finalCtaLabel" defaultValue={profile.finalCtaLabel} placeholder="Construisons ensemble" />
            <Field label="URL CTA final" name="finalCtaUrl" defaultValue={profile.finalCtaUrl} />
            <SelectField label="Position photo hero" name="heroImagePosition" defaultValue={profile.heroImagePosition} options={POSITIONS} />
            <SelectField label="Position couverture" name="coverImagePosition" defaultValue={profile.coverImagePosition} options={POSITIONS} />
          </div>
          <div className="mt-5 flex justify-end">
            <button type="submit" className="rounded-lg bg-aodi-violet-900 px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-aodi-violet-800">Enregistrer l experience</button>
          </div>
        </section>
      </form>

      <form action={updateProfileSectionsAction.bind(null, profile.id)} className="mt-6 space-y-4">
        <section className="overflow-hidden rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 shadow-sm">
          {MODULES.map((module) => {
            const section = byType.get(module.type);
            const enabled = section?.enabled ?? ["SOCIALS", "CONTACT", "STATS", "SERVICES", "PROJECTS", "GALLERY", "ABOUT"].includes(module.type);
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
          <button type="submit" className="rounded-lg bg-aodi-violet-900 px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-aodi-violet-800">Enregistrer les modules</button>
        </div>
      </form>
    </div>
  );
}