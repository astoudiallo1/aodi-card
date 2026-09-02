import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { createProfileAction } from "../actions";

export default function NewProfilePage() {
  return (
    <div>
      <AdminHeader
        eyebrow="Nouveau profil"
        title="Creer un client"
        description="Renseignez les informations du client. Le slug sera genere automatiquement depuis le nom affiche et restera stable ensuite."
      />
      <ProfileForm action={createProfileAction} submitLabel="Creer le profil" />
    </div>
  );
}
