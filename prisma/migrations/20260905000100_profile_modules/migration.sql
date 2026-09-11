CREATE TYPE "ProfileSectionType" AS ENUM ('SOCIALS', 'CONTACT', 'SERVICES', 'PRODUCTS', 'PROJECTS', 'GALLERY', 'CUSTOM_LINKS', 'MUSIC', 'EVENTS', 'STATS', 'ABOUT', 'CTA');

CREATE TABLE "ProfileSection" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "type" "ProfileSectionType" NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "title" TEXT,
  "config" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProfileSection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProfileStat" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "icon" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProfileStat_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MusicTrack" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "artist" TEXT,
  "coverUrl" TEXT,
  "audioUrl" TEXT,
  "spotifyUrl" TEXT,
  "appleUrl" TEXT,
  "youtubeUrl" TEXT,
  "duration" TEXT,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "releaseDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MusicTrack_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProfileEvent" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "location" TEXT,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "externalUrl" TEXT,
  "imageUrl" TEXT,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProfileEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProfileSection_profileId_type_key" ON "ProfileSection"("profileId", "type");
CREATE INDEX "ProfileSection_profileId_idx" ON "ProfileSection"("profileId");
CREATE INDEX "ProfileSection_enabled_idx" ON "ProfileSection"("enabled");
CREATE INDEX "ProfileSection_sortOrder_idx" ON "ProfileSection"("sortOrder");
CREATE INDEX "ProfileStat_profileId_idx" ON "ProfileStat"("profileId");
CREATE INDEX "ProfileStat_isVisible_idx" ON "ProfileStat"("isVisible");
CREATE INDEX "ProfileStat_sortOrder_idx" ON "ProfileStat"("sortOrder");
CREATE INDEX "MusicTrack_profileId_idx" ON "MusicTrack"("profileId");
CREATE INDEX "MusicTrack_isVisible_idx" ON "MusicTrack"("isVisible");
CREATE INDEX "MusicTrack_isFeatured_idx" ON "MusicTrack"("isFeatured");
CREATE INDEX "MusicTrack_sortOrder_idx" ON "MusicTrack"("sortOrder");
CREATE INDEX "ProfileEvent_profileId_idx" ON "ProfileEvent"("profileId");
CREATE INDEX "ProfileEvent_isVisible_idx" ON "ProfileEvent"("isVisible");
CREATE INDEX "ProfileEvent_startDate_idx" ON "ProfileEvent"("startDate");
CREATE INDEX "ProfileEvent_sortOrder_idx" ON "ProfileEvent"("sortOrder");

ALTER TABLE "ProfileSection" ADD CONSTRAINT "ProfileSection_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProfileStat" ADD CONSTRAINT "ProfileStat_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MusicTrack" ADD CONSTRAINT "MusicTrack_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProfileEvent" ADD CONSTRAINT "ProfileEvent_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
