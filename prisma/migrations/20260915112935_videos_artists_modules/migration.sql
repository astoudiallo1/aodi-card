-- Migration strictement additive : deux valeurs d'enum + une table. Aucun DROP, aucun RENAME.
-- (PostgreSQL >= 12 : les nouvelles valeurs ne sont pas utilisees dans cette meme migration.)
-- Note : l'index Product_createdAt_idx (cree par 20260902221500) n'est plus declare dans schema.prisma ;
-- ce drift preexistant est volontairement laisse tel quel ici.

-- AlterEnum
ALTER TYPE "ProfileSectionType" ADD VALUE 'VIDEOS';
ALTER TYPE "ProfileSectionType" ADD VALUE 'ARTISTS';

-- CreateTable
CREATE TABLE "ManagedArtist" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "description" TEXT,
    "photoUrl" TEXT,
    "youtubeChannelUrl" TEXT,
    "youtubeChannelId" TEXT,
    "youtubeChannelTitle" TEXT,
    "youtubeChannelHandle" TEXT,
    "youtubeUploadsPlaylistId" TEXT,
    "featuredVideoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagedArtist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ManagedArtist_profileId_idx" ON "ManagedArtist"("profileId");

-- CreateIndex
CREATE INDEX "ManagedArtist_isVisible_idx" ON "ManagedArtist"("isVisible");

-- CreateIndex
CREATE INDEX "ManagedArtist_sortOrder_idx" ON "ManagedArtist"("sortOrder");

-- AddForeignKey
ALTER TABLE "ManagedArtist" ADD CONSTRAINT "ManagedArtist_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
