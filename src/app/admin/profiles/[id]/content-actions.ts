"use server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { FormError } from "@/lib/form-error";
import { deleteMedia, uploadMedia, type MediaFolder } from "@/lib/media-storage";
import { prisma } from "@/lib/prisma";
import { ProfileType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ContentKind = "products" | "services" | "projects" | "gallery" | "links" | "stats" | "music" | "events";
type SectionType = "SOCIALS" | "CONTACT" | "SERVICES" | "PRODUCTS" | "PROJECTS" | "GALLERY" | "CUSTOM_LINKS" | "MUSIC" | "EVENTS" | "STATS" | "ABOUT" | "CTA";

const SECTION_TYPES: SectionType[] = ["SOCIALS", "CONTACT", "SERVICES", "PRODUCTS", "PROJECTS", "GALLERY", "CUSTOM_LINKS", "MUSIC", "EVENTS", "STATS", "ABOUT", "CTA"];
const PROFILE_TYPES = new Set<ProfileType>(Object.values(ProfileType));
const IMAGE_POSITIONS = new Set(["center", "top", "bottom", "left", "right"]);

type ProfileRef = { id: string; slug: string };
type ImageIntent = { value?: string | null; shouldDeletePrevious: boolean; uploaded?: boolean };

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requiredString(formData: FormData, key: string, label: string): string {
  const value = optionalString(formData, key);
  if (!value) throw new FormError(`${label} est obligatoire.`);
  return value;
}

function checkbox(formData: FormData, key: string, defaultValue = false) {
  if (!formData.has(key)) return defaultValue;
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function optionalPrice(formData: FormData, key: string, label: string): number | null {
  const raw = optionalString(formData, key);
  if (!raw) return null;
  const normalized = raw.replace(/[^0-9]/g, "");
  const value = Number.parseInt(normalized, 10);
  if (!Number.isFinite(value) || value < 0) throw new FormError(`${label} doit etre un nombre positif.`);
  return value;
}

function requiredPrice(formData: FormData, key: string, label: string): number {
  const value = optionalPrice(formData, key, label);
  if (value === null) throw new FormError(`${label} est obligatoire.`);
  return value;
}

function integer(formData: FormData, key: string) {
  const raw = optionalString(formData, key);
  if (!raw) return 0;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value)) throw new FormError("L'ordre d'affichage doit etre un nombre entier.");
  return value;
}

function optionalUrl(formData: FormData, key: string, label: string): string | null {
  const raw = optionalString(formData, key);
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new FormError(`${label} doit etre une URL valide.`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new FormError(`${label} doit commencer par http:// ou https://.`);
  }
  return url.toString();
}


function profileTypeValue(formData: FormData): ProfileType {
  const value = optionalString(formData, "profileType") ?? ProfileType.GENERAL;
  if (!PROFILE_TYPES.has(value as ProfileType)) throw new FormError("Type d experience non autorise.");
  return value as ProfileType;
}

function tagsValue(formData: FormData) {
  const value = optionalString(formData, "tags");
  if (!value) return [];
  return value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 6);
}

function imagePositionValue(formData: FormData, key: string) {
  const value = optionalString(formData, key) ?? "center";
  if (!IMAGE_POSITIONS.has(value)) throw new FormError("Position d image non autorisee.");
  return value;
}

function optionalDate(formData: FormData, key: string, label: string): Date | null {
  const raw = optionalString(formData, key);
  if (!raw) return null;
  const value = new Date(raw);
  if (Number.isNaN(value.getTime())) throw new FormError(`${label} doit etre une date valide.`);
  return value;
}

function requiredDate(formData: FormData, key: string, label: string): Date {
  const value = optionalDate(formData, key, label);
  if (!value) throw new FormError(`${label} est obligatoire.`);
  return value;
}
function cleanWhatsApp(formData: FormData, key: string) {
  const value = optionalString(formData, key);
  if (!value) return null;
  const cleaned = value.replace(/[^0-9]/g, "");
  return cleaned.length > 0 ? cleaned : null;
}

