"use client";

import { ChangeEvent, DragEvent, useEffect, useId, useRef, useState } from "react";
import { formatBytes, IMAGE_HELP_TEXT, prepareImageForUpload, replaceInputFile, validateImageFile, type PreparedImage } from "@/lib/browser-image";

// Au-dela, un original non optimise depasserait la limite d'envoi du serveur (voir browser-image.ts).
const MAX_UNOPTIMIZED_BYTES = 3 * 1024 * 1024;

type ImageUploadFieldProps = {
  currentImageUrl?: string | null;
  label?: string;
  required?: boolean;
};

function fileLabel(prepared: PreparedImage | null) {
  if (!prepared) return "Aucun fichier selectionne";
  const { file, optimized, originalBytes, width, height } = prepared;
  if (!optimized) return `${file.name} - ${formatBytes(file.size)} (${width} x ${height} px)`;
  return `${file.name} - ${formatBytes(originalBytes)} optimisee en ${formatBytes(file.size)} (${width} x ${height} px)`;
}

export function ImageUploadField({ currentImageUrl, label = "Image", required = false }: ImageUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl ?? "");
  const [selectedFile, setSelectedFile] = useState<PreparedImage | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const hasPreview = previewUrl.length > 0 && !removeImage;

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const helperText = isOptimizing ? "Optimisation de l'image en cours..." : fileLabel(selectedFile);

  function resetInput() {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  // Le fichier est valide puis optimise dans le navigateur ; l'input recoit la version optimisee, envoyee par le formulaire.
  async function chooseFile(file: File | null) {
    setError(null);
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      resetInput();
      return;
    }

    // Pendant l'optimisation, l'input est vide : une soumission ne peut pas envoyer l'original trop lourd.
    if (inputRef.current) inputRef.current.value = "";
    setIsOptimizing(true);

    try {
      const prepared = await prepareImageForUpload(file);
      const input = inputRef.current;
      if (!input) return;

      if (!replaceInputFile(input, prepared.file)) {
        if (prepared.file.size > MAX_UNOPTIMIZED_BYTES) {
          setError("Ce navigateur ne permet pas l'optimisation automatique : choisis une image de moins de 3 Mo.");
          resetInput();
          return;
        }
        // Navigateur sans DataTransfer : l'original (assez leger) est renvoye a l'input.
        replaceInputFile(input, file);
      }

      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setSelectedFile(prepared);
      setPreviewUrl(URL.createObjectURL(prepared.file));
      setRemoveImage(false);
    } catch (optimizationError) {
      setError(optimizationError instanceof Error ? optimizationError.message : "Impossible de traiter cette image.");
      resetInput();
    } finally {
      setIsOptimizing(false);
    }
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    void chooseFile(event.target.files?.[0] ?? null);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    void chooseFile(event.dataTransfer.files?.[0] ?? null);
  }

  function clearImage() {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setSelectedFile(null);
    setRemoveImage(true);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function replaceImage() {
    inputRef.current?.click();
  }

  return (
    <div className="sm:col-span-2" data-optimizing={isOptimizing ? "true" : undefined}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-aodi-violet-700/70">{label}</span>
      <input name="removeImage" type="hidden" value={removeImage ? "true" : "false"} />
      <input ref={inputRef} id={inputId} name="image" type="file" accept="image/jpeg,image/png,image/webp" required={required && !currentImageUrl && !selectedFile} onChange={onInputChange} className="sr-only" />

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`mt-2 flex min-h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed bg-white text-center transition ${isDragging ? "border-aodi-gold ring-2 ring-aodi-gold/20" : "border-aodi-violet-200 hover:border-aodi-gold"}`}
      >
        {hasPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Apercu de l'image" className="h-56 w-full object-cover" />
        ) : (
          <div className="flex h-56 w-full flex-col items-center justify-center bg-aodi-violet-950/5 px-4 text-aodi-violet-900">
            <span className="text-sm font-bold">Ajouter une image</span>
            <span className="mt-2 text-xs text-aodi-violet-700/70">{IMAGE_HELP_TEXT}</span>
          </div>
        )}
      </label>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 break-words text-sm text-aodi-violet-700/75" aria-live="polite">{helperText}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={replaceImage} className="rounded-lg border border-aodi-violet-200 bg-white px-4 py-2 text-xs font-semibold text-aodi-violet-900">{hasPreview ? "Remplacer" : "Ajouter une image"}</button>
          {hasPreview || selectedFile ? <button type="button" onClick={clearImage} className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700">Supprimer</button> : null}
        </div>
      </div>

      {error ? <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}

