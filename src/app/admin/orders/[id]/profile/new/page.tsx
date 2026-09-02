import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileForm, type AdminProfileFormData } from "@/components/admin/ProfileForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createProfileFromOrderAction } from "../../../actions";

type NewProfileFromOrderPageProps = { params: Promise<{ id: string }> };

function splitName(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return {
    firstName: parts[0] ?? name,
    lastName: parts.slice(1).join(" "),
  };
}

export default async function NewProfileFromOrderPage({ params }: NewProfileFromOrderPageProps) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();

  const names = splitName(order.customerName);
  const profile: AdminProfileFormData = {
    firstName: names.firstName,
    lastName: names.lastName,
    displayName: order.customerName,
    jobTitle: "",
    company: order.companyName ?? "",
    bio: "",
    phone: order.customerPhone ?? "",
    whatsapp: order.customerPhone ?? "",
    email: order.customerEmail ?? "",
    instagram: "",
    snapchat: "",
    tiktok: "",
    facebook: "",
    linkedin: "",
    website: "",
    address: "",
    profilePhoto: null,
    coverPhoto: null,
  };

  return (
    <div>
      <AdminHeader
        eyebrow="Profil depuis commande"
        title="Creer le profil AODI Card"
        description={`Commande ${order.orderNumber}. Les informations client sont deja reprises.`}
      />
      <ProfileForm action={createProfileFromOrderAction.bind(null, order.id)} submitLabel="Creer et associer le profil" profile={profile} />
    </div>
  );
}

