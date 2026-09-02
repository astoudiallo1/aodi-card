import type { CardStatus, OrderStatus, PaymentStatus } from "@prisma/client";

export const orderStatusLabels: Record<OrderStatus, string> = {
  NEW: "Nouvelle",
  CONFIRMED: "Confirmee",
  PROFILE_CREATED: "Profil cree",
  CARD_ASSIGNED: "Carte attribuee",
  PROGRAMMED: "Programmee",
  READY: "Prete",
  DELIVERED: "Livree",
  CANCELLED: "Annulee",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "En attente",
  PAID: "Payee",
  PARTIAL: "Partiellement payee",
  REFUNDED: "Remboursee",
};

export const cardStatusLabels: Record<CardStatus, string> = {
  AVAILABLE: "Disponible",
  ASSIGNED: "Attribuee",
  PROGRAMMED: "Programmee",
  READY: "Prete",
  DELIVERED: "Livree",
  DISABLED: "Desactivee",
};

export const orderTimeline: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "PROFILE_CREATED",
  "CARD_ASSIGNED",
  "PROGRAMMED",
  "READY",
  "DELIVERED",
];

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | null) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function statusBadgeClass(kind: "order" | "payment" | "card", status: string) {
  if (status === "DELIVERED" || status === "PAID" || status === "READY") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "CANCELLED" || status === "REFUNDED" || status === "DISABLED") {
    return "bg-rose-50 text-rose-700";
  }

  if (status === "PENDING" || status === "NEW" || status === "AVAILABLE") {
    return "bg-aodi-violet-100 text-aodi-violet-700";
  }

  if (kind === "card" && status === "PROGRAMMED") {
    return "bg-aodi-gold/20 text-aodi-violet-900";
  }

  return "bg-aodi-gold/20 text-aodi-violet-900";
}
