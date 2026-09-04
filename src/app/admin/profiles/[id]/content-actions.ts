"use server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { deleteMedia, uploadMedia, type MediaFolder } from "@/lib/media-storage";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ContentKind = "products" | "services" | "projects" | "gallery" | "links";

type ProfileRef = { id: string; slug: string };
type ImageIntent = { value?: string | null; shouldDeletePrevious: boolean };

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

function checkbox(formData: FormData, key: string, defaultValue = false) {
  if (!formData.has(key)) return defaultValue;
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function optionalPrice(formData: FormData, key: string, label: string): number | null {
  const raw = optionalString(formData, key);
  if (!raw) return null;
  const normalized = raw.replace(/[^0-9]/g, "");
  const value = Number.parseInt(normalized, 10);
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} doit etre un nombre positif.`);
  return value;
}

function requiredPrice(formData: FormData, key: string, label: string): number {
  const value = optionalPrice(formData, key, label);
  if (value === null) throw new Error(`${label} est obligatoire.`);
  return value;
}

function integer(formData: FormData, key: string) {
  const raw = optionalString(formData, key);
  if (!raw) return 0;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value)) throw new Error("L'ordre d'affichage doit etre un nombre entier.");
  return value;
}

function optionalUrl(formData: FormData, key: string, label: string): string | null {
  const raw = optionalString(formData, key);
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${label} doit etre une URL valide.`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${label} doit commencer par http:// ou https://.`);
  }
  return url.toString();
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
    return { value: await uploadMedia(file, folder), shouldDeletePrevious: true };
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

async function deletePreviousImageIfNeeded(previousUrl: string | null, image: ImageIntent) {
  if (!image.shouldDeletePrevious || image.value === previousUrl) return;
  await deleteMedia(previousUrl);
}

async function requireProfile(profileId: string): Promise<ProfileRef> {
  await requireAdminAccess();
  const profile = await prisma.profile.findUnique({ where: { id: profileId }, select: { id: true, slug: true } });
  if (!profile) throw new Error("Profil introuvable.");
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
  revalidatePath(`/${profile.slug}`);
}

function redirectTo(profileId: string, kind: ContentKind) {
  redirect(`/admin/profiles/${profileId}/${kind}`);
}

async function ensureProduct(profileId: string, productId: string) {
  const item = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, profileId: true, imageUrl: true } });
  if (!item || item.profileId !== profileId) throw new Error("Produit introuvable pour ce profil.");
  return item;
}

async function ensureService(profileId: string, serviceId: string) {
  const item = await prisma.service.findUnique({ where: { id: serviceId }, select: { id: true, profileId: true, imageUrl: true } });
  if (!item || item.profileId !== profileId) throw new Error("Service introuvable pour ce profil.");
  return item;
}

async function ensureProject(profileId: string, projectId: string) {
  const item = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, profileId: true, imageUrl: true } });
  if (!item || item.profileId !== profileId) throw new Error("Projet introuvable pour ce profil.");
  return item;
}

async function ensureGalleryItem(profileId: string, galleryItemId: string) {
  const item = await prisma.galleryItem.findUnique({ where: { id: galleryItemId }, select: { id: true, profileId: true, imageUrl: true } });
  if (!item || item.profileId !== profileId) throw new Error("Image introuvable pour ce profil.");
  return item;
}

async function ensureCustomLink(profileId: string, customLinkId: string) {
  const item = await prisma.customLink.findUnique({ where: { id: customLinkId }, select: { id: true, profileId: true } });
  if (!item || item.profileId !== profileId) throw new Error("Lien introuvable pour ce profil.");
}

export async function createProductAction(profileId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const image = await readImageIntent(formData, "image", "products");
  await prisma.product.create({
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
  });
  revalidateProfile(profile);
  redirectTo(profile.id, "products");
}

export async function updateProductAction(profileId: string, productId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const previous = await ensureProduct(profile.id, productId);
  const image = await readImageIntent(formData, "image", "products");
  await prisma.product.update({
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
  });
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
  if (!item || item.profileId !== profile.id) throw new Error("Produit introuvable pour ce profil.");
  await prisma.product.update({ where: { id: productId }, data: { isVisible: !item.isVisible } });
  revalidateProfile(profile);
}

export async function toggleProductAvailableAction(profileId: string, productId: string) {
  const profile = await requireProfile(profileId);
  const item = await prisma.product.findUnique({ where: { id: productId }, select: { profileId: true, isAvailable: true } });
  if (!item || item.profileId !== profile.id) throw new Error("Produit introuvable pour ce profil.");
  await prisma.product.update({ where: { id: productId }, data: { isAvailable: !item.isAvailable } });
  revalidateProfile(profile);
}

export async function toggleProductFeaturedAction(profileId: string, productId: string) {
  const profile = await requireProfile(profileId);
  const item = await prisma.product.findUnique({ where: { id: productId }, select: { profileId: true, isFeatured: true } });
  if (!item || item.profileId !== profile.id) throw new Error("Produit introuvable pour ce profil.");
  await prisma.product.update({ where: { id: productId }, data: { isFeatured: !item.isFeatured } });
  revalidateProfile(profile);
}

