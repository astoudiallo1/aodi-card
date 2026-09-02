export function getPublicAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    const publicUrl = configuredUrl.replace(/\/$/, "");

    if (process.env.NODE_ENV === "production" && /localhost|127\.0\.0\.1/i.test(publicUrl)) {
      throw new Error("NEXT_PUBLIC_APP_URL ne doit pas pointer vers localhost en production.");
    }

    return publicUrl;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_APP_URL doit etre configure en production pour generer les QR Codes.");
  }

  return "http://localhost:3000";
}

export function getProfilePublicUrl(slug: string) {
  return `${getPublicAppUrl()}/${slug}`;
}
