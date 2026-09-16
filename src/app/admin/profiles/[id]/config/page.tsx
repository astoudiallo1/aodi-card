import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileContentNav } from "@/components/admin/ProfileContentNav";
import { prisma } from "@/lib/prisma";
import { getProfileModuleContext } from "@/lib/profile-module-state";
import { PROFILE_TYPE_LABELS, getProfileModuleBySection, isModuleRecommended, moduleLabel, type ProfileModuleContext, type ProfileSectionState } from "@/lib/profile-modules";
import type { ProfileSectionType } from "@/types/profile";
import { notFound } from "next/navigation";
import { updateProfileSectionsAction } from "../content-actions";

type PageProps = { params: Promise<{ id: string }> };
type SectionType = ProfileSectionType;
type ModuleDefinition = { type: SectionType; label: string; description: string; defaultOrder: number };

const MODULES: ModuleDefinition[] = [
  { type: "SOCIALS", label: "Reseaux", description: "Icones sociales visibles dans le hero.", defaultOrder: 10 },
  { type: "CONTACT", label: "Contact", description: "Actions rapides de contact et vCard.", defaultOrder: 20 },
  { type: "STATS", label: "Statistiques", description: "Chiffres publics configures.", defaultOrder: 30 },
  { type: "MUSIC", label: "Musique", description: "Derniere sortie ou liens d'ecoute.", defaultOrder: 40 },
  { type: "EVENTS", label: "Evenements", description: "Dates publiques generiques.", defaultOrder: 50 },
  { type: "SERVICES", label: "Services", description: "Cartes services existantes.", defaultOrder: 60 },
  { type: "PROJECTS", label: "Projets", description: "Realisations et portfolios.", defaultOrder: 70 },
  { type: "VIDEOS", label: "Videos", description: "Chaine YouTube du profil : dernieres videos du metier (realisations, demos, interviews...).", defaultOrder: 75 },
  { type: "ARTISTS", label: "Artistes accompagnes", description: "Artistes suivis par un producteur, manager, label ou agence, avec leur propre chaine YouTube.", defaultOrder: 78 },
  { type: "PRODUCTS", label: "Boutique", description: "Preview de 2 a 4 produits.", defaultOrder: 80 },
  { type: "GALLERY", label: "Galerie", description: "Apercu visuel horizontal.", defaultOrder: 90 },
  { type: "CUSTOM_LINKS", label: "Liens", description: "Liens personnalises.", defaultOrder: 100 },
  { type: "ABOUT", label: "A propos", description: "Bio longue du profil.", defaultOrder: 110 },
  { type: "CTA", label: "CTA final", description: "Bandeau final configurable.", defaultOrder: 120 },
];

const PROFILE_TYPES = Object.entries(PROFILE_TYPE_LABELS);

const POSITIONS = [["center", "Centre"], ["top", "Haut"], ["bottom", "Bas"], ["left", "Gauche"], ["right", "Droite"]];

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

// Sans ligne ProfileSection, un module est coche par defaut s'il est recommande pour l'experience ou s'il
// contient deja des donnees : le premier enregistrement de cette page ne doit jamais masquer un contenu existant.
function defaultEnabled(module: ModuleDefinition, context: ProfileModuleContext) {
  const contentModule = getProfileModuleBySection(module.type);
  if (!contentModule) return true;
  return isModuleRecommended(contentModule.key, context.profileType) || context.usage[contentModule.key] > 0;
}

// Les sections de base (reseaux, contact, liens, bio, CTA) sont toujours proposees ; seuls les modules de contenu
// dependent du type d'experience. Le metier libre n'intervient jamais.
function isRecommended(module: ModuleDefinition, context: ProfileModuleContext) {
  const contentModule = getProfileModuleBySection(module.type);
  return !contentModule || isModuleRecommended(contentModule.key, context.profileType);
}

function moduleDisplayLabel(module: ModuleDefinition, context: ProfileModuleContext) {
  const contentModule = getProfileModuleBySection(module.type);
  return contentModule ? moduleLabel(contentModule, context.profileType) : module.label;
}

function moduleUsage(module: ModuleDefinition, context: ProfileModuleContext) {
  const contentModule = getProfileModuleBySection(module.type);
  return contentModule ? context.usage[contentModule.key] : 0;
}

