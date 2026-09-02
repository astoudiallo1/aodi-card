import type { PublicProfile } from "@/types/profile";

function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function generateVCard(profile: PublicProfile): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard(profile.lastName)};${escapeVCard(profile.firstName)};;;`,
    `FN:${escapeVCard(profile.displayName)}`,
  ];

  if (profile.jobTitle) {
    lines.push(`TITLE:${escapeVCard(profile.jobTitle)}`);
  }

  if (profile.company) {
    lines.push(`ORG:${escapeVCard(profile.company)}`);
  }

  if (profile.phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCard(profile.phone)}`);
  }

  if (profile.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(profile.email)}`);
  }

  if (profile.website) {
    lines.push(`URL:${escapeVCard(profile.website)}`);
  }

  if (profile.address) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(profile.address)};;;;`);
  }

  if (profile.bio) {
    lines.push(`NOTE:${escapeVCard(profile.bio)}`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}
