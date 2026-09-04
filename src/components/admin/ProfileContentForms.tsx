import { ImageUploadField } from "@/components/admin/ImageUploadField";

type ContentFormProps<T> = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  item?: Partial<T> | null;
};

type ProductValues = {
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  currency: string;
  imageUrl: string | null;
  whatsappNumber: string | null;
  orderUrl: string | null;
  isVisible: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  displayOrder: number;
};

type ServiceValues = {
  name: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  isVisible: boolean;
  displayOrder: number;
};

type ProjectValues = {
  title: string;
  description: string | null;
  imageUrl: string | null;
  websiteUrl: string | null;
  appUrl: string | null;
  githubUrl: string | null;
  technologies: string | null;
  isVisible: boolean;
  isFeatured: boolean;
  displayOrder: number;
};

type GalleryValues = {
  title: string | null;
  imageUrl: string | null;
  description: string | null;
  isVisible: boolean;
  displayOrder: number;
};

type LinkValues = {
  label: string;
  url: string;
  icon: string | null;
  isVisible: boolean;
  displayOrder: number;
};

function Field({ label, name, type = "text", required = false, defaultValue = "" }: { label: string; name: string; type?: string; required?: boolean; defaultValue?: string | number | null }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-aodi-violet-700/70">{label}</span>
      <input name={name} type={type} required={required} defaultValue={defaultValue ?? ""} className="mt-2 w-full rounded-lg border border-aodi-violet-100 bg-white px-4 py-3 text-sm text-aodi-violet-900 outline-none transition focus:border-aodi-gold focus:ring-2 focus:ring-aodi-gold/20" />
    </label>
  );
}

function TextArea({ label, name, defaultValue = "" }: { label: string; name: string; defaultValue?: string | null }) {
  return (
    <label className="block sm:col-span-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-aodi-violet-700/70">{label}</span>
      <textarea name={name} defaultValue={defaultValue ?? ""} rows={4} className="mt-2 w-full resize-y rounded-lg border border-aodi-violet-100 bg-white px-4 py-3 text-sm leading-relaxed text-aodi-violet-900 outline-none transition focus:border-aodi-gold focus:ring-2 focus:ring-aodi-gold/20" />
    </label>
  );
}

function ImageField({ currentImageUrl, label = "Image", required = false }: { currentImageUrl?: string | null; label?: string; required?: boolean }) {
  return (
    <div className="grid gap-4 sm:col-span-2">
      <ImageUploadField currentImageUrl={currentImageUrl} label={label} required={required} />
      <details className="rounded-lg border border-aodi-violet-100 bg-white px-4 py-3 text-sm text-aodi-violet-900">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.18em] text-aodi-violet-700/70">URL externe avancee</summary>
        <input name="imageUrl" type="url" defaultValue={currentImageUrl ?? ""} placeholder="https://..." className="mt-3 w-full rounded-lg border border-aodi-violet-100 bg-white px-4 py-3 text-sm text-aodi-violet-900 outline-none transition focus:border-aodi-gold focus:ring-2 focus:ring-aodi-gold/20" />
      </details>
    </div>
  );
}

function Check({ label, name, defaultChecked = false }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-aodi-violet-100 bg-white px-4 py-3 text-sm font-semibold text-aodi-violet-900">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4 accent-aodi-violet-900" />
      {label}
    </label>
  );
}

function FormShell({ action, submitLabel, children }: { action: (formData: FormData) => void | Promise<void>; submitLabel: string; children: React.ReactNode }) {
  return (
    <form action={action} className="mt-8 rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
      <div className="mt-6 flex justify-end">
        <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-aodi-violet-900 px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-aodi-violet-800">{submitLabel}</button>
      </div>
    </form>
  );
}