function ModuleGroup({ title, description, modules, context, byType }: { title: string; description: string; modules: ModuleDefinition[]; context: ProfileModuleContext; byType: Map<SectionType, ProfileSectionState> }) {
  if (modules.length === 0) return null;
  return (
    <section className="overflow-hidden rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 shadow-sm">
      <div className="border-b border-aodi-violet-100 px-5 py-4">
        <h2 className="font-display text-2xl font-semibold text-aodi-violet-900">{title}</h2>
        <p className="mt-1 text-sm text-aodi-violet-700/70">{description}</p>
      </div>
      {modules.map((module) => {
        const section = byType.get(module.type);
        const enabled = section?.enabled ?? defaultEnabled(module, context);
        const usage = moduleUsage(module, context);
        const label = moduleDisplayLabel(module, context);
        return (
          <article key={module.type} className="grid gap-4 border-b border-aodi-violet-100 p-5 lg:grid-cols-[180px_1fr_110px_220px] lg:items-center">
            <label className="flex items-center gap-3 text-sm font-bold text-aodi-violet-900">
              <input type="checkbox" name={`${module.type}.enabled`} defaultChecked={enabled} className="h-5 w-5 rounded border-aodi-violet-200 text-aodi-violet-900" />
              {label}
            </label>
            <div>
              <p className="text-sm text-aodi-violet-700/75">{module.description}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-aodi-gold-dark">
                {module.type}
                {usage > 0 ? <span className="ml-2 normal-case tracking-normal text-aodi-violet-700/60">- {usage} element{usage > 1 ? "s" : ""} deja saisi{usage > 1 ? "s" : ""}</span> : null}
              </p>
            </div>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-aodi-violet-700/60">Ordre</span>
              <input name={`${module.type}.sortOrder`} type="number" defaultValue={section?.sortOrder ?? module.defaultOrder} className="mt-1 w-full rounded-lg border border-aodi-violet-100 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-aodi-violet-700/60">Titre public</span>
              <input name={`${module.type}.title`} defaultValue={section?.title ?? ""} placeholder={label} className="mt-1 w-full rounded-lg border border-aodi-violet-100 bg-white px-3 py-2 text-sm" />
            </label>
          </article>
        );
      })}
    </section>
  );
}

export default async function AdminProfileConfigPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true, slug: true, profileType: true, tagline: true, tags: true, appointmentUrl: true, finalCtaLabel: true, finalCtaUrl: true, heroImagePosition: true, coverImagePosition: true } });
  if (!profile) notFound();

  const tagList = Array.isArray(profile.tags) ? profile.tags : [];

  const context = await getProfileModuleContext(profile.id);
  const byType = new Map(context.sections.map((row) => [row.type, row]));
  // Une section absente de l'enum PostgreSQL (migration pas encore appliquee) n'est pas proposee.
  const availableModules = MODULES.filter((module) => context.availableSectionTypes.has(module.type));
  const recommendedModules = availableModules.filter((module) => isRecommended(module, context));
  const otherModules = availableModules.filter((module) => !isRecommended(module, context));
  const experienceLabel = PROFILE_TYPE_LABELS[context.profileType];

  return (
    <div>
      <AdminHeader eyebrow="Configuration du profil" title={profile.displayName} description={`Experience, actions, modules et ordre de la page publique /${profile.slug}.`} />
      <ProfileContentNav profileId={profile.id} active="configuration" />

      <form action={`/admin/profiles/${profile.id}/config/experience`} method="post" className="mt-6 space-y-4">
        <section className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <SelectField label="Type d experience" name="profileType" defaultValue={profile.profileType} options={PROFILE_TYPES} />
            <Field label="Slogan court" name="tagline" defaultValue={profile.tagline} placeholder="Une phrase courte pour le hero" />
            <Field label="Tags publics" name="tags" defaultValue={tagList.join(", ")} placeholder="Architecture, Design, Conseil" />
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
        <ModuleGroup
          title="Modules recommandes"
          description={`Selection par defaut pour l'experience ${experienceLabel}. Le metier libre n'intervient pas : seul le type d'experience compte.`}
          modules={recommendedModules}
          context={context}
          byType={byType}
        />
        <ModuleGroup
          title="Autres modules"
          description="Non proposes par defaut pour cette experience, mais activables a tout moment. Un module qui contient deja des donnees reste toujours accessible dans la navigation."
          modules={otherModules}
          context={context}
          byType={byType}
        />

        <div className="flex justify-end">
          <button type="submit" className="rounded-lg bg-aodi-violet-900 px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-aodi-violet-800">Enregistrer les modules</button>
        </div>
      </form>
    </div>
  );
}