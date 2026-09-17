/**
 * Lien de commande d'un produit, commun au profil public et a la page Boutique.
 *
 * Priorite : URL de commande du produit > numero WhatsApp du produit > WhatsApp du profil.
 * La disponibilite (`isAvailable`) est un etat distinct : un produit disponible sans aucun lien reste
 * "Disponible" (jamais "Indisponible"), et un produit indisponible n'a jamais de lien de commande.
 */

export type OrderableProduct = {
  name: string;
  price: number;
  currency: string;
  orderUrl: string | null;
  whatsappNumber: string | null;
  isAvailable: boolean;
};

export function formatProductPrice(value: number | null, currency = "FCFA") {
  if (value === null) return null;
  return `${new Intl.NumberFormat("fr-FR").format(value)} ${currency}`;
}

/** Chiffres d'un numero WhatsApp saisi tel quel ("+223 64 76 32 48") ou sous forme de lien (wa.me/..., ?phone=...). */
export function whatsappDigits(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const fromQuery = url.searchParams.get("phone");
      const fromPath = url.pathname.split("/").filter(Boolean).pop() ?? "";
      const digits = (fromQuery ?? fromPath).replace(/\D/g, "");
      return digits.length > 0 ? digits : null;
    } catch {
      return null;
    }
  }
  const digits = trimmed.replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

export function productOrderHref(product: OrderableProduct, fallbackWhatsapp: string | null | undefined): string | null {
  if (!product.isAvailable) return null;
  if (product.orderUrl) return product.orderUrl;

  const digits = whatsappDigits(product.whatsappNumber) ?? whatsappDigits(fallbackWhatsapp);
  if (!digits) return null;

  const text = `Bonjour, je souhaite commander :\n${product.name}\nPrix : ${formatProductPrice(product.price, product.currency)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
