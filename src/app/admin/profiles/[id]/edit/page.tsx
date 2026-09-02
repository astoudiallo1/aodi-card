import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileForm, type AdminProfileFormData } from "@/components/admin/ProfileForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateProfileAction } from "../../actions";

type EditProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id } });

  if (!profile) {
    notFound();
  }

  const formProfile: AdminProfileFormData = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    displayName: profile.displayName,
    jobTitle: profile.jobTitle ?? "",
    company: profile.company ?? "",
    bio: profile.bio ?? "",
    phone: profile.phone ?? "",
    whatsapp: profile.whatsapp ?? "",
    email: profile.email ?? "",
    instagram: profile.instagram ?? "",
    snapchat: profile.snapchat ?? "",
    tiktok: profile.tiktok ?? "",
    facebook: profile.facebook ?? "",
    linkedin: profile.linkedin ?? "",
    website: profile.website ?? "",
    address: profile.address ?? "",
    profilePhoto: profile.profilePhoto,
    coverPhoto: profile.coverPhoto,
  };

  return (
    <div>
      <AdminHeader
        eyebrow="Modifier"
        title={profile.displayName}
        description={`Slug stable : /${profile.slug}. Il ne sera pas modifie automatiquement.`}
      />
      <ProfileForm
        action={updateProfileAction.bind(null, profile.id)}
        submitLabel="Enregistrer les modifications"
        profile={formProfile}
      />
    </div>
  );
}

