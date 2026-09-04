-- Add modular profile content tables without deleting existing data.
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "ownerToken" TEXT;

UPDATE "Profile"
SET "ownerToken" = md5(random()::text || clock_timestamp()::text || "id")
WHERE "ownerToken" IS NULL;

ALTER TABLE "Profile" ALTER COLUMN "ownerToken" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Profile_ownerToken_key" ON "Profile"("ownerToken");

CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "oldPrice" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'FCFA',
    "imageUrl" TEXT,
    "whatsappNumber" TEXT,
    "orderUrl" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "oldPrice" INTEGER;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "whatsappNumber" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "orderUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isVisible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isAvailable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "Service" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER,
    "currency" TEXT,
    "imageUrl" TEXT,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "websiteUrl" TEXT,
    "appUrl" TEXT,
    "githubUrl" TEXT,
    "technologies" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GalleryItem" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CustomLink" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomLink_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Product_profileId_idx" ON "Product"("profileId");
CREATE INDEX IF NOT EXISTS "Product_isVisible_idx" ON "Product"("isVisible");
CREATE INDEX IF NOT EXISTS "Product_isActive_idx" ON "Product"("isActive");
CREATE INDEX IF NOT EXISTS "Product_isFeatured_idx" ON "Product"("isFeatured");
CREATE INDEX IF NOT EXISTS "Product_displayOrder_idx" ON "Product"("displayOrder");

CREATE INDEX IF NOT EXISTS "Service_profileId_idx" ON "Service"("profileId");
CREATE INDEX IF NOT EXISTS "Service_isVisible_idx" ON "Service"("isVisible");
CREATE INDEX IF NOT EXISTS "Service_displayOrder_idx" ON "Service"("displayOrder");

CREATE INDEX IF NOT EXISTS "Project_profileId_idx" ON "Project"("profileId");
CREATE INDEX IF NOT EXISTS "Project_isVisible_idx" ON "Project"("isVisible");
CREATE INDEX IF NOT EXISTS "Project_isFeatured_idx" ON "Project"("isFeatured");
CREATE INDEX IF NOT EXISTS "Project_displayOrder_idx" ON "Project"("displayOrder");

CREATE INDEX IF NOT EXISTS "GalleryItem_profileId_idx" ON "GalleryItem"("profileId");
CREATE INDEX IF NOT EXISTS "GalleryItem_isVisible_idx" ON "GalleryItem"("isVisible");
CREATE INDEX IF NOT EXISTS "GalleryItem_displayOrder_idx" ON "GalleryItem"("displayOrder");

CREATE INDEX IF NOT EXISTS "CustomLink_profileId_idx" ON "CustomLink"("profileId");
CREATE INDEX IF NOT EXISTS "CustomLink_isVisible_idx" ON "CustomLink"("isVisible");
CREATE INDEX IF NOT EXISTS "CustomLink_displayOrder_idx" ON "CustomLink"("displayOrder");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Product_profileId_fkey') THEN
    ALTER TABLE "Product" ADD CONSTRAINT "Product_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Service_profileId_fkey') THEN
    ALTER TABLE "Service" ADD CONSTRAINT "Service_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Project_profileId_fkey') THEN
    ALTER TABLE "Project" ADD CONSTRAINT "Project_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GalleryItem_profileId_fkey') THEN
    ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CustomLink_profileId_fkey') THEN
    ALTER TABLE "CustomLink" ADD CONSTRAINT "CustomLink_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;