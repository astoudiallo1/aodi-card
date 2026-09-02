import { prisma } from "@/lib/prisma";

export function generateSlug(name: string, lastName?: string): string {
  const source = lastName ? `${name}-${lastName}` : name;

  return source
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "profil";
}

export async function generateUniqueProfileSlug(displayName: string): Promise<string> {
  const baseSlug = generateSlug(displayName);
  let slug = baseSlug;
  let suffix = 2;

  while (await prisma.profile.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