function wantsImageRemoval(formData: FormData) {
  return formData.get("removeImage") === "true";
}

async function readImageIntent(formData: FormData, key: string, folder: MediaFolder): Promise<ImageIntent> {
  const file = formData.get(key);
  if (file instanceof File && file.size > 0) {
    return { value: await uploadMedia(file, folder), shouldDeletePrevious: true, uploaded: true };
  }

  if (wantsImageRemoval(formData)) {
    return { value: null, shouldDeletePrevious: true };
  }

  const externalUrl = optionalUrl(formData, "imageUrl", "L'URL image");
  if (externalUrl) {
    return { value: externalUrl, shouldDeletePrevious: true };
  }

  return { shouldDeletePrevious: false };
}

function applyImageUpdate(image: ImageIntent) {
  return image.value !== undefined ? { imageUrl: image.value } : {};
}

function applyRequiredImageUpdate(image: ImageIntent) {
  return typeof image.value === "string" ? { imageUrl: image.value } : {};
}

// Si l'ecriture en base echoue (validation, erreur Prisma), l'image qui vient d'etre stockee est supprimee : pas de fichier orphelin.
async function persistWithImage<T>(image: ImageIntent, write: () => Promise<T>): Promise<T> {
  try {
    return await write();
  } catch (error) {
    if (image.uploaded && typeof image.value === "string") await deleteMedia(image.value).catch(() => undefined);
    throw error;
  }
}

async function deletePreviousImageIfNeeded(previousUrl: string | null, image: ImageIntent) {
  if (!image.shouldDeletePrevious || image.value === previousUrl) return;
  await deleteMedia(previousUrl);
}

async function requireProfile(profileId: string): Promise<ProfileRef> {
  await requireAdminAccess();
  const profile = await prisma.profile.findUnique({ where: { id: profileId }, select: { id: true, slug: true } });
  if (!profile) throw new FormError("Profil introuvable.");
  return profile;
}

function revalidateProfile(profile: ProfileRef) {
  revalidatePath("/admin");
  revalidatePath("/admin/profiles");
  revalidatePath(`/admin/profiles/${profile.id}`);
  revalidatePath(`/admin/profiles/${profile.id}/products`);
  revalidatePath(`/admin/profiles/${profile.id}/services`);
  revalidatePath(`/admin/profiles/${profile.id}/projects`);
  revalidatePath(`/admin/profiles/${profile.id}/gallery`);
  revalidatePath(`/admin/profiles/${profile.id}/links`);
  revalidatePath(`/admin/profiles/${profile.id}/stats`);
  revalidatePath(`/admin/profiles/${profile.id}/music`);
  revalidatePath(`/admin/profiles/${profile.id}/events`);
  revalidatePath(`/admin/profiles/${profile.id}/config`);
  revalidatePath(`/${profile.slug}`);
}

function redirectTo(profileId: string, kind: ContentKind) {
  redirect(`/admin/profiles/${profileId}/${kind}`);
}

async function ensureProduct(profileId: string, productId: string) {
  const item = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, profileId: true, imageUrl: true } });
  if (!item || item.profileId !== profileId) throw new FormError("Produit introuvable pour ce profil.");
  return item;
}

async function ensureService(profileId: string, serviceId: string) {
  const item = await prisma.service.findUnique({ where: { id: serviceId }, select: { id: true, profileId: true, imageUrl: true } });
  if (!item || item.profileId !== profileId) throw new FormError("Service introuvable pour ce profil.");
  return item;
}

async function ensureProject(profileId: string, projectId: string) {
  const item = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, profileId: true, imageUrl: true } });
  if (!item || item.profileId !== profileId) throw new FormError("Projet introuvable pour ce profil.");
  return item;
}

async function ensureGalleryItem(profileId: string, galleryItemId: string) {
  const item = await prisma.galleryItem.findUnique({ where: { id: galleryItemId }, select: { id: true, profileId: true, imageUrl: true } });
  if (!item || item.profileId !== profileId) throw new FormError("Image introuvable pour ce profil.");
  return item;
}

