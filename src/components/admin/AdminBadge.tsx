import { statusBadgeClass } from "@/lib/admin-labels";

export function AdminBadge({ label, status, kind = "order" }: { label: string; status: string; kind?: "order" | "payment" | "card" }) {
  return (
    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(kind, status)}`}>
      {label}
    </span>
  );
}