export function ProductForm({ action, submitLabel, item }: ContentFormProps<ProductValues>) {
  return (
    <FormShell action={action} submitLabel={submitLabel}>
      <Field label="Nom du produit" name="name" required defaultValue={item?.name} />
      <Field label="Prix" name="price" type="number" required defaultValue={item?.price} />
      <TextArea label="Description" name="description" defaultValue={item?.description} />
      <ImageField label="Image du produit" currentImageUrl={item?.imageUrl} />
      <Field label="Ancien prix" name="oldPrice" type="number" defaultValue={item?.oldPrice} />
      <Field label="Devise" name="currency" defaultValue={item?.currency ?? "FCFA"} />
      <Field label="Numero WhatsApp" name="whatsappNumber" defaultValue={item?.whatsappNumber} />
      <Field label="URL de commande" name="orderUrl" type="url" defaultValue={item?.orderUrl} />
      <Field label="Ordre d'affichage" name="displayOrder" type="number" defaultValue={item?.displayOrder ?? 0} />
      <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
        <Check label="Visible" name="isVisible" defaultChecked={item?.isVisible ?? true} />
        <Check label="Mis en avant" name="isFeatured" defaultChecked={item?.isFeatured ?? false} />
        <Check label="Disponible" name="isAvailable" defaultChecked={item?.isAvailable ?? true} />
      </div>
    </FormShell>
  );
}

export function ServiceForm({ action, submitLabel, item }: ContentFormProps<ServiceValues>) {
  return (
    <FormShell action={action} submitLabel={submitLabel}>
      <Field label="Nom du service" name="name" required defaultValue={item?.name} />
      <Field label="Prix" name="price" type="number" defaultValue={item?.price} />
      <TextArea label="Description" name="description" defaultValue={item?.description} />
      <ImageField label="Image du service" currentImageUrl={item?.imageUrl} />
      <Field label="Devise" name="currency" defaultValue={item?.currency ?? "FCFA"} />
      <Field label="Texte du bouton" name="ctaLabel" defaultValue={item?.ctaLabel} />
      <Field label="URL du bouton" name="ctaUrl" type="url" defaultValue={item?.ctaUrl} />
      <Field label="Ordre d'affichage" name="displayOrder" type="number" defaultValue={item?.displayOrder ?? 0} />
      <div className="sm:col-span-2"><Check label="Visible" name="isVisible" defaultChecked={item?.isVisible ?? true} /></div>
    </FormShell>
  );
}

export function ProjectForm({ action, submitLabel, item }: ContentFormProps<ProjectValues>) {
  return (
    <FormShell action={action} submitLabel={submitLabel}>
      <Field label="Titre" name="title" required defaultValue={item?.title} />
      <Field label="Technologies" name="technologies" defaultValue={item?.technologies} />
      <TextArea label="Description" name="description" defaultValue={item?.description} />
      <ImageField label="Image du projet" currentImageUrl={item?.imageUrl} />
      <Field label="Lien du site" name="websiteUrl" type="url" defaultValue={item?.websiteUrl} />
      <Field label="Lien de l'application" name="appUrl" type="url" defaultValue={item?.appUrl} />
      <Field label="Lien GitHub" name="githubUrl" type="url" defaultValue={item?.githubUrl} />
      <Field label="Ordre d'affichage" name="displayOrder" type="number" defaultValue={item?.displayOrder ?? 0} />
      <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
        <Check label="Visible" name="isVisible" defaultChecked={item?.isVisible ?? true} />
        <Check label="Mis en avant" name="isFeatured" defaultChecked={item?.isFeatured ?? false} />
      </div>
    </FormShell>
  );
}

export function GalleryForm({ action, submitLabel, item }: ContentFormProps<GalleryValues>) {
  return (
    <FormShell action={action} submitLabel={submitLabel}>
      <Field label="Titre" name="title" defaultValue={item?.title} />
      <ImageField label="Image de la galerie" currentImageUrl={item?.imageUrl} required={!item?.imageUrl} />
      <TextArea label="Description" name="description" defaultValue={item?.description} />
      <Field label="Ordre d'affichage" name="displayOrder" type="number" defaultValue={item?.displayOrder ?? 0} />
      <div className="sm:col-span-2"><Check label="Visible" name="isVisible" defaultChecked={item?.isVisible ?? true} /></div>
    </FormShell>
  );
}

export function CustomLinkForm({ action, submitLabel, item }: ContentFormProps<LinkValues>) {
  return (
    <FormShell action={action} submitLabel={submitLabel}>
      <Field label="Libelle" name="label" required defaultValue={item?.label} />
      <Field label="URL" name="url" type="url" required defaultValue={item?.url} />
      <Field label="Icone" name="icon" defaultValue={item?.icon} />
      <Field label="Ordre d'affichage" name="displayOrder" type="number" defaultValue={item?.displayOrder ?? 0} />
      <div className="sm:col-span-2"><Check label="Visible" name="isVisible" defaultChecked={item?.isVisible ?? true} /></div>
    </FormShell>
  );
}
