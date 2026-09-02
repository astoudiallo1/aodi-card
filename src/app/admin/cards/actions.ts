"use server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getProfilePublicUrl } from "@/lib/public-url";
import { revalidatePath } from "next/cache";

export async function verifyCardBeforeDeliveryAction(cardId: string) {
  await requireAdminAccess();

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { profile: true },
  });

  if (!card || !card.profile) {
    throw new Error("Carte ou profil introuvable.");
  }

  const expectedNfcUrl = `/${card.profile.slug}`;
  const expectedQrUrl = getProfilePublicUrl(card.profile.slug);
  const checks = [
    Boolean(card.profileId),
    Boolean(card.profile.profilePhoto),
    Boolean(card.profile.displayName),
    expectedQrUrl.endsWith(`/${card.profile.slug}`),
    card.nfcUrl === expectedNfcUrl,
    card.profile.isActive,
    card.status === "PROGRAMMED" || card.status === "READY" || card.status === "DELIVERED",
  ];

  if (!checks.every(Boolean)) {
    throw new Error("La carte ne passe pas toutes les verifications essentielles.");
  }

  await prisma.card.update({
    where: { id: cardId },
    data: {
      verifiedAt: new Date(),
      verifiedBy: "AODI Admin",
    },
  });

  revalidatePath("/admin/cards");
  revalidatePath(`/admin/cards/${cardId}`);
}
