"use client";

import { readFormErrorMessage } from "@/lib/form-error";
import { useEffect } from "react";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Les erreurs "metier" (validation, image, stockage) voyagent dans le digest et sont affichees telles quelles.
// Toute autre erreur (base de donnees, reseau, bug) est une erreur technique : on ne l'attribue jamais a l'image.
export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error("[admin] erreur", error);
  }, [error]);

  const formMessage = readFormErrorMessage(error) ?? (process.env.NODE_ENV !== "production" ? error.message : null);

  return (
    <section className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-aodi-violet-900 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">Enregistrement impossible</p>
      <h2 className="mt-2 font-display text-2xl font-semibold">{formMessage ? "Verifie le formulaire" : "Erreur technique"}</h2>
      <p className="mt-3 text-sm leading-relaxed text-aodi-violet-900/80">
        {formMessage ?? "Les informations n'ont pas pu etre enregistrees a cause d'une erreur technique (base de donnees ou serveur), pas d'un probleme d'image. Reessaie dans quelques instants ; si le probleme persiste, transmets la reference ci-dessous au support."}
      </p>
      {error.digest && !formMessage ? <p className="mt-2 text-xs text-aodi-violet-700/60">Reference : {error.digest}</p> : null}
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => reset()} className="rounded-lg bg-aodi-violet-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-aodi-violet-800">Reessayer</button>
        <button type="button" onClick={() => window.history.back()} className="rounded-lg border border-aodi-violet-200 bg-white px-5 py-2.5 text-sm font-semibold text-aodi-violet-900">Retour</button>
      </div>
    </section>
  );
}