async function ensureCustomLink(profileId: string, customLinkId: string) {
  const item = await prisma.customLink.findUnique({ where: { id: customLinkId }, select: { id: true, profileId: true } });
  if (!item || item.profileId !== profileId) throw new FormError("Lien introuvable pour ce profil.");
}

export async function createProductAction(profileId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const image = await readImageIntent(formData, "image", "products");
  await persistWithImage(image, () => prisma.product.create({
    data: {
      profileId: profile.id,
      name: requiredString(formData, "name", "Le nom du produit"),
      description: optionalString(formData, "description"),
      price: requiredPrice(formData, "price", "Le prix"),
      oldPrice: optionalPrice(formData, "oldPrice", "L'ancien prix"),
      currency: optionalString(formData, "currency") ?? "FCFA",
      imageUrl: image.value ?? null,
      whatsappNumber: cleanWhatsApp(formData, "whatsappNumber"),
      orderUrl: optionalUrl(formData, "orderUrl", "L'URL de commande"),
      isVisible: checkbox(formData, "isVisible", true),
      isFeatured: checkbox(formData, "isFeatured"),
      isAvailable: checkbox(formData, "isAvailable", true),
      displayOrder: integer(formData, "displayOrder"),
    },
  }));
  revalidateProfile(profile);
  redirectTo(profile.id, "products");
}

export async function updateProductAction(profileId: string, productId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const previous = await ensureProduct(profile.id, productId);
  const image = await readImageIntent(formData, "image", "products");
  await persistWithImage(image, () => prisma.product.update({
    where: { id: productId },
    data: {
      name: requiredString(formData, "name", "Le nom du produit"),
      description: optionalString(formData, "description"),
      price: requiredPrice(formData, "price", "Le prix"),
      oldPrice: optionalPrice(formData, "oldPrice", "L'ancien prix"),
      currency: optionalString(formData, "currency") ?? "FCFA",
      ...applyImageUpdate(image),
      whatsappNumber: cleanWhatsApp(formData, "whatsappNumber"),
      orderUrl: optionalUrl(formData, "orderUrl", "L'URL de commande"),
      isVisible: checkbox(formData, "isVisible"),
      isFeatured: checkbox(formData, "isFeatured"),
      isAvailable: checkbox(formData, "isAvailable"),
      displayOrder: integer(formData, "displayOrder"),
    },
  }));
  await deletePreviousImageIfNeeded(previous.imageUrl, image);
  revalidateProfile(profile);
  redirectTo(profile.id, "products");
}

export async function deleteProductAction(profileId: string, productId: string) {
  const profile = await requireProfile(profileId);
  const previous = await ensureProduct(profile.id, productId);
  await prisma.product.delete({ where: { id: productId } });
  await deleteMedia(previous.imageUrl);
  revalidateProfile(profile);
}

export async function toggleProductVisibleAction(profileId: string, productId: string) {
  const profile = await requireProfile(profileId);
  const item = await prisma.product.findUnique({ where: { id: productId }, select: { profileId: true, isVisible: true } });
  if (!item || item.profileId !== profile.id) throw new FormError("Produit introuvable pour ce profil.");
  await prisma.product.update({ where: { id: productId }, data: { isVisible: !item.isVisible } });
  revalidateProfile(profile);
}

export async function toggleProductAvailableAction(profileId: string, productId: string) {
  const profile = await requireProfile(profileId);
  const item = await prisma.product.findUnique({ where: { id: productId }, select: { profileId: true, isAvailable: true } });
  if (!item || item.profileId !== profile.id) throw new FormError("Produit introuvable pour ce profil.");
  await prisma.product.update({ where: { id: productId }, data: { isAvailable: !item.isAvailable } });
  revalidateProfile(profile);
}

