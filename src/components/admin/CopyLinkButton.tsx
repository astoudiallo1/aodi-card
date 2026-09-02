"use client";

import { useState } from "react";

type CopyLinkButtonProps = {
  url: string;
  label?: string;
  copiedLabel?: string;
  variant?: "light" | "primary";
};

export function CopyLinkButton({ url, label = "Copier le lien", copiedLabel = "Lien copie", variant = "light" }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const className =
    variant === "primary"
      ? "inline-flex items-center justify-center rounded-lg bg-aodi-violet-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-aodi-violet-800"
      : "inline-flex items-center justify-center rounded-lg border border-aodi-violet-200 bg-white px-5 py-3 text-sm font-semibold text-aodi-violet-900 transition hover:border-aodi-gold hover:text-aodi-violet-700";

  return (
    <button type="button" onClick={copyLink} className={className}>
      {copied ? copiedLabel : label}
    </button>
  );
}