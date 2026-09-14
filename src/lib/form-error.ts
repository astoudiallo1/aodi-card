/**
 * Erreur "metier" d'un formulaire admin (validation, image, stockage), affichable telle quelle.
 *
 * En production, Next remplace le message des erreurs levees dans une Server Action par un texte generique
 * et ne transmet que `digest`. Un digest deja present est conserve : le message est donc transporte dans le digest
 * pour que `src/app/admin/error.tsx` puisse l'afficher. Les autres erreurs (base de donnees, reseau, bug)
 * gardent leur digest opaque et sont presentees comme une erreur technique, jamais comme une erreur d'image.
 */

const DIGEST_PREFIX = "aodi-form:";
const MAX_MESSAGE_LENGTH = 300;

export class FormError extends Error {
  digest: string;

  constructor(message: string) {
    super(message);
    this.name = "FormError";
    this.digest = `${DIGEST_PREFIX}${message.slice(0, MAX_MESSAGE_LENGTH)}`;
  }
}

export function readFormErrorMessage(error: { digest?: string; message?: string } | null | undefined): string | null {
  const digest = error?.digest;
  if (typeof digest === "string" && digest.startsWith(DIGEST_PREFIX)) return digest.slice(DIGEST_PREFIX.length);
  return null;
}