export async function toggleProductFeaturedAction(profileId: string, productId: string) {
  const profile = await requireProfile(profileId);
  const item = await prisma.product.findUnique({ where: { id: productId }, select: { profileId: true, isFeatured: true } });
  if (!item || item.profileId !== profile.id) throw new FormError("Produit introuvable pour ce profil.");
  await prisma.product.update({ where: { id: productId }, data: { isFeatured: !item.isFeatured } });
  revalidateProfile(profile);
}

export async function createServiceAction(profileId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const image = await readImageIntent(formData, "image", "services");
  await persistWithImage(image, () => prisma.service.create({ data: { profileId: profile.id, name: requiredString(formData, "name", "Le nom du service"), description: optionalString(formData, "description"), price: optionalPrice(formData, "price", "Le prix"), currency: optionalString(formData, "currency"), imageUrl: image.value ?? null, ctaLabel: optionalString(formData, "ctaLabel"), ctaUrl: optionalUrl(formData, "ctaUrl", "L'URL du bouton"), isVisible: checkbox(formData, "isVisible", true), displayOrder: integer(formData, "displayOrder") } }));
  revalidateProfile(profile);
  redirectTo(profile.id, "services");
}

export async function updateServiceAction(profileId: string, serviceId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const previous = await ensureService(profile.id, serviceId);
  const image = await readImageIntent(formData, "image", "services");
  await persistWithImage(image, () => prisma.service.update({ where: { id: serviceId }, data: { name: requiredString(formData, "name", "Le nom du service"), description: optionalString(formData, "description"), price: optionalPrice(formData, "price", "Le prix"), currency: optionalString(formData, "currency"), ...applyImageUpdate(image), ctaLabel: optionalString(formData, "ctaLabel"), ctaUrl: optionalUrl(formData, "ctaUrl", "L'URL du bouton"), isVisible: checkbox(formData, "isVisible"), displayOrder: integer(formData, "displayOrder") } }));
  await deletePreviousImageIfNeeded(previous.imageUrl, image);
  revalidateProfile(profile);
  redirectTo(profile.id, "services");
}

export async function deleteServiceAction(profileId: string, serviceId: string) {
  const profile = await requireProfile(profileId);
  const previous = await ensureService(profile.id, serviceId);
  await prisma.service.delete({ where: { id: serviceId } });
  await deleteMedia(previous.imageUrl);
  revalidateProfile(profile);
}

export async function toggleServiceVisibleAction(profileId: string, serviceId: string) {
  const profile = await requireProfile(profileId);
  const item = await prisma.service.findUnique({ where: { id: serviceId }, select: { profileId: true, isVisible: true } });
  if (!item || item.profileId !== profile.id) throw new FormError("Service introuvable pour ce profil.");
  await prisma.service.update({ where: { id: serviceId }, data: { isVisible: !item.isVisible } });
  revalidateProfile(profile);
}

export async function createProjectAction(profileId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const image = await readImageIntent(formData, "image", "projects");
  await persistWithImage(image, () => prisma.project.create({ data: { profileId: profile.id, title: requiredString(formData, "title", "Le titre du projet"), description: optionalString(formData, "description"), imageUrl: image.value ?? null, websiteUrl: optionalUrl(formData, "websiteUrl", "Le lien du site"), appUrl: optionalUrl(formData, "appUrl", "Le lien de l'application"), githubUrl: optionalUrl(formData, "githubUrl", "Le lien GitHub"), technologies: optionalString(formData, "technologies"), isVisible: checkbox(formData, "isVisible", true), isFeatured: checkbox(formData, "isFeatured"), displayOrder: integer(formData, "displayOrder") } }));
  revalidateProfile(profile);
  redirectTo(profile.id, "projects");
}