export async function createServiceAction(profileId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const image = await readImageIntent(formData, "image", "services");
  await prisma.service.create({ data: { profileId: profile.id, name: requiredString(formData, "name", "Le nom du service"), description: optionalString(formData, "description"), price: optionalPrice(formData, "price", "Le prix"), currency: optionalString(formData, "currency"), imageUrl: image.value ?? null, ctaLabel: optionalString(formData, "ctaLabel"), ctaUrl: optionalUrl(formData, "ctaUrl", "L'URL du bouton"), isVisible: checkbox(formData, "isVisible", true), displayOrder: integer(formData, "displayOrder") } });
  revalidateProfile(profile);
  redirectTo(profile.id, "services");
}

export async function updateServiceAction(profileId: string, serviceId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const previous = await ensureService(profile.id, serviceId);
  const image = await readImageIntent(formData, "image", "services");
  await prisma.service.update({ where: { id: serviceId }, data: { name: requiredString(formData, "name", "Le nom du service"), description: optionalString(formData, "description"), price: optionalPrice(formData, "price", "Le prix"), currency: optionalString(formData, "currency"), ...applyImageUpdate(image), ctaLabel: optionalString(formData, "ctaLabel"), ctaUrl: optionalUrl(formData, "ctaUrl", "L'URL du bouton"), isVisible: checkbox(formData, "isVisible"), displayOrder: integer(formData, "displayOrder") } });
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
  if (!item || item.profileId !== profile.id) throw new Error("Service introuvable pour ce profil.");
  await prisma.service.update({ where: { id: serviceId }, data: { isVisible: !item.isVisible } });
  revalidateProfile(profile);
}

export async function createProjectAction(profileId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const image = await readImageIntent(formData, "image", "projects");
  await prisma.project.create({ data: { profileId: profile.id, title: requiredString(formData, "title", "Le titre du projet"), description: optionalString(formData, "description"), imageUrl: image.value ?? null, websiteUrl: optionalUrl(formData, "websiteUrl", "Le lien du site"), appUrl: optionalUrl(formData, "appUrl", "Le lien de l'application"), githubUrl: optionalUrl(formData, "githubUrl", "Le lien GitHub"), technologies: optionalString(formData, "technologies"), isVisible: checkbox(formData, "isVisible", true), isFeatured: checkbox(formData, "isFeatured"), displayOrder: integer(formData, "displayOrder") } });
  revalidateProfile(profile);
  redirectTo(profile.id, "projects");
}

export async function updateProjectAction(profileId: string, projectId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const previous = await ensureProject(profile.id, projectId);
  const image = await readImageIntent(formData, "image", "projects");
  await prisma.project.update({ where: { id: projectId }, data: { title: requiredString(formData, "title", "Le titre du projet"), description: optionalString(formData, "description"), ...applyImageUpdate(image), websiteUrl: optionalUrl(formData, "websiteUrl", "Le lien du site"), appUrl: optionalUrl(formData, "appUrl", "Le lien de l'application"), githubUrl: optionalUrl(formData, "githubUrl", "Le lien GitHub"), technologies: optionalString(formData, "technologies"), isVisible: checkbox(formData, "isVisible"), isFeatured: checkbox(formData, "isFeatured"), displayOrder: integer(formData, "displayOrder") } });
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
  if (!item || item.profileId !== profile.id) throw new Error("Projet introuvable pour ce profil.");
  await prisma.project.update({ where: { id: projectId }, data: { isVisible: !item.isVisible } });
  revalidateProfile(profile);
}

export async function toggleProjectFeaturedAction(profileId: string, projectId: string) {
  const profile = await requireProfile(profileId);
  const item = await prisma.project.findUnique({ where: { id: projectId }, select: { profileId: true, isFeatured: true } });
  if (!item || item.profileId !== profile.id) throw new Error("Projet introuvable pour ce profil.");
  await prisma.project.update({ where: { id: projectId }, data: { isFeatured: !item.isFeatured } });
  revalidateProfile(profile);
}

export async function createGalleryItemAction(profileId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const image = await readImageIntent(formData, "image", "gallery");
  if (!image.value) throw new Error("Une image est obligatoire pour la galerie.");
  await prisma.galleryItem.create({ data: { profileId: profile.id, title: optionalString(formData, "title"), imageUrl: image.value, description: optionalString(formData, "description"), isVisible: checkbox(formData, "isVisible", true), displayOrder: integer(formData, "displayOrder") } });
  revalidateProfile(profile);
  redirectTo(profile.id, "gallery");
}

export async function updateGalleryItemAction(profileId: string, galleryItemId: string, formData: FormData) {
  const profile = await requireProfile(profileId);
  const previous = await ensureGalleryItem(profile.id, galleryItemId);
  const image = await readImageIntent(formData, "image", "gallery");
  if (image.value === null) throw new Error("Une image est obligatoire pour la galerie.");
  await prisma.galleryItem.update({ where: { id: galleryItemId }, data: { title: optionalString(formData, "title"), ...applyRequiredImageUpdate(image), description: optionalString(formData, "description"), isVisible: checkbox(formData, "isVisible"), displayOrder: integer(formData, "displayOrder") } });
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
  if (!item || item.profileId !== profile.id) throw new Error("Image introuvable pour ce profil.");
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
  if (!item || item.profileId !== profile.id) throw new Error("Lien introuvable pour ce profil.");
  await prisma.customLink.update({ where: { id: customLinkId }, data: { isVisible: !item.isVisible } });
  revalidateProfile(profile);
}

