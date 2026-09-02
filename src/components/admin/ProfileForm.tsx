"use client";

import { useEffect, useState } from "react";

export type AdminProfileFormData = {
  firstName: string;
  lastName: string;
  displayName: string;
  jobTitle: string;
  company: string;
  bio: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  snapchat: string;
  tiktok: string;
  facebook: string;
  linkedin: string;
  website: string;
  address: string;
  profilePhoto: string | null;
  coverPhoto: string | null;
};

type ProfileFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  profile?: AdminProfileFormData;
};

const emptyProfile: AdminProfileFormData = {
  firstName: "",
  lastName: "",
  displayName: "",
  jobTitle: "",
  company: "",
  bio: "",
  phone: "",
  whatsapp: "",
  email: "",
  instagram: "",
  snapchat: "",
  tiktok: "",
  facebook: "",
  linkedin: "",
  website: "",
  address: "",
  profilePhoto: null,
  coverPhoto: null,
};

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue = "",
}: {
  label: string;
  name: keyof AdminProfileFormData;
  type?: string;
  required?: boolean;
  defaultValue?: string | null;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-aodi-violet-700/70">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full rounded-lg border border-aodi-violet-100 bg-white/85 px-4 py-3 text-sm text-aodi-violet-900 outline-none transition placeholder:text-aodi-violet-300 focus:border-aodi-gold focus:ring-2 focus:ring-aodi-gold/20"
      />
    </label>
  );
}

function TextArea({ label, name, defaultValue = "", rows = 4 }: { label: string; name: keyof AdminProfileFormData; defaultValue?: string | null; rows?: number }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-aodi-violet-700/70">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={rows}
        className="mt-2 w-full resize-y rounded-lg border border-aodi-violet-100 bg-white/85 px-4 py-3 text-sm leading-relaxed text-aodi-violet-900 outline-none transition placeholder:text-aodi-violet-300 focus:border-aodi-gold focus:ring-2 focus:ring-aodi-gold/20"
      />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-aodi-violet-100/80 bg-[#FBF8F1]/90 p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-2xl font-semibold text-aodi-violet-900">{title}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function ProfileForm({ action, submitLabel, profile }: ProfileFormProps) {
  const values = profile ?? emptyProfile;
  const [profilePreview, setProfilePreview] = useState<string | null>(values.profilePhoto);
  const [coverPreview, setCoverPreview] = useState<string | null>(values.coverPhoto);

  useEffect(() => {
    return () => {
      if (profilePreview?.startsWith("blob:")) URL.revokeObjectURL(profilePreview);
      if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    };
  }, [profilePreview, coverPreview]);

  return (
    <form action={action} className="mt-8 space-y-5">
      <section className="rounded-lg border border-aodi-gold/35 bg-aodi-violet-950 p-5 text-white shadow-card sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[180px_1fr] lg:items-center">
          <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-aodi-gold bg-aodi-violet-900">
            {profilePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profilePreview} alt="Apercu" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-3xl text-aodi-gold-light">A</div>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aodi-gold-light">Photo de profil</p>
            <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-aodi-violet-900 transition hover:bg-aodi-cream">
              Ajouter une photo
              <input name="profilePhoto" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => {
                const file = event.target.files?.[0];
                setProfilePreview(file ? URL.createObjectURL(file) : values.profilePhoto);
              }} />
            </label>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-aodi-gold-light">Photo de couverture</p>
          <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-aodi-violet-900">
            {coverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverPreview} alt="Apercu couverture" className="h-36 w-full object-cover" />
            ) : (
              <div className="flex h-36 items-center justify-center text-sm text-aodi-cream/60">Background Bogolan AODI automatique</div>
            )}
          </div>
          <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-aodi-violet-900 transition hover:bg-aodi-cream">
            Ajouter une couverture
            <input name="coverPhoto" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => {
              const file = event.target.files?.[0];
              setCoverPreview(file ? URL.createObjectURL(file) : values.coverPhoto);
            }} />
          </label>
          <p className="mt-3 text-sm leading-relaxed text-aodi-cream/70">Les images sont stockees en fichiers, jamais en base64 dans PostgreSQL.</p>
        </div>
      </section>

      <Section title="Informations personnelles">
        <Field label="Prenom" name="firstName" required defaultValue={values.firstName} />
        <Field label="Nom" name="lastName" required defaultValue={values.lastName} />
        <div className="sm:col-span-2"><Field label="Nom affiche" name="displayName" required defaultValue={values.displayName} /></div>
      </Section>

      <Section title="Informations professionnelles">
        <Field label="Fonction" name="jobTitle" defaultValue={values.jobTitle} />
        <Field label="Entreprise" name="company" defaultValue={values.company} />
        <div className="sm:col-span-2"><TextArea label={"Pr\u00e9sentation"} name="bio" defaultValue={values.bio} /></div>
      </Section>

      <Section title="Contact">
        <Field label="Telephone" name="phone" defaultValue={values.phone} />
        <Field label="WhatsApp" name="whatsapp" defaultValue={values.whatsapp} />
        <Field label="E-mail" name="email" type="email" defaultValue={values.email} />
      </Section>

      <Section title="Reseaux">
        <Field label="Instagram" name="instagram" defaultValue={values.instagram} />
        <Field label="Snapchat" name="snapchat" defaultValue={values.snapchat} />
        <Field label="TikTok" name="tiktok" defaultValue={values.tiktok} />
        <Field label="Facebook" name="facebook" defaultValue={values.facebook} />
        <Field label="LinkedIn" name="linkedin" defaultValue={values.linkedin} />
      </Section>

      <Section title="Autres">
        <Field label="Site web" name="website" defaultValue={values.website} />
        <div className="sm:col-span-2"><TextArea label="Adresse" name="address" defaultValue={values.address} rows={3} /></div>
      </Section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-aodi-violet-900 px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-aodi-violet-800">{submitLabel}</button>
      </div>
    </form>
  );
}