export async function updateProjectAction(profileId: string, projectId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const previous = await ensureProject(profile.id, projectId);
  const image = await readImageIntent(formData, "image", "projects");
  await persistWithImage(image, () => prisma.project.update({ where: { id: projectId }, data: { title: requiredString(formData, "title", "Le titre du projet"), description: optionalString(formData, "description"), ...applyImageUpdate(image), websiteUrl: optionalUrl(formData, "websiteUrl", "Le lien du site"), appUrl: optionalUrl(formData, "appUrl", "Le lien de l'application"), githubUrl: optionalUrl(formData, "githubUrl", "Le lien GitHub"), technologies: optionalString(formData, "technologies"), isVisible: checkbox(formData, "isVisible"), isFeatured: checkbox(formData, "isFeatured"), displayOrder: integer(formData, "displayOrder") } }));
  await deletePreviousImageIfNeeded(previous.imageUrl, image);
  revalidateProfile(profile);
  redirectTo(profile.id, "projects");
}

export async function deleteProjectAction(profileId: string, projectId: string) {
  const profile = await requireProfile(profileId);
  const previous = await ensureProject(profile.id, projectId);
  await prisma.project.delete({ where: { id: projectId } });
  await deleteMedia(previous.imageUrl);
  revalidateProfile(profile);
}

export async function toggleProjectVisibleAction(profileId: string, projectId: string) {
  const profile = await requireProfile(profileId);
  const item = await prisma.project.findUnique({ where: { id: projectId }, select: { profileId: true, isVisible: true } });
  if (!item || item.profileId !== profile.id) throw new FormError("Projet introuvable pour ce profil.");
  await prisma.project.update({ where: { id: projectId }, data: { isVisible: !item.isVisible } });
  revalidateProfile(profile);
}

export async function toggleProjectFeaturedAction(profileId: string, projectId: string) {
  const profile = await requireProfile(profileId);
  const item = await prisma.project.findUnique({ where: { id: projectId }, select: { profileId: true, isFeatured: true } });
  if (!item || item.profileId !== profile.id) throw new FormError("Projet introuvable pour ce profil.");
  await prisma.project.update({ where: { id: projectId }, data: { isFeatured: !item.isFeatured } });
  revalidateProfile(profile);
}

export async function createGalleryItemAction(profileId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const image = await readImageIntent(formData, "image", "gallery");
  const imageUrl = image.value;
  if (!imageUrl) throw new FormError("Une image est obligatoire pour la galerie.");
  await persistWithImage(image, () => prisma.galleryItem.create({ data: { profileId: profile.id, title: optionalString(formData, "title"), imageUrl, description: optionalString(formData, "description"), isVisible: checkbox(formData, "isVisible", true), displayOrder: integer(formData, "displayOrder") } }));
  revalidateProfile(profile);
  redirectTo(profile.id, "gallery");
}

export async function updateGalleryItemAction(profileId: string, galleryItemId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const previous = await ensureGalleryItem(profile.id, galleryItemId);
  const image = await readImageIntent(formData, "image", "gallery");
  if (image.value === null) throw new FormError("Une image est obligatoire pour la galerie.");
  await persistWithImage(image, () => prisma.galleryItem.update({ where: { id: galleryItemId }, data: { title: optionalString(formData, "title"), ...applyRequiredImageUpdate(image), description: optionalString(formData, "description"), isVisible: checkbox(formData, "isVisible"), displayOrder: integer(formData, "displayOrder") } }));
  await deletePreviousImageIfNeeded(previous.imageUrl, image);
  revalidateProfile(profile);
  redirectTo(profile.id, "gallery");
}

export async function deleteGalleryItemAction(profileId: string, galleryItemId: string) {
  const profile = await requireProfile(profileId);
  const previous = await ensureGalleryItem(profile.id, galleryItemId);
  await prisma.galleryItem.delete({ where: { id: galleryItemId } });
  await deleteMedia(previous.imageUrl);
  revalidateProfile(profile);
}

export async function toggleGalleryItemVisibleAction(profileId: string, galleryItemId: string) {
  const profile = await requireProfile(profileId);
  const item = await prisma.galleryItem.findUnique({ where: { id: galleryItemId }, select: { profileId: true, isVisible: true } });
  if (!item || item.profileId !== profile.id) throw new FormError("Image introuvable pour ce profil.");
  await prisma.galleryItem.update({ where: { id: galleryItemId }, data: { isVisible: !item.isVisible } });
  revalidateProfile(profile);
}

