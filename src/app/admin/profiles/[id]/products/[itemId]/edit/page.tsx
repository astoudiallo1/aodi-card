import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateProductAction } from "../../../content-actions";

type PageProps = { params: Promise<{ id: string; itemId: string }> };

export default async function EditProductPage({ params }: PageProps) {
  const { id, itemId } = await params;
  const product = await prisma.product.findFirst({ where: { id: itemId, profileId: id }, include: { profile: { select: { id: true, displayName: true } } } });
  if (!product) notFound();
  return <div><AdminHeader eyebrow="Boutique" title={`Modifier ${product.name}`} description={product.profile.displayName} /><ProductForm action={updateProductAction.bind(null, product.profile.id, product.id)} submitLabel="Enregistrer" item={product} /></div>;
}