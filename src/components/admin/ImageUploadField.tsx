"use client";

import { ChangeEvent, DragEvent, useEffect, useId, useMemo, useRef, useState } from "react";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type ImageUploadFieldProps = {
  currentImageUrl?: string | null;
  label?: string;
  required?: boolean;
};

function validateFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "L'image doit etre au format JPG, PNG ou WebP.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "L'image ne doit pas depasser 4 Mo.";
  }

  return null;
}

function fileLabel(file: File | null) {
  if (!file) return "Aucun fichier selectionne";
  const size = file.size / (1024 * 1024);
  return `${file.name} - ${size.toFixed(size >= 1 ? 1 : 2)} Mo`;
}

export function ImageUploadField({ currentImageUrl, label = "Image", required = false }: ImageUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const hasPreview = previewUrl.length > 0 && !removeImage;

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const helperText = useMemo(() => fileLabel(selectedFile), [selectedFile]);

  function chooseFile(file: File | null) {
    setError(null);

    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0] ?? null);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files?.[0] ?? null);
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
    <div className="sm:col-span-2">
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
            <span className="mt-2 text-xs text-aodi-violet-700/70">JPG, PNG ou WebP - 4 Mo maximum</span>
          </div>
        )}
      </label>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 break-words text-sm text-aodi-violet-700/75">{helperText}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={replaceImage} className="rounded-lg border border-aodi-violet-200 bg-white px-4 py-2 text-xs font-semibold text-aodi-violet-900">{hasPreview ? "Remplacer" : "Ajouter une image"}</button>
          {hasPreview || selectedFile ? <button type="button" onClick={clearImage} className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700">Supprimer</button> : null}
        </div>
      </div>

      {error ? <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}

