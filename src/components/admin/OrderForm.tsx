"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/admin-labels";

export type OrderFormValues = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  quantity: number;
  unitPrice: number;
  notes: string;
};

type OrderFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  order?: OrderFormValues;
};

const defaultOrder: OrderFormValues = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  companyName: "",
  quantity: 1,
  unitPrice: 15000,
  notes: "",
};

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue = "",
}: {
  label: string;
  name: keyof OrderFormValues;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-aodi-violet-700/70">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        min={type === "number" ? 1 : undefined}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-lg border border-aodi-violet-100 bg-white/85 px-4 py-3 text-sm text-aodi-violet-900 outline-none transition focus:border-aodi-gold focus:ring-2 focus:ring-aodi-gold/20"
      />
    </label>
  );
}

export function OrderForm({ action, submitLabel, order }: OrderFormProps) {
  const values = order ?? defaultOrder;
  const [quantity, setQuantity] = useState(values.quantity);
  const [unitPrice, setUnitPrice] = useState(values.unitPrice);
  const total = useMemo(() => Math.max(1, quantity) * Math.max(0, unitPrice), [quantity, unitPrice]);

  return (
    <form action={action} className="mt-8 space-y-5">
      <section className="rounded-lg border border-aodi-gold/35 bg-aodi-violet-950 p-5 text-white shadow-card sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aodi-gold-light">
          Total commande
        </p>
        <p className="mt-3 font-display text-5xl font-semibold text-white">{formatMoney(total)}</p>
        <p className="mt-2 text-sm text-aodi-cream/70">
          {Math.max(1, quantity)} carte(s) x {formatMoney(Math.max(0, unitPrice))}
        </p>
      </section>

      <section className="rounded-lg border border-aodi-violet-100/80 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-aodi-violet-900">Informations client</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Nom du client" name="customerName" required defaultValue={values.customerName} />
          <Field label="Telephone" name="customerPhone" defaultValue={values.customerPhone} />
          <Field label="E-mail" name="customerEmail" type="email" defaultValue={values.customerEmail} />
          <Field label="Entreprise" name="companyName" defaultValue={values.companyName} />
        </div>
      </section>

      <section className="rounded-lg border border-aodi-violet-100/80 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-aodi-violet-900">Commande</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-aodi-violet-700/70">
              Quantite
            </span>
            <input
              name="quantity"
              type="number"
              required
              min={1}
              defaultValue={values.quantity}
              onChange={(event) => setQuantity(Number(event.target.value) || 1)}
              className="mt-2 w-full rounded-lg border border-aodi-violet-100 bg-white/85 px-4 py-3 text-sm text-aodi-violet-900 outline-none transition focus:border-aodi-gold focus:ring-2 focus:ring-aodi-gold/20"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-aodi-violet-700/70">
              Prix unitaire
            </span>
            <input
              name="unitPrice"
              type="number"
              required
              min={0}
              defaultValue={values.unitPrice}
              onChange={(event) => setUnitPrice(Number(event.target.value) || 0)}
              className="mt-2 w-full rounded-lg border border-aodi-violet-100 bg-white/85 px-4 py-3 text-sm text-aodi-violet-900 outline-none transition focus:border-aodi-gold focus:ring-2 focus:ring-aodi-gold/20"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-aodi-violet-700/70">
              Notes
            </span>
            <textarea
              name="notes"
              defaultValue={values.notes}
              rows={4}
              className="mt-2 w-full resize-y rounded-lg border border-aodi-violet-100 bg-white/85 px-4 py-3 text-sm leading-relaxed text-aodi-violet-900 outline-none transition focus:border-aodi-gold focus:ring-2 focus:ring-aodi-gold/20"
            />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button type="submit" className="rounded-lg bg-aodi-violet-900 px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-aodi-violet-800">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
