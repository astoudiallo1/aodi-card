"use server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { saveProfilePhoto } from "@/lib/profile-photo-storage";
import { generateUniqueProfileSlug } from "@/lib/slug";
import type { CardStatus, OrderStatus, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requiredString(formData: FormData, key: string, label: string): string {
  const value = optionalString(formData, key);
  if (!value) throw new Error(`${label} est obligatoire.`);
  return value;
}

function positiveInt(formData: FormData, key: string, label: string): number {
  const value = Number(formData.get(key));
  if (!Number.isInteger(value) || value < 1) throw new Error(`${label} doit etre superieur a zero.`);
  return value;
}

function moneyInt(formData: FormData, key: string, label: string): number {
  const value = Number(formData.get(key));
  if (!Number.isInteger(value) || value < 0) throw new Error(`${label} doit etre un montant valide.`);
  return value;
}

function enumValue<T extends string>(formData: FormData, key: string, allowed: readonly T[], fallback: T): T {
  const value = formData.get(key);
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

async function nextOrderNumber() {
  const latestOrder = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { orderNumber: true },
  });

  const latestNumber = latestOrder?.orderNumber.match(/(\d+)$/)?.[1];
  const nextNumber = latestNumber ? Number(latestNumber) + 1 : 1;
  return `CMD-AODI-${String(nextNumber).padStart(6, "0")}`;
}

async function nextCardNumber() {
  const latestCard = await prisma.card.findFirst({
    orderBy: { createdAt: "desc" },
    select: { cardNumber: true },
  });

  const latestNumber = latestCard?.cardNumber.match(/(\d+)$/)?.[1];
  const nextNumber = latestNumber ? Number(latestNumber) + 1 : 1;
  return `CARD-AODI-${String(nextNumber).padStart(6, "0")}`;
}

async function ensureAvailableCards(quantity: number) {
  const availableCards = await prisma.card.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { createdAt: "asc" },
    take: quantity,
  });

  const missing = quantity - availableCards.length;
  if (missing <= 0) return availableCards;

  const createdCards = [];
  for (let index = 0; index < missing; index += 1) {
    createdCards.push(
      await prisma.card.create({
        data: { cardNumber: await nextCardNumber() },
      }),
    );
  }

  return [...availableCards, ...createdCards];
}

