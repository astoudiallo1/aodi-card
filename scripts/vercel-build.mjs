/**
 * Point d'entree du build Vercel (script "vercel-build" de package.json, prioritaire sur "build").
 *
 * - Build PRODUCTION Vercel (VERCEL_ENV=production) : `prisma migrate deploy` s'execute d'abord avec la
 *   DATABASE_URL injectee par Vercel (secret jamais lu ni affiche ici). Si une migration echoue, le build
 *   s'arrete et le deploiement precedent reste en ligne.
 * - Build PREVIEW / DEVELOPMENT Vercel : aucune migration, `npm run build` seulement.
 * - Local (VERCEL_ENV absent) : aucune migration ; `npm run build` garde son comportement habituel.
 *
 * Node pur : fonctionne aussi bien dans le shell Linux de Vercel que sous Windows en local.
 */
import { spawnSync } from "node:child_process";

const vercelEnv = process.env.VERCEL_ENV ?? null;
const shouldMigrate = vercelEnv === "production";

function run(command, args) {
  console.log(`[vercel-build] $ ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.error) {
    console.error(`[vercel-build] impossible de lancer ${command} :`, result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`[vercel-build] ${command} ${args[0] ?? ""} a echoue (code ${result.status ?? "inconnu"}) : build arrete.`);
    process.exit(result.status ?? 1);
  }
}

if (shouldMigrate) {
  console.log("[vercel-build] VERCEL_ENV=production : application des migrations Prisma en attente avant le build.");
  run("npx", ["prisma", "migrate", "deploy"]);
} else {
  console.log(`[vercel-build] VERCEL_ENV=${vercelEnv ?? "(absent)"} : migrations ignorees, build uniquement.`);
}

run("npm", ["run", "build"]);
