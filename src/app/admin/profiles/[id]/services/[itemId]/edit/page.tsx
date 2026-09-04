import { AdminHeader } from "@/components/admin/AdminHeader";
import { ServiceForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateServiceAction } from "../../../content-actions";

type PageProps = { params: Promise<{ id: string; itemId: string }> };

export default async function EditServicePage({ params }: PageProps) {
  const { id, itemId } = await params;
  const service = await prisma.service.findFirst({ where: { id: itemId, profileId: id }, include: { profile: { select: { id: true, displayName: true } } } });
  if (!service) notFound();
  return <div><AdminHeader eyebrow="Services" title={`Modifier ${service.name}`} description={service.profile.displayName} /><ServiceForm action={updateServiceAction.bind(null, service.profile.id, service.id)} submitLabel="Enregistrer" item={service} /></div>;
}