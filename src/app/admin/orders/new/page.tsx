import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderForm } from "@/components/admin/OrderForm";
import { createOrderAction } from "../actions";

export default function NewOrderPage() {
  return (
    <div>
      <AdminHeader
        eyebrow="Nouvelle commande"
        title="Enregistrer une commande"
        description="Le numero de commande est genere automatiquement. Le paiement reste gere manuellement pour cette etape."
      />
      <OrderForm action={createOrderAction} submitLabel="Creer la commande" />
    </div>
  );
}
