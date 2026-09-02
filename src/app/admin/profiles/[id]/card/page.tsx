import { AdminHeader } from "@/components/admin/AdminHeader";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { getProfilePublicUrl, getPublicAppUrl } from "@/lib/public-url";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaCheckCircle, FaExclamationTriangle, FaLink, FaMobileAlt, FaQrcode } from "react-icons/fa";

type CardConfigurationPageProps = {
  params: Promise<{ id: string }>;
};

function initials(displayName: string) {
  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function isLocalUrl(url: string) {
  return /localhost|127\.0\.0\.1/i.test(url);
}

function getUrlState(publicUrl: string, isActive: boolean, slug: string) {
  let validUrl = false;
  let isHttps = false;

  try {
    const parsed = new URL(publicUrl);
    validUrl = Boolean(parsed.protocol && parsed.host && slug);
    isHttps = parsed.protocol === "https:";
  } catch {
    validUrl = false;
  }

  const isProduction = process.env.NODE_ENV === "production";
  const developmentMode = !isProduction && isLocalUrl(publicUrl);
  const productionHttpsOk = !isProduction || isHttps;
  const ready = isActive && Boolean(slug) && validUrl && productionHttpsOk && !developmentMode;

  return { validUrl, isHttps, isProduction, developmentMode, ready };
}

function StatusLine({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-sm font-semibold">
      {ok ? <FaCheckCircle className="h-4 w-4 text-emerald-600" /> : <FaExclamationTriangle className="h-4 w-4 text-amber-600" />}
      <span className={ok ? "text-aodi-violet-900" : "text-amber-800"}>{children}</span>
    </li>
  );
}

export default async function CardConfigurationPage({ params }: CardConfigurationPageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id } });

  if (!profile) {
    notFound();
  }

  const publicBaseUrl = getPublicAppUrl();
  const publicUrl = getProfilePublicUrl(profile.slug);
  const qrSvgUrl = `/api/qr/${profile.slug}/svg`;
  const qrPngUrl = `/api/qr/${profile.slug}/png`;
  const state = getUrlState(publicUrl, profile.isActive, profile.slug);

  return (
    <div>
      <AdminHeader
        eyebrow="Configuration"
        title="Configuration de la carte"
        description="URL definitive a programmer dans la carte NFC physique et QR personnel associe."
        action={{ href: "/admin/profiles", label: "Retour profils" }}
      />

      {state.developmentMode ? (
        <section className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900 shadow-sm">
          <div className="flex gap-3">
            <FaExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-[0.16em]">Mode developpement</h2>
              <p className="mt-2 text-sm leading-relaxed">
                Ne programmez pas cette URL dans une carte NFC reelle. Une carte vendue a un client doit utiliser uniquement l&apos;URL HTTPS du domaine de production.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-8 grid gap-5 xl:grid-cols-[1fr_1.15fr]">
        <article className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-aodi-gold-dark">Profil</p>
          <div className="mt-5 flex items-center gap-5">
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-aodi-gold bg-aodi-violet-900">
              {profile.profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profilePhoto} alt={profile.displayName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-3xl text-aodi-gold-light">{initials(profile.displayName)}</div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-4xl font-semibold leading-tight text-aodi-violet-900">{profile.displayName}</h2>
              <p className="mt-2 text-sm font-semibold text-aodi-violet-700">/{profile.slug}</p>
              <span className={profile.isActive ? "mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700" : "mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"}>
                {profile.isActive ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
          <dl className="mt-6 grid gap-3 text-sm">
            <div className="rounded-lg bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-aodi-violet-700/60">Nom</dt>
              <dd className="mt-1 font-semibold text-aodi-violet-900">{profile.displayName}</dd>
            </div>
            <div className="rounded-lg bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-aodi-violet-700/60">Slug</dt>
              <dd className="mt-1 break-all font-semibold text-aodi-violet-900">{profile.slug}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-lg border border-aodi-gold/35 bg-aodi-violet-950 p-5 text-white shadow-card sm:p-6">
          <div className="flex items-center gap-3 text-aodi-gold-light">
            <FaLink className="h-5 w-5" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em]">Lien permanent du profil</p>
          </div>
          <p className="mt-5 break-all rounded-lg border border-white/10 bg-white/10 p-4 text-base font-semibold text-aodi-cream">{publicUrl}</p>
          <p className="mt-4 text-sm leading-relaxed text-aodi-cream/80">
            Cette URL est la destination unique du profil public. Elle sert pour le NFC, le QR Code, le partage et le lien public.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <CopyLinkButton url={publicUrl} label="Copier le lien" copiedLabel="Lien copie" />
            <Link href={`/${profile.slug}`} target="_blank" className="inline-flex items-center justify-center rounded-lg border border-aodi-gold/60 px-5 py-3 text-sm font-semibold text-aodi-gold-light hover:bg-white/10">
              Voir le profil
            </Link>
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[360px_1fr]">
        <article className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3 text-aodi-violet-900">
            <FaQrcode className="h-5 w-5 text-aodi-gold-dark" />
            <h2 className="text-sm font-extrabold uppercase tracking-[0.16em]">QR Code associe</h2>
          </div>
          <div className="mt-5 rounded-lg border border-aodi-violet-100 bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSvgUrl} alt={`QR Code ${profile.displayName}`} className="aspect-square w-full object-contain" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-aodi-violet-700/75">
            Ce QR encode exactement la meme URL permanente que celle fournie pour la carte NFC.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={qrSvgUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-aodi-violet-200 bg-white px-4 py-3 text-sm font-semibold text-aodi-violet-900 hover:border-aodi-gold">Afficher le QR</a>
            <a href={qrPngUrl} download={`aodi-card-${profile.slug}-qr.png`} className="rounded-lg bg-aodi-violet-900 px-4 py-3 text-sm font-semibold text-white hover:bg-aodi-violet-800">Telecharger le QR</a>
          </div>
        </article>

        <div className="grid gap-5">
          <article className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 text-aodi-violet-900">
              <FaMobileAlt className="h-5 w-5 text-aodi-gold-dark" />
              <h2 className="text-sm font-extrabold uppercase tracking-[0.16em]">Programmation NFC</h2>
            </div>
            <ol className="mt-5 grid gap-2 text-sm leading-relaxed text-aodi-violet-800">
              <li>1. Copier le lien permanent.</li>
              <li>2. Ouvrir l&apos;application utilisee pour programmer la carte NFC.</li>
              <li>3. Choisir une ecriture de type URL / URI.</li>
              <li>4. Coller le lien permanent.</li>
              <li>5. Ecrire la donnee sur la carte.</li>
              <li>6. Tester la carte avec un autre telephone.</li>
              <li>7. Verifier que le bon profil AODI Card s&apos;ouvre.</li>
            </ol>
            <div className="mt-5">
              <CopyLinkButton url={publicUrl} label="Copier l'URL pour NFC" copiedLabel="URL copiee" variant="primary" />
            </div>
          </article>

          <article className="rounded-lg border border-aodi-violet-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-aodi-violet-900">Etat</h2>
            <ul className="mt-5 grid gap-3">
              <StatusLine ok={profile.isActive}>Profil actif</StatusLine>
              <StatusLine ok={Boolean(profile.slug)}>Slug existant</StatusLine>
              <StatusLine ok={state.validUrl}>URL publique valide</StatusLine>
              <StatusLine ok={state.isProduction ? state.isHttps : true}>HTTPS en production</StatusLine>
              <StatusLine ok={true}>QR associe au profil</StatusLine>
            </ul>
            <div className={state.ready ? "mt-6 rounded-lg bg-emerald-50 p-4 text-sm font-extrabold uppercase tracking-[0.12em] text-emerald-700" : "mt-6 rounded-lg bg-amber-50 p-4 text-sm font-extrabold uppercase tracking-[0.12em] text-amber-800"}>
              {state.ready ? "Pret pour programmation NFC" : state.developmentMode ? "Mode developpement - ne pas programmer une carte reelle" : "Configuration a verifier avant programmation"}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-aodi-violet-700/65">Base publique utilisee : {publicBaseUrl}</p>
          </article>
        </div>
      </section>
    </div>
  );
}