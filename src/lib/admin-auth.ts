import { headers } from "next/headers";

export function isAdminProtectionConfigured() {
  return Boolean(process.env.AODI_ADMIN_PASSWORD);
}

function readBasicPassword(authorization: string | null) {
  if (!authorization?.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = Buffer.from(authorization.replace("Basic ", ""), "base64").toString("utf8");
    const separatorIndex = decoded.indexOf(":");
    return separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : null;
  } catch {
    return null;
  }
}

export async function requireAdminAccess() {
  const password = process.env.AODI_ADMIN_PASSWORD;

  if (!password) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("L'administration AODI Card doit etre protegee avant la mise en production.");
    }

    return true;
  }

  const requestHeaders = await headers();
  const providedPassword = readBasicPassword(requestHeaders.get("authorization"));

  if (providedPassword !== password) {
    throw new Error("Acces administrateur refuse.");
  }

  return true;
}
