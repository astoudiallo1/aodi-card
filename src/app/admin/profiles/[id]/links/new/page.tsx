import { AdminHeader } from "@/components/admin/AdminHeader";
import { CustomLinkForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createCustomLinkAction } from "../../content-actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function NewCustomLinkPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true } });
  if (!profile) notFound();
  return <div><AdminHeader eyebrow="Liens" title={`Nouveau lien - ${profile.displayName}`} /><CustomLinkForm action={createCustomLinkAction.bind(null, profile.id)} submitLabel="Ajouter le lien" /></div>;
}