export async function createCustomLinkAction(profileId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  await prisma.customLink.create({ data: { profileId: profile.id, label: requiredString(formData, "label", "Le libelle"), url: optionalUrl(formData, "url", "L'URL") ?? "", icon: optionalString(formData, "icon"), isVisible: checkbox(formData, "isVisible", true), displayOrder: integer(formData, "displayOrder") } });
  revalidateProfile(profile);
  redirectTo(profile.id, "links");
}

export async function updateCustomLinkAction(profileId: string, customLinkId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  await ensureCustomLink(profile.id, customLinkId);
  await prisma.customLink.update({ where: { id: customLinkId }, data: { label: requiredString(formData, "label", "Le libelle"), url: optionalUrl(formData, "url", "L'URL") ?? "", icon: optionalString(formData, "icon"), isVisible: checkbox(formData, "isVisible"), displayOrder: integer(formData, "displayOrder") } });
  revalidateProfile(profile);
  redirectTo(profile.id, "links");
}

export async function deleteCustomLinkAction(profileId: string, customLinkId: string) {
  const profile = await requireProfile(profileId);
  await ensureCustomLink(profile.id, customLinkId);
  await prisma.customLink.delete({ where: { id: customLinkId } });
  revalidateProfile(profile);
}

export async function toggleCustomLinkVisibleAction(profileId: string, customLinkId: string) {
  const profile = await requireProfile(profileId);
  const item = await prisma.customLink.findUnique({ where: { id: customLinkId }, select: { profileId: true, isVisible: true } });
  if (!item || item.profileId !== profile.id) throw new FormError("Lien introuvable pour ce profil.");
  await prisma.customLink.update({ where: { id: customLinkId }, data: { isVisible: !item.isVisible } });
  revalidateProfile(profile);
}


function sectionType(value: string): SectionType {
  if (!SECTION_TYPES.includes(value as SectionType)) {
    throw new FormError("Module de profil non autorise.");
  }
  return value as SectionType;
}

export async function updateProfileSectionsAction(profileId: string, formData: FormData) {
  const profile = await requireProfile(profileId);

  for (const rawType of SECTION_TYPES) {
    const type = sectionType(rawType);
    const enabled = checkbox(formData, `${type}.enabled`);
    const sortOrder = integer(formData, `${type}.sortOrder`);
    const title = optionalString(formData, `${type}.title`);
    const id = crypto.randomUUID();

    await prisma.$executeRaw`
      INSERT INTO "ProfileSection" ("id", "profileId", "type", "enabled", "sortOrder", "title", "config", "createdAt", "updatedAt")
      VALUES (${id}, ${profile.id}, CAST(${type} AS "ProfileSectionType"), ${enabled}, ${sortOrder}, ${title}, NULL, NOW(), NOW())
      ON CONFLICT ("profileId", "type") DO UPDATE SET
        "enabled" = EXCLUDED."enabled",
        "sortOrder" = EXCLUDED."sortOrder",
        "title" = EXCLUDED."title",
        "updatedAt" = NOW()
    `;
  }

  revalidateProfile(profile);
  redirect(`/admin/profiles/${profile.id}/config`);
}


export async function updateProfileExperienceAction(profileId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      profileType: profileTypeValue(formData),
      tagline: optionalString(formData, "tagline"),
      tags: tagsValue(formData),
      appointmentUrl: optionalUrl(formData, "appointmentUrl", "L'URL rendez-vous"),
      finalCtaLabel: optionalString(formData, "finalCtaLabel"),
      finalCtaUrl: optionalUrl(formData, "finalCtaUrl", "L'URL du CTA final"),
      heroImagePosition: imagePositionValue(formData, "heroImagePosition"),
      coverImagePosition: imagePositionValue(formData, "coverImagePosition"),
    },
  });

  revalidateProfile(profile);
  redirect(`/admin/profiles/${profile.id}/config`);
}
async function ensureStat(profileId: string, statId: string) {
  const item = await prisma.profileStat.findUnique({ where: { id: statId }, select: { id: true, profileId: true } });
  if (!item || item.profileId !== profileId) throw new FormError("Statistique introuvable pour ce profil.");
}

