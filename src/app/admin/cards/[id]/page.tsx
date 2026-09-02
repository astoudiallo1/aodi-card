import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DeliveryChecklist } from "@/components/admin/DeliveryChecklist";
import { QrCodePanel } from "@/components/admin/QrCodePanel";
import { cardStatusLabels, formatDate } from "@/lib/admin-labels";
import { prisma } from "@/lib/prisma";
import { getProfilePublicUrl } from "@/lib/public-url";
import Link from "next/link";
import { notFound } from "next/navigation";
import { verifyCardBeforeDeliveryAction } from "../actions";

type CardPageProps = { params: Promise<{ id: string }> };

export default async function CardPage({ params }: CardPageProps) {
  const { id } = await params;
  const card = await prisma.card.findUnique({
    where: { id },
    include: { profile: true, order: { select: { id: true, orderNumber: true } } },
  });

  if (!card) notFound();

  const profile = card.profile;
  const publicUrl = profile ? getProfilePublicUrl(profile.slug) : null;
  const expectedNfcUrl = profile ? `/${profile.slug}` : null;
  const qrMatchesProfile = Boolean(profile && publicUrl?.endsWith(`/${profile.slug}`));
  const nfcMatchesProfile = Boolean(profile && card.nfcUrl === expectedNfcUrl);
  const cardProgrammed = card.status === "PROGRAMMED" || card.status === "READY" || card.status === "DELIVERED";

  const checks = [
    { label: "Profil associe", detail: profile ? profile.displayName : "Aucun profil", ok: Boolean(profile), essential: true },
    { label: "Photo presente", detail: profile?.profilePhoto ? "Photo disponible" : "Photo manquante", ok: Boolean(profile?.profilePhoto), essential: true },
    { label: "Nom present", detail: profile?.displayName || "Nom manquant", ok: Boolean(profile?.displayName), essential: true },
    { label: "Lien public valide", detail: publicUrl || "Aucune URL publique", ok: Boolean(publicUrl && profile), essential: true },
    { label: "QR Code genere", detail: publicUrl || "Aucun QR personnel", ok: Boolean(publicUrl && profile), essential: true },
    { label: "QR Code correspondant", detail: profile ? `QR -> ${profile.displayName}` : "Aucun profil", ok: qrMatchesProfile, essential: true },
    { label: "URL NFC meme profil", detail: card.nfcUrl || "URL NFC manquante", ok: nfcMatchesProfile, essential: true },
    { label: "Profil actif", detail: profile?.isActive ? "Actif" : "Inactif", ok: Boolean(profile?.isActive), essential: true },
    { label: "Carte programmee", detail: cardStatusLabels[card.status], ok: cardProgrammed, essential: true },
  ];
  const canVerify = checks.filter((check) => check.essential).every((check) => check.ok);

  return (
    <div>
      <AdminHeader
        eyebrow="Carte NFC"
        title={card.cardNumber}
        description="QR du proprietaire et verification avant livraison."
        action={{ href: "/admin/cards", label: "Retour cartes" }}
      />

      <section className="mt-8 grid gap-4 lg:grid-cols-4">
        <article className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm lg:col-span-3">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Numero" value={card.cardNumber} />
            <div><Label>Statut</Label><AdminBadge kind="card" status={card.status} label={cardStatusLabels[card.status]} /></div>
            <Info label="URL NFC" value={card.nfcUrl || "-"} />
            <Info label="Verifiee" value={card.verifiedAt ? formatDate(card.verifiedAt) : "Non"} />
          </div>
        </article>
        <article className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm">
          <Label>Commande</Label>
          {card.order ? <Link href={`/admin/orders/${card.order.id}`} className="text-sm font-semibold text-aodi-violet-900 hover:text-aodi-gold-dark">{card.order.orderNumber}</Link> : <p className="text-sm text-aodi-violet-700/70">-</p>}
        </article>
      </section>

      <section className="mt-5">
        {profile && publicUrl ? (
          <QrCodePanel displayName={profile.displayName} slug={profile.slug} publicUrl={publicUrl} photo={profile.profilePhoto} />
        ) : (
          <article className="rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-6 shadow-sm">
            <h2 className="font-display text-3xl font-semibold text-aodi-violet-900">QR Code du proprietaire</h2>
            <p className="mt-3 text-sm leading-relaxed text-aodi-violet-700/75">
              Attribuez d&apos;abord cette carte a un profil pour generer son QR Code.
            </p>
          </article>
        )}
      </section>

      <section className="mt-5 rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aodi-gold-dark">Verification avant livraison</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-aodi-violet-900">Checklist AODI</h2>
          </div>
          <form action={verifyCardBeforeDeliveryAction.bind(null, card.id)}>
            <button disabled={!canVerify} type="submit" className="rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-aodi-violet-800 disabled:cursor-not-allowed disabled:opacity-40">
              Valider la carte avant livraison
            </button>
          </form>
        </div>
        <div className="mt-5">
          <DeliveryChecklist checks={checks} />
        </div>
        {card.verifiedAt ? (
          <p className="mt-4 text-sm font-semibold text-emerald-700">Carte verifiee par {card.verifiedBy || "AODI"} le {formatDate(card.verifiedAt)}.</p>
        ) : null}
      </section>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-aodi-violet-700/60">{children}</p>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><Label>{label}</Label><p className="text-sm font-semibold text-aodi-violet-900">{value}</p></div>;
}


