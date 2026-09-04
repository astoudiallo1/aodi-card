import { AdminHeader } from "@/components/admin/AdminHeader";
import { CustomLinkForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateCustomLinkAction } from "../../../content-actions";

type PageProps = { params: Promise<{ id: string; itemId: string }> };

export default async function EditCustomLinkPage({ params }: PageProps) {
  const { id, itemId } = await params;
  const link = await prisma.customLink.findFirst({ where: { id: itemId, profileId: id }, include: { profile: { select: { id: true, displayName: true } } } });
  if (!link) notFound();
  return <div><AdminHeader eyebrow="Liens" title={`Modifier ${link.label}`} description={link.profile.displayName} /><CustomLinkForm action={updateCustomLinkAction.bind(null, link.profile.id, link.id)} submitLabel="Enregistrer" item={link} /></div>;
}