async function revalidateOrder(orderId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function createOrderAction(formData: FormData) {
  await requireAdminAccess();

  const quantity = positiveInt(formData, "quantity", "La quantite");
  const unitPrice = moneyInt(formData, "unitPrice", "Le prix unitaire");
  const order = await prisma.order.create({
    data: {
      orderNumber: await nextOrderNumber(),
      customerName: requiredString(formData, "customerName", "Le nom du client"),
      customerPhone: optionalString(formData, "customerPhone"),
      customerEmail: optionalString(formData, "customerEmail"),
      companyName: optionalString(formData, "companyName"),
      quantity,
      unitPrice,
      totalAmount: quantity * unitPrice,
      notes: optionalString(formData, "notes"),
    },
    select: { id: true, orderNumber: true },
  });

  await revalidateOrder(order.id);
  redirect(`/admin/orders/created?id=${encodeURIComponent(order.id)}`);
}

export async function updateOrderAction(orderId: string, formData: FormData) {
  await requireAdminAccess();

  const quantity = positiveInt(formData, "quantity", "La quantite");
  const unitPrice = moneyInt(formData, "unitPrice", "Le prix unitaire");

  await prisma.order.update({
    where: { id: orderId },
    data: {
      customerName: requiredString(formData, "customerName", "Le nom du client"),
      customerPhone: optionalString(formData, "customerPhone"),
      customerEmail: optionalString(formData, "customerEmail"),
      companyName: optionalString(formData, "companyName"),
      quantity,
      unitPrice,
      totalAmount: quantity * unitPrice,
      notes: optionalString(formData, "notes"),
    },
  });

  await revalidateOrder(orderId);
  redirect(`/admin/orders/${orderId}`);
}

export async function updateOrderStatusAction(orderId: string, formData: FormData) {
  await requireAdminAccess();

  const orderStatus = enumValue<OrderStatus>(
    formData,
    "orderStatus",
    ["NEW", "CONFIRMED", "PROFILE_CREATED", "CARD_ASSIGNED", "PROGRAMMED", "READY", "DELIVERED", "CANCELLED"],
    "NEW",
  );
  const paymentStatus = enumValue<PaymentStatus>(
    formData,
    "paymentStatus",
    ["PENDING", "PAID", "PARTIAL", "REFUNDED"],
    "PENDING",
  );

  await prisma.order.update({
    where: { id: orderId },
    data: {
      orderStatus,
      paymentStatus,
      paidAt: paymentStatus === "PAID" ? new Date() : null,
      completedAt: orderStatus === "DELIVERED" ? new Date() : null,
    },
  });

  await revalidateOrder(orderId);
}

export async function associateProfileAction(orderId: string, formData: FormData) {
  await requireAdminAccess();

  const profileId = requiredString(formData, "profileId", "Le profil");
  await prisma.order.update({
    where: { id: orderId },
    data: { profileId, orderStatus: "PROFILE_CREATED" },
  });

  await revalidateOrder(orderId);
  redirect(`/admin/orders/${orderId}`);
}

export async function createProfileFromOrderAction(orderId: string, formData: FormData) {
  await requireAdminAccess();

  const displayName = requiredString(formData, "displayName", "Le nom affiche");
  const nameParts = displayName.split(" ").filter(Boolean);
  const firstName = optionalString(formData, "firstName") || nameParts[0] || displayName;
  const lastName = optionalString(formData, "lastName") || nameParts.slice(1).join(" ") || "Client";
  const photo = formData.get("profilePhoto");
  const cover = formData.get("coverPhoto");
  const profilePhoto = photo instanceof File ? await saveProfilePhoto(photo) : null;
  const coverPhoto = cover instanceof File ? await saveProfilePhoto(cover) : null;

  const profile = await prisma.profile.create({
    data: {
      firstName,
      lastName,
      displayName,
      slug: await generateUniqueProfileSlug(displayName),
      jobTitle: optionalString(formData, "jobTitle"),
      company: optionalString(formData, "company"),
      bio: optionalString(formData, "bio"),
      phone: optionalString(formData, "phone"),
      whatsapp: optionalString(formData, "whatsapp"),
      email: optionalString(formData, "email"),
      instagram: optionalString(formData, "instagram"),
      snapchat: optionalString(formData, "snapchat"),
      tiktok: optionalString(formData, "tiktok"),
      facebook: optionalString(formData, "facebook"),
      linkedin: optionalString(formData, "linkedin"),
      website: optionalString(formData, "website"),
      address: optionalString(formData, "address"),
      profilePhoto,
      coverPhoto,
      isActive: true,
    },
    select: { id: true },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { profileId: profile.id, orderStatus: "PROFILE_CREATED" },
  });

  await revalidateOrder(orderId);
  redirect(`/admin/orders/${orderId}`);
}

export async function assignCardsAction(orderId: string) {
  await requireAdminAccess();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { profile: true, cards: true },
  });

  if (!order) throw new Error("Commande introuvable.");
  if (!order.profile) throw new Error("Associez un profil avant d'attribuer une carte.");

  const missingCards = Math.max(0, order.quantity - order.cards.length);
  const cards = await ensureAvailableCards(missingCards);
  const nfcUrl = `/${order.profile.slug}`;

  await Promise.all(
    cards.map((card) =>
      prisma.card.update({
        where: { id: card.id },
        data: {
          profileId: order.profileId,
          orderId: order.id,
          nfcUrl,
          status: "ASSIGNED",
        },
      }),
    ),
  );

  await prisma.order.update({ where: { id: orderId }, data: { orderStatus: "CARD_ASSIGNED" } });
  await revalidateOrder(orderId);
}

async function setCardsStatus(orderId: string, status: CardStatus) {
  await prisma.card.updateMany({ where: { orderId }, data: { status, deliveredAt: status === "DELIVERED" ? new Date() : null } });
}

export async function markProgrammedAction(orderId: string) {
  await requireAdminAccess();
  await setCardsStatus(orderId, "PROGRAMMED");
  await prisma.order.update({ where: { id: orderId }, data: { orderStatus: "PROGRAMMED" } });
  await revalidateOrder(orderId);
}

export async function markReadyAction(orderId: string) {
  await requireAdminAccess();
  await setCardsStatus(orderId, "READY");
  await prisma.order.update({ where: { id: orderId }, data: { orderStatus: "READY" } });
  await revalidateOrder(orderId);
}

export async function markDeliveredAction(orderId: string) {
  await requireAdminAccess();
  const now = new Date();
  await prisma.card.updateMany({ where: { orderId }, data: { status: "DELIVERED", deliveredAt: now } });
  await prisma.order.update({ where: { id: orderId }, data: { orderStatus: "DELIVERED", completedAt: now } });
  await revalidateOrder(orderId);
}


