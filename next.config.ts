import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: projectRoot,
  experimental: {
    // Uploads d'images via Server Actions : les fichiers sont optimises dans le navigateur avant envoi
    // (src/lib/browser-image.ts). 4 Mo reste sous le plafond Vercel de 4,5 Mo par requete.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
