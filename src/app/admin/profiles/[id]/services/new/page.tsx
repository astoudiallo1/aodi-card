import { AdminHeader } from "@/components/admin/AdminHeader";
import { ServiceForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createServiceAction } from "../../content-actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function NewServicePage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true } });
  if (!profile) notFound();
  return <div><AdminHeader eyebrow="Services" title={`Nouveau service - ${profile.displayName}`} /><ServiceForm action={createServiceAction.bind(null, profile.id)} submitLabel="Ajouter le service" /></div>;
}