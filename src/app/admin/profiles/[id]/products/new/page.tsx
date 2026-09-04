import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createProductAction } from "../../content-actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function NewProductPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true } });
  if (!profile) notFound();
  return <div><AdminHeader eyebrow="Boutique" title={`Nouveau produit - ${profile.displayName}`} /><ProductForm action={createProductAction.bind(null, profile.id)} submitLabel="Ajouter le produit" /></div>;
}