async function ensureMusicTrack(profileId: string, trackId: string) {
  const item = await prisma.musicTrack.findUnique({ where: { id: trackId }, select: { id: true, profileId: true, coverUrl: true } });
  if (!item || item.profileId !== profileId) throw new FormError("Musique introuvable pour ce profil.");
  return item;
}

async function ensureEvent(profileId: string, eventId: string) {
  const item = await prisma.profileEvent.findUnique({ where: { id: eventId }, select: { id: true, profileId: true, imageUrl: true } });
  if (!item || item.profileId !== profileId) throw new FormError("Evenement introuvable pour ce profil.");
  return item;
}

export async function createStatAction(profileId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  await prisma.profileStat.create({ data: { profileId: profile.id, value: requiredString(formData, "value", "La valeur"), label: requiredString(formData, "label", "Le libelle"), icon: optionalString(formData, "icon"), sortOrder: integer(formData, "sortOrder"), isVisible: checkbox(formData, "isVisible", true) } });
  revalidateProfile(profile);
  redirectTo(profile.id, "stats");
}

export async function updateStatAction(profileId: string, statId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  await ensureStat(profile.id, statId);
  await prisma.profileStat.update({ where: { id: statId }, data: { value: requiredString(formData, "value", "La valeur"), label: requiredString(formData, "label", "Le libelle"), icon: optionalString(formData, "icon"), sortOrder: integer(formData, "sortOrder"), isVisible: checkbox(formData, "isVisible") } });
  revalidateProfile(profile);
  redirectTo(profile.id, "stats");
}

export async function deleteStatAction(profileId: string, statId: string) {
  const profile = await requireProfile(profileId);
  await ensureStat(profile.id, statId);
  await prisma.profileStat.delete({ where: { id: statId } });
  revalidateProfile(profile);
}

export async function toggleStatVisibleAction(profileId: string, statId: string) {
  const profile = await requireProfile(profileId);
  const item = await prisma.profileStat.findUnique({ where: { id: statId }, select: { profileId: true, isVisible: true } });
  if (!item || item.profileId !== profile.id) throw new FormError("Statistique introuvable pour ce profil.");
  await prisma.profileStat.update({ where: { id: statId }, data: { isVisible: !item.isVisible } });
  revalidateProfile(profile);
}

export async function createMusicTrackAction(profileId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const cover = await readImageIntent(formData, "image", "music");
  await persistWithImage(cover, () => prisma.musicTrack.create({ data: { profileId: profile.id, title: requiredString(formData, "title", "Le titre"), artist: optionalString(formData, "artist"), coverUrl: cover.value ?? null, audioUrl: optionalUrl(formData, "audioUrl", "L'URL audio"), spotifyUrl: optionalUrl(formData, "spotifyUrl", "L'URL Spotify"), appleUrl: optionalUrl(formData, "appleUrl", "L'URL Apple Music"), youtubeUrl: optionalUrl(formData, "youtubeUrl", "L'URL YouTube"), duration: optionalString(formData, "duration"), releaseDate: optionalDate(formData, "releaseDate", "La date de sortie"), isFeatured: checkbox(formData, "isFeatured"), isVisible: checkbox(formData, "isVisible", true), sortOrder: integer(formData, "sortOrder") } }));
  revalidateProfile(profile);
  redirectTo(profile.id, "music");
}

