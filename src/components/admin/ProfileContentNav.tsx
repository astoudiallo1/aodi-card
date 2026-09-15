import { getProfileModuleContext } from "@/lib/profile-module-state";
import { PROFILE_TYPE_LABELS, resolveAdminModules, type AdminProfileNavKey } from "@/lib/profile-modules";
import Link from "next/link";

type NavItem = { key: AdminProfileNavKey; label: string; suffix: string };

const FIXED_BEFORE: NavItem[] = [
  { key: "overview", label: "Apercu", suffix: "" },
  { key: "informations", label: "Informations", suffix: "/edit" },
  { key: "configuration", label: "Configuration", suffix: "/config" },
];

const FIXED_AFTER: NavItem[] = [{ key: "links", label: "Liens", suffix: "/links" }];

/**
 * Navigation d'un profil dans l'admin. Les onglets de modules dependent du type d'experience (modules
 * recommandes), des modules actives dans Configuration et du contenu deja saisi : un module qui contient
 * des donnees reste toujours accessible. Le metier libre n'intervient pas.
 */
export async function ProfileContentNav({ profileId, active }: { profileId: string; active: AdminProfileNavKey }) {
  const context = await getProfileModuleContext(profileId);
  const modules = resolveAdminModules(context, active);
  const items: NavItem[] = [
    ...FIXED_BEFORE,
    ...modules.map(({ module, label }) => ({ key: module.key, label, suffix: module.routeSuffix })),
    ...FIXED_AFTER,
  ];
  const current = modules.find(({ module }) => module.key === active);

  return (
    <>
      <nav className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => {
          const href = `/admin/profiles/${profileId}${item.suffix}`;
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={isActive ? "whitespace-nowrap rounded-lg bg-aodi-violet-900 px-4 py-2 text-sm font-semibold text-white" : "whitespace-nowrap rounded-lg border border-aodi-violet-100 bg-white px-4 py-2 text-sm font-semibold text-aodi-violet-900 hover:border-aodi-gold"}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {current?.reason === "current" ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Le module {current.label} n&apos;est pas recommande pour l&apos;experience {PROFILE_TYPE_LABELS[context.profileType]}. Tu peux quand meme y ajouter du contenu : il restera dans la navigation des qu&apos;il contient des donnees, ou si tu l&apos;actives dans{" "}
          <Link href={`/admin/profiles/${profileId}/config`} className="font-semibold underline">Configuration</Link>.
        </p>
      ) : null}
    </>
  );
}
