import Link from "next/link";

type AdminHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: {
    href: string;
    label: string;
  };
};

export function AdminHeader({ eyebrow = "AODI CARD", title, description, action }: AdminHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aodi-gold-dark">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-aodi-violet-900 sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-aodi-violet-700/75">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-aodi-violet-800"
        >
          + {action.label}
        </Link>
      ) : null}
    </header>
  );
}