export async function updateMusicTrackAction(profileId: string, trackId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const previous = await ensureMusicTrack(profile.id, trackId);
  const cover = await readImageIntent(formData, "image", "music");
  await persistWithImage(cover, () => prisma.musicTrack.update({ where: { id: trackId }, data: { title: requiredString(formData, "title", "Le titre"), artist: optionalString(formData, "artist"), ...(cover.value !== undefined ? { coverUrl: cover.value } : {}), audioUrl: optionalUrl(formData, "audioUrl", "L'URL audio"), spotifyUrl: optionalUrl(formData, "spotifyUrl", "L'URL Spotify"), appleUrl: optionalUrl(formData, "appleUrl", "L'URL Apple Music"), youtubeUrl: optionalUrl(formData, "youtubeUrl", "L'URL YouTube"), duration: optionalString(formData, "duration"), releaseDate: optionalDate(formData, "releaseDate", "La date de sortie"), isFeatured: checkbox(formData, "isFeatured"), isVisible: checkbox(formData, "isVisible"), sortOrder: integer(formData, "sortOrder") } }));
  await deletePreviousImageIfNeeded(previous.coverUrl, cover);
  revalidateProfile(profile);
  redirectTo(profile.id, "music");
}

export async function deleteMusicTrackAction(profileId: string, trackId: string) {
  const profile = await requireProfile(profileId);
  const previous = await ensureMusicTrack(profile.id, trackId);
  await prisma.musicTrack.delete({ where: { id: trackId } });
  await deleteMedia(previous.coverUrl);
  revalidateProfile(profile);
}

export async function toggleMusicTrackVisibleAction(profileId: string, trackId: string) {
  const profile = await requireProfile(profileId);
  const item = await prisma.musicTrack.findUnique({ where: { id: trackId }, select: { profileId: true, isVisible: true } });
  if (!item || item.profileId !== profile.id) throw new FormError("Musique introuvable pour ce profil.");
  await prisma.musicTrack.update({ where: { id: trackId }, data: { isVisible: !item.isVisible } });
  revalidateProfile(profile);
}

export async function createEventAction(profileId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const image = await readImageIntent(formData, "image", "events");
  await persistWithImage(image, () => prisma.profileEvent.create({ data: { profileId: profile.id, title: requiredString(formData, "title", "Le titre"), description: optionalString(formData, "description"), location: optionalString(formData, "location"), startDate: requiredDate(formData, "startDate", "La date de debut"), endDate: optionalDate(formData, "endDate", "La date de fin"), externalUrl: optionalUrl(formData, "externalUrl", "L'URL de reservation"), imageUrl: image.value ?? null, isVisible: checkbox(formData, "isVisible", true), sortOrder: integer(formData, "sortOrder") } }));
  revalidateProfile(profile);
  redirectTo(profile.id, "events");
}

export async function updateEventAction(profileId: string, eventId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const previous = await ensureEvent(profile.id, eventId);
  const image = await readImageIntent(formData, "image", "events");
  await persistWithImage(image, () => prisma.profileEvent.update({ where: { id: eventId }, data: { title: requiredString(formData, "title", "Le titre"), description: optionalString(formData, "description"), location: optionalString(formData, "location"), startDate: requiredDate(formData, "startDate", "La date de debut"), endDate: optionalDate(formData, "endDate", "La date de fin"), externalUrl: optionalUrl(formData, "externalUrl", "L'URL de reservation"), ...(image.value !== undefined ? { imageUrl: image.value } : {}), isVisible: checkbox(formData, "isVisible"), sortOrder: integer(formData, "sortOrder") } }));
  await deletePreviousImageIfNeeded(previous.imageUrl, image);
  revalidateProfile(profile);
  redirectTo(profile.id, "events");
}

export async function deleteEventAction(profileId: string, eventId: string) {
  const profile = await requireProfile(profileId);
  const previous = await ensureEvent(profile.id, eventId);
  await prisma.profileEvent.delete({ where: { id: eventId } });
  await deleteMedia(previous.imageUrl);
  revalidateProfile(profile);
}

export async function toggleEventVisibleAction(profileId: string, eventId: string) {
  const profile = await requireProfile(profileId);
  const item = await prisma.profileEvent.findUnique({ where: { id: eventId }, select: { profileId: true, isVisible: true } });
  if (!item || item.profileId !== profile.id) throw new FormError("Evenement introuvable pour ce profil.");
  await prisma.profileEvent.update({ where: { id: eventId }, data: { isVisible: !item.isVisible } });
  revalidateProfile(profile);
}