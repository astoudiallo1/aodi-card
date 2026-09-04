import Link from "next/link";

const items = [
  { label: "Apercu", suffix: "" },
  { label: "Informations", suffix: "/edit" },
  { label: "Boutique", suffix: "/products" },
  { label: "Services", suffix: "/services" },
  { label: "Projets", suffix: "/projects" },
  { label: "Galerie", suffix: "/gallery" },
  { label: "Liens", suffix: "/links" },
];

export function ProfileContentNav({ profileId, active }: { profileId: string; active: string }) {
  return (
    <nav className="mt-6 flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => {
        const href = `/admin/profiles/${profileId}${item.suffix}`;
        const isActive = item.label.toLowerCase() === active.toLowerCase();
        return (
          <Link
            key={item.label}
            href={href}
            className={isActive ? "whitespace-nowrap rounded-lg bg-aodi-violet-900 px-4 py-2 text-sm font-semibold text-white" : "whitespace-nowrap rounded-lg border border-aodi-violet-100 bg-white px-4 py-2 text-sm font-semibold text-aodi-violet-900 hover:border-aodi-gold"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}