import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProjectForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createProjectAction } from "../../content-actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function NewProjectPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { id: true, displayName: true } });
  if (!profile) notFound();
  return <div><AdminHeader eyebrow="Projets" title={`Nouveau projet - ${profile.displayName}`} /><ProjectForm action={createProjectAction.bind(null, profile.id)} submitLabel="Ajouter le projet" /></div>;
}