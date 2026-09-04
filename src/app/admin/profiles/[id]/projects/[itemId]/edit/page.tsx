import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProjectForm } from "@/components/admin/ProfileContentForms";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateProjectAction } from "../../../content-actions";

type PageProps = { params: Promise<{ id: string; itemId: string }> };

export default async function EditProjectPage({ params }: PageProps) {
  const { id, itemId } = await params;
  const project = await prisma.project.findFirst({ where: { id: itemId, profileId: id }, include: { profile: { select: { id: true, displayName: true } } } });
  if (!project) notFound();
  return <div><AdminHeader eyebrow="Projets" title={`Modifier ${project.title}`} description={project.profile.displayName} /><ProjectForm action={updateProjectAction.bind(null, project.profile.id, project.id)} submitLabel="Enregistrer" item={project} /></div>;
}