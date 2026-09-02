import { AdminHeader } from "@/components/admin/AdminHeader";
import { OrderForm, type OrderFormValues } from "@/components/admin/OrderForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateOrderAction } from "../../actions";

type EditOrderPageProps = { params: Promise<{ id: string }> };

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();

  const values: OrderFormValues = {
    customerName: order.customerName,
    customerPhone: order.customerPhone ?? "",
    customerEmail: order.customerEmail ?? "",
    companyName: order.companyName ?? "",
    quantity: order.quantity,
    unitPrice: order.unitPrice,
    notes: order.notes ?? "",
  };

  return (
    <div>
      <AdminHeader
        eyebrow="Modifier commande"
        title={order.orderNumber}
        description="Le numero de commande reste stable."
      />
      <OrderForm action={updateOrderAction.bind(null, order.id)} submitLabel="Enregistrer la commande" order={values} />
    </div>
  );